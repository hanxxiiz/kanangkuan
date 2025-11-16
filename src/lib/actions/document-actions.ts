'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { processDocument } from './process-document';


const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'pptx', 'xlsx', 'csv'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_CONCURRENT_UPLOADS = 5;
const LOCK_TIMEOUT = 300000; // 5 minutes

interface UploadResult {
  success: boolean;
  error?: string;
  importId?: string;
}

async function acquireLock(supabase: any, userId: string): Promise<boolean> {
  try {
    const expiryTime = new Date(Date.now() - LOCK_TIMEOUT);
    
    // Clean up expired locks
    await supabase
      .from('ai_import_locks')
      .delete()
      .lt('created_at', expiryTime.toISOString());

    // Check current lock count
    const { count, error: countError } = await supabase
      .from('ai_import_locks')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting locks:', countError);
      return false;
    }

    if (count !== null && count >= MAX_CONCURRENT_UPLOADS) {
      return false;
    }

    // Insert new lock
    const { error: insertError } = await supabase
      .from('ai_import_locks')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      // Duplicate lock or other error
      if (insertError.code === '23505') {
        return false;
      }
      console.error('Error creating lock:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Lock acquisition error:', error);
    return false;
  }
}

async function releaseLock(supabase: any, userId: string): Promise<void> {
  try {
    await supabase
      .from('ai_import_locks')
      .delete()
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error releasing lock:', error);
  }
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  let supabase;
  let userId: string | null = null;

  try {
    supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication failed' };
    }
    
    userId = user.id;

    const file = formData.get('file') as File | null;
    const deckId = formData.get('deckId') as string | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!deckId) {
      return { success: false, error: 'Deck ID is required' };
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return { 
        success: false, 
        error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: 'File size exceeds 8MB limit' 
      };
    }

    // Acquire lock
    const lockAcquired = await acquireLock(supabase, user.id);
    if (!lockAcquired) {
      return { 
        success: false, 
        error: 'Upload limit reached. Please try again in a few minutes.' 
      };
    }

    // Prepare file for upload
    const timestamp = Date.now();
    const fileName = `${user.id}/${deckId}/${timestamp}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError || !uploadData?.path) {
      await releaseLock(supabase, user.id);
      return { 
        success: false, 
        error: uploadError ? `Upload failed: ${uploadError.message}` : 'Upload failed - no file path returned'
      };
    }

    // Create database record
    const { data: importRecord, error: insertError } = await supabase
      .from('ai_imports')
      .insert({
        user_id: user.id,
        deck_id: deckId,
        file_name: file.name,
        file_path: uploadData.path,
        file_type: fileExtension,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from('documents').remove([uploadData.path]);
      await releaseLock(supabase, user.id);
      return { 
        success: false, 
        error: `Failed to save import record: ${insertError.message}` 
      };
    }

    await releaseLock(supabase, user.id);
    revalidatePath(`/dashboard/my-decks/${deckId}`);

    processDocument(importRecord.id).catch(console.error);

    return {
      success: true,
      importId: importRecord.id,
    };

  } catch (error) {
    if (userId && supabase) {
      await releaseLock(supabase, userId);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function checkLockAvailability(): Promise<{
  available: boolean;
  activeCount: number;
}> {
  try {
    const supabase = await createClient();
    
    const expiryTime = new Date(Date.now() - LOCK_TIMEOUT);
    await supabase
      .from('ai_import_locks')
      .delete()
      .lt('created_at', expiryTime.toISOString());

    const { count, error } = await supabase
      .from('ai_import_locks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking locks:', error);
      return { available: false, activeCount: MAX_CONCURRENT_UPLOADS };
    }

    const activeCount = count || 0;
    return {
      available: activeCount < MAX_CONCURRENT_UPLOADS,
      activeCount
    };
  } catch (error) {
    console.error('Error checking lock availability:', error);
    return { available: false, activeCount: MAX_CONCURRENT_UPLOADS };
  }
}