'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { processDocument } from './process-document';


const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'pptx', 'xlsx', 'csv'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_CONCURRENT_UPLOADS = 5;

interface UploadResult {
  success: boolean;
  error?: string;
  importId?: string;
}

async function checkPendingUploads(supabase: any, userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('ai_imports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'processing']);
    
    if (error) {
      console.error('Error counting pending uploads:', error);
      return false;
    }

    return count !== null && count < MAX_CONCURRENT_UPLOADS;
  } catch (error) {
    console.error('Error checking pending uploads:', error);
    return false;
  }
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication failed' };
    }

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

    // Check pending uploads
    const canUpload = await checkPendingUploads(supabase, user.id);
    if (!canUpload) {
      return { 
        success: false, 
        error: 'Upload limit reached. Please wait for pending uploads to complete.' 
      };
    }

    // Prepare file for upload
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${timestamp}.${fileExt}`;
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
      return { 
        success: false, 
        error: `Failed to save import record: ${insertError.message}` 
      };
    }

    revalidatePath(`/dashboard/my-decks/${deckId}`);

    processDocument(importRecord.id).catch(console.error);

    return {
      success: true,
      importId: importRecord.id,
    };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

export async function checkUploadAvailability(): Promise<{
  available: boolean;
  pendingCount: number;
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { available: false, pendingCount: MAX_CONCURRENT_UPLOADS };
    }

    const { count, error } = await supabase
      .from('ai_imports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing']);

    if (error) {
      console.error('Error checking pending uploads:', error);
      return { available: false, pendingCount: MAX_CONCURRENT_UPLOADS };
    }

    const pendingCount = count || 0;
    return {
      available: pendingCount < MAX_CONCURRENT_UPLOADS,
      pendingCount
    };
  } catch (error) {
    console.error('Error checking upload availability:', error);
    return { available: false, pendingCount: MAX_CONCURRENT_UPLOADS };
  }
}