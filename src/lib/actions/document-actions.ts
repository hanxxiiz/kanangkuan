'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { processDocument } from './process-document';
import { SupabaseClient } from '@supabase/supabase-js';

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'pptx', 'xlsx', 'csv'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_CONCURRENT_UPLOADS = 5;

interface UploadResult {
  success: boolean;
  error?: string;
  importId?: string;
}

async function checkPendingUploads(supabase: SupabaseClient, userId: string): Promise<boolean> {
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
  console.log('===============================================================');
  console.log('[UPLOAD] DOCUMENT UPLOAD STARTED');
  console.log('[UPLOAD] Timestamp:', new Date().toISOString());
  console.log('===============================================================');
  
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('[UPLOAD] User ID:', user?.id);
    
    if (authError || !user) {
      console.error('[UPLOAD] AUTH FAILED:', authError);
      return { success: false, error: 'Authentication failed' };
    }

    const file = formData.get('file') as File | null;
    const deckId = formData.get('deckId') as string | null;

    console.log('[UPLOAD] File received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      deckId: deckId
    });

    if (!file) {
      console.error('[UPLOAD] ERROR: No file provided');
      return { success: false, error: 'No file provided' };
    }

    if (!deckId) {
      console.error('[UPLOAD] ERROR: No deck ID provided');
      return { success: false, error: 'Deck ID is required' };
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    console.log('[UPLOAD] File extension:', fileExtension);
    
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      console.error('[UPLOAD] ERROR: Unsupported file type:', fileExtension);
      return { 
        success: false, 
        error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('[UPLOAD] ERROR: File too large:', file.size);
      return { 
        success: false, 
        error: 'File size exceeds 8MB limit' 
      };
    }

    // Check pending uploads
    const canUpload = await checkPendingUploads(supabase, user.id);
    if (!canUpload) {
      console.error('[UPLOAD] ERROR: Upload limit reached');
      return { 
        success: false, 
        error: 'Upload limit reached. Please wait for pending uploads to complete.' 
      };
    }

    // Prepare file for upload
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${timestamp}.${fileExt}`;
    
    console.log('[UPLOAD] Storage filename:', fileName);
    console.log('[UPLOAD] Converting file to buffer...');
    
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    
    console.log('[UPLOAD] Buffer created, size:', buffer.length);

    // Upload to storage
    console.log('[UPLOAD] Uploading to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError || !uploadData?.path) {
      console.error('[UPLOAD] STORAGE UPLOAD FAILED:', uploadError);
      return { 
        success: false, 
        error: uploadError ? `Upload failed: ${uploadError.message}` : 'Upload failed - no file path returned'
      };
    }

    console.log('[UPLOAD] Storage upload successful, path:', uploadData.path);

    // Create database record
    console.log('[UPLOAD] Creating database record...');
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
      console.error('[UPLOAD] DATABASE INSERT FAILED:', insertError);
      await supabase.storage.from('documents').remove([uploadData.path]);
      return { 
        success: false, 
        error: `Failed to save import record: ${insertError.message}` 
      };
    }

    console.log('[UPLOAD] Database record created, import ID:', importRecord.id);
    console.log('[UPLOAD] Revalidating path...');
    revalidatePath(`/dashboard/my-decks/${deckId}`);

    console.log('[UPLOAD] Starting background processing...');
    processDocument(importRecord.id).catch((error) => {
      console.error('[UPLOAD] Background processing error:', error);
    });

    console.log('===============================================================');
    console.log('[UPLOAD] UPLOAD COMPLETED SUCCESSFULLY');
    console.log('[UPLOAD] Import ID:', importRecord.id);
    console.log('===============================================================');

    return {
      success: true,
      importId: importRecord.id,
    };

  } catch (error) {
    console.error('===============================================================');
    console.error('[UPLOAD] UNEXPECTED ERROR');
    console.error('[UPLOAD] Error:', error);
    console.error('===============================================================');
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