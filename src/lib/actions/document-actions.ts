//used to upload files to the supabase bucket
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'pdf', 'pptx', 'docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 10MB
const MAX_CONCURRENT_UPLOADS = 5;
const LOCK_TIMEOUT = 300000; // 5 minutes

interface UploadResult {
  success: boolean;
  error?: string;
  importId?: string;
  fileUrl?: string;
}

export async function uploadDocument(
  formData: FormData
): Promise<UploadResult> {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get file and deckId from formData
    const file = formData.get('file') as File;
    const deckId = formData.get('deckId') as string;

    if (!file || !deckId) {
      return { success: false, error: 'File and deckId are required' };
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return { 
        success: false, 
        error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}` 
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid MIME type' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size exceeds 10MB limit' };
    }

    // Try to acquire lock
    const lockAcquired = await acquireLock(supabase, user.id);
    if (!lockAcquired) {
      return { 
        success: false, 
        error: 'AI Import is currently at capacity. Please try again in a few minutes.' 
      };
    }

    try {
      // Upload file to Supabase Storage using user ID as filename
      const fileName = `${user.id}.${fileExtension}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Delete existing file if any (user can only have one file at a time)
      await supabase.storage
        .from('documents')
        .remove([fileName]);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Record the upload in database
      const { data: importRecord, error: insertError } = await supabase
        .from('ai_imports')
        .insert({
          user_id: user.id,
          deck_id: deckId,
          file_name: file.name,
          file_path: fileName,
          file_url: publicUrl,
          file_type: fileExtension,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([fileName]);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // Revalidate the deck page
      revalidatePath(`/dashboard/my-decks/${deckId}`);

      return {
        success: true,
        importId: importRecord.id,
        fileUrl: publicUrl
      };

    } finally {
      // Always release lock
      await releaseLock(supabase, user.id);
    }

  } catch (error) {
    console.error('AI Import error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    };
  }
}

async function acquireLock(supabase: any, userId: string): Promise<boolean> {
  try {
    // Clean up expired locks first
    const expiryTime = new Date(Date.now() - LOCK_TIMEOUT);
    await supabase
      .from('ai_import_locks')
      .delete()
      .lt('created_at', expiryTime.toISOString());

    // Count active locks
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

    // Try to create a lock
    const { error: insertError } = await supabase
      .from('ai_import_locks')
      .insert({
        user_id: userId,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      // Check if we hit the limit due to race condition
      if (insertError.code === '23505') { // Unique constraint violation
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

// Helper function to check lock status
export async function checkLockAvailability(): Promise<{
  available: boolean;
  activeCount: number;
}> {
  try {
    const supabase = await createClient();
    
    // Clean up expired locks
    const expiryTime = new Date(Date.now() - LOCK_TIMEOUT);
    await supabase
      .from('ai_import_locks')
      .delete()
      .lt('created_at', expiryTime.toISOString());

    // Count active locks
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