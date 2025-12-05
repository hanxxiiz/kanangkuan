/** IMPROVED DOCUMENT PROCESSING WITH ENHANCED ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use server';

import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { extractText } from '@/app/api/text-extraction/extract-text';



// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MAX_CARDS_PER_DOCUMENT = 100;
const MAX_TEXT_LENGTH = 100000;
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
// HELPER: GET BASE URL
// ═══════════════════════════════════════════════════════════════════════════

function getBaseUrl(): string {
  // For server-side API calls, prefer localhost in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, use Vercel URL or configured URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  return 'http://localhost:3000';
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1: TEXT EXTRACTION (IMPROVED)
// ═══════════════════════════════════════════════════════════════════════════

async function extractTextFromDocument(
  supabase: SupabaseClient,
  filePath: string,
  fileType: string
): Promise<string> {
  console.log(`Extracting text from ${fileType} file: ${filePath}`);
  
  // Download file from storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  console.log(`File downloaded successfully (${fileData.size} bytes)`);

  // Convert to Buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Use the new extraction utility
  const result = await extractText(buffer, fileType);
  
  console.log(` Extracted ${result.wordCount} words from ${fileType.toUpperCase()}`);
  
  if (!result.text || result.text.trim().length < 5) {
    throw new Error('Insufficient text content extracted');
  }
  
  return result.text;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: FLASHCARD GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateFlashcards(text: string): Promise<GeneratedCard[]> {
  const baseUrl = getBaseUrl();
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
  const baseUrl = getBaseUrl();
  
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

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        successCount++;
      } else {
        failCount++;
      }
    });
  }

  console.log('Background: Finished generating wrong options');
  console.log(`Successfully saved wrong options: ${successCount}/${cardIds.length} cards`);
  if (failCount > 0) {
    console.log(`Failed to save: ${failCount} cards`);
  }
}

async function generateBlankWord(back: string): Promise<string | null> {
  const baseUrl = getBaseUrl();
  
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
    console.log('[STEP 5/5] Starting background processing...');
    generateAndSaveWrongOptions(cardIds).catch(console.error);
    generateAndSaveBlankWords(cardIds).catch(console.error);

    console.log('[PIPELINE COMPLETE] Success!');

    return {
      success: true,
      cardsGenerated: cardIds.length,
    };

  } catch (error) {
    console.error('[PIPELINE FAILED]', error);

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