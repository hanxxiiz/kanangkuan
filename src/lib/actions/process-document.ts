/** DON'T REMOVE CONSOLE LOGS YET! ONLY WHEN LOADING ANIM OR LOADER IS IMPLEMENTED
 * ═══════════════════════════════════════════════════════════════════════════
 * DOCUMENT PROCESSING PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module handles AI-powered flashcard generation from uploaded documents.
 * 
 * PIPELINE FLOW:
 * ──────────────
 * 1. EXTRACT TEXT
 *    - Download document from Supabase Storage
 *    - Route to appropriate text extraction API based on file type
 *    - Supported: PDF, DOCX, PPTX, XLSX, CSV, TXT
 * 
 * 2. GENERATE FLASHCARDS
 *    - Send extracted text to AI (via /api/ai/generate-qna)
 *    - AI analyzes content and creates Q&A pairs
 *    - Maximum: 100 flashcards per document
 * 
 * 3. SAVE TO DATABASE
 *    - Insert flashcards into `cards` table
 *    - Save without wrong options for speed
 *    - Return card IDs for next step
 * 
 * 4. MARK COMPLETE & CLEANUP
 *    - Update `ai_imports` status to 'completed'
 *    - Delete source file from storage bucket
 *    - Users can now access flashcards
 * 
 * 5. BACKGROUND: GENERATE WRONG OPTIONS
 *    - Runs asynchronously after completion
 *    - Processes in parallel batches of 10
 *    - Calls /api/ai/generate-wrong-options for each card
 *    - Saves to `card_options` table
 * 
 * API ENDPOINTS USED:
 * ──────────────────
 * - /api/text-extraction/{pdf|docx|pptx|xlsx}
 * - /api/ai/generate-qna
 * - /api/ai/generate-wrong-options
 * 
 * DATABASE TABLES:
 * ───────────────
 * - ai_imports: Tracks processing status
 * - cards: Stores Q&A flashcards
 * - card_options: Stores wrong answer choices
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use server';

import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MAX_CARDS_PER_DOCUMENT = 100;
const MAX_TEXT_LENGTH = 100000; // characters
const CARD_BATCH_SIZE = 10;
const WRONG_OPTIONS_BATCH_SIZE = 10;
const BLANK_WORDS_BATCH_SIZE = 10;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ProcessResult {
  success: boolean;
  error?: string;
  cardsGenerated?: number;
}

interface GeneratedCard {
  front: string;
  back: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: TEXT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractTextFromDocument(
  supabase: SupabaseClient,
  filePath: string,
  fileType: string
): Promise<string> {
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  // Handle plain text directly
  if (fileType.toLowerCase() === 'txt') {
    const arrayBuffer = await fileData.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('utf-8');
  }

  // Route to appropriate extraction API
  const extractionEndpoints: Record<string, string> = {
    pdf: '/api/text-extraction/pdf',
    docx: '/api/text-extraction/docx',
    pptx: '/api/text-extraction/pptx',
    xlsx: '/api/text-extraction/xlsx',
    csv: '/api/text-extraction/xlsx',
  };

  const endpoint = extractionEndpoints[fileType.toLowerCase()];
  if (!endpoint) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const formData = new FormData();
  formData.append('file', fileData);
  formData.append('fileType', fileType);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Text extraction failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  console.log('Extraction result:', result); // Keep this for debugging
  
  // Updated to handle new response format
  if (!result.success) {
    const errorMsg = result.message || result.error || 'Text extraction failed';
    throw new Error(errorMsg);
  }

  if (!result.text || result.text.trim().length === 0) {
    throw new Error('No text content found in the document. The file may be empty or contain only images.');
  }

  return String(result.text).trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: FLASHCARD GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateFlashcards(text: string): Promise<GeneratedCard[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/ai/generate-qna`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text.slice(0, MAX_TEXT_LENGTH) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Flashcard generation failed');
  }

  const result = await response.json();
  
  const validCards = (result.flashcards || [])
    .filter((card: { front?: string; back?: string }) => 
      card?.front?.trim() && 
      card?.back?.trim() &&
      card.front.length <= 200 &&
      card.back.length <= 300
    )
    .map((card: { front: string; back: string }) => ({
      front: card.front.trim(),
      back: card.back.trim()
    }));

  if (validCards.length === 0) {
    throw new Error('No valid flashcards generated');
  }

  return validCards.slice(0, MAX_CARDS_PER_DOCUMENT);
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

async function saveCardsToDatabase(
  supabase: SupabaseClient,
  deckId: string,
  cards: GeneratedCard[]
): Promise<string[]> {
  const cardIds: string[] = [];

  for (let i = 0; i < cards.length; i += CARD_BATCH_SIZE) {
    const chunk = cards.slice(i, i + CARD_BATCH_SIZE);
    
    for (const card of chunk) {
      const { data: cardData, error } = await supabase
        .from('cards')
        .insert({
          deck_id: deckId,
          front: card.front,
          back: card.back,
          blank_word: null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && cardData) {
        cardIds.push(cardData.id);
      } else {
        console.error('Card insertion error:', error);
      }
    }
  }

  return cardIds;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5: BACKGROUND WRONG OPTIONS GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateWrongOptions(front: string, back: string): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/generate-wrong-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front, back }),
    });

    if (!response.ok) throw new Error(response.statusText);

    const result = await response.json();
    
    if (result.success && result.wrong_options) {
      return result.wrong_options;
    }
  } catch (_error) {
    console.error('Wrong options generation error:', _error);
  }
  
  return ['Option A', 'Option B', 'Option C'];
}

async function generateAndSaveWrongOptions(cardIds: string[]): Promise<void> {
  const supabase = await createClient();
  
  console.log('Background: Generating wrong options for', cardIds.length, 'cards');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < cardIds.length; i += WRONG_OPTIONS_BATCH_SIZE) {
    const batch = cardIds.slice(i, i + WRONG_OPTIONS_BATCH_SIZE);
    
    console.log(`Batch ${Math.floor(i / WRONG_OPTIONS_BATCH_SIZE) + 1}/${Math.ceil(cardIds.length / WRONG_OPTIONS_BATCH_SIZE)}`);
    
    const results = await Promise.allSettled(
      batch.map(async (cardId) => {
        const { data: card } = await supabase
          .from('cards')
          .select('front, back')
          .eq('id', cardId)
          .single();

        if (!card) return false;

        const wrongOptions = await generateWrongOptions(card.front, card.back);

        const { error } = await supabase
          .from('card_options')
          .insert({
            card_id: cardId,
            wrong_option_1: wrongOptions[0],
            wrong_option_2: wrongOptions[1],
            wrong_option_3: wrongOptions[2],
          });

        return !error;
      })
    );

    // Count successes and failures
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        failCount++;
      }
    });
  }

  console.log('Background: Finished generating wrong options');
  console.log(`Successfully saved wrong options to database: ${successCount}/${cardIds.length} cards`);
  if (failCount > 0) {
    console.log(`Failed to save: ${failCount} cards`);
  }
}

async function generateBlankWord(back: string): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/generate-blank-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ back }),
    });

    if (!response.ok) throw new Error(response.statusText);

    const result = await response.json();
    
    if (result.success && result.blank_word) {
      return result.blank_word;
    }
  } catch (_error) {
    console.error('Blank word generation error:', _error);
  }
  
  return null;
}


async function generateAndSaveBlankWords(cardIds: string[]): Promise<void> {
  const supabase = await createClient();
  
  console.log('Background: Generating blank words for', cardIds.length, 'cards');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < cardIds.length; i += BLANK_WORDS_BATCH_SIZE) {
    const batch = cardIds.slice(i, i + BLANK_WORDS_BATCH_SIZE);
    
    console.log(`Batch ${Math.floor(i / BLANK_WORDS_BATCH_SIZE) + 1}/${Math.ceil(cardIds.length / BLANK_WORDS_BATCH_SIZE)}`);
    
    const results = await Promise.allSettled(
      batch.map(async (cardId) => {
        const { data: card } = await supabase
          .from('cards')
          .select('back')
          .eq('id', cardId)
          .single();

        if (!card) return false;

        const blankWord = await generateBlankWord(card.back);

        if (!blankWord) return false;

        const { error } = await supabase
          .from('cards')
          .update({ blank_word: blankWord })
          .eq('id', cardId);

        return !error;
      })
    );

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        failCount++;
      }
    });
  }

  console.log('Background: Finished generating blank words');
  console.log(`Successfully saved blank words: ${successCount}/${cardIds.length} cards`);
  if (failCount > 0) {
    console.log(`Failed to save: ${failCount} cards`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

export async function processDocument(importId: string): Promise<ProcessResult> {
  const supabase = await createClient();

  try {
    console.log('[PIPELINE START] Document:', importId);
    
    // Fetch import record
    const { data: importRecord, error: importError } = await supabase
      .from('ai_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (importError || !importRecord) {
      throw new Error('Import record not found');
    }

    console.log('File:', importRecord.file_name);

    // Update status
    await supabase
      .from('ai_imports')
      .update({ status: 'processing' })
      .eq('id', importId);

    // STEP 1: Extract text
    console.log('[STEP 1/5] Extracting text...');
    const extractedText = await extractTextFromDocument(
      supabase,
      importRecord.file_path,
      importRecord.file_type
    );

    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error('Insufficient text content');
    }
    
    console.log('Extracted:', extractedText.length, 'characters');

    // STEP 2: Generate flashcards
    console.log('[STEP 2/5] Generating flashcards...');
    const generatedCards = await generateFlashcards(extractedText);
    console.log('Generated:', generatedCards.length, 'flashcards');

    // STEP 3: Save to database
    console.log('[STEP 3/5] Saving to database...');
    const cardIds = await saveCardsToDatabase(
      supabase,
      importRecord.deck_id,
      generatedCards
    );

    if (cardIds.length === 0) {
      throw new Error('Failed to save cards');
    }
    
    console.log('Saved:', cardIds.length, 'cards');

    // STEP 4: Mark complete & cleanup
    console.log('[STEP 4/5] Updating status & cleaning up...');
    await supabase
      .from('ai_imports')
      .update({ 
        status: 'completed',
        cards_generated: cardIds.length,
      })
      .eq('id', importId);

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([importRecord.file_path]);

    if (deleteError) {
      console.error('File deletion failed:', deleteError);
    } else {
      console.log('File deleted from storage');
    }

    // STEP 5: Background wrong options generation
    console.log('[STEP 5/5] Starting background wrong options generation...');
    generateAndSaveWrongOptions(cardIds).catch(console.error);
    generateAndSaveBlankWords(cardIds).catch(console.error); 


    console.log('[PIPELINE COMPLETE] Success!');

    return {
      success: true,
      cardsGenerated: cardIds.length,
    };

  } catch (error) {
    console.error('💥 [PIPELINE FAILED]', error);

    await supabase
      .from('ai_imports')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', importId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CHECK
// ═══════════════════════════════════════════════════════════════════════════

export async function getProcessingStatus(importId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('ai_imports')
      .select('status, cards_generated, error_message, file_name')
      .eq('id', importId)
      .single();

    if (error) {
      return { status: 'error', error: error.message };
    }

    return data;
  } catch (error) {
    return { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}