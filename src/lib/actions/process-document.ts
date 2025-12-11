'use server';

import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { extractText } from '@/app/api/text-extraction/extract-text';

const MAX_CARDS_PER_DOCUMENT = 100;
const MAX_TEXT_LENGTH = 100000;
const CARD_BATCH_SIZE = 10;

// TYPES

interface ProcessResult {
  success: boolean;
  error?: string;
  cardsGenerated?: number;
}

interface GeneratedCard {
  front: string;
  back: string;
}

interface CardWithId {
  id: string;
  front: string;
  back: string;
}

// HELPER: GET BASE URL

function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  return 'http://localhost:3000';
}

// STEP 1: TEXT EXTRACTION

async function extractTextFromDocument(
  supabase: SupabaseClient,
  filePath: string,
  fileType: string
): Promise<string> {
  console.log('[EXTRACT] Starting text extraction:', {
    filePath,
    fileType
  });
  
  console.log('[EXTRACT] Downloading file from storage...');
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (downloadError || !fileData) {
    console.error('[EXTRACT] ERROR: Failed to download file:', downloadError);
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  console.log('[EXTRACT] File downloaded, size:', fileData.size, 'bytes');

  console.log('[EXTRACT] Converting to buffer...');
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  console.log('[EXTRACT] Buffer created, size:', buffer.length);
  console.log('[EXTRACT] Calling extractText utility...');
  
  const result = await extractText(buffer, fileType);
  
  console.log('[EXTRACT] Extraction complete:', {
    wordCount: result.wordCount,
    textLength: result.text.length,
    pageCount: result.pageCount || 'N/A'
  });
  
  if (!result.text || result.text.trim().length < 5) {
    console.error('[EXTRACT] ERROR: Insufficient text content');
    throw new Error('Insufficient text content extracted');
  }
  
  return result.text;
}

// STEP 2: FLASHCARD GENERATION (WITH DETAILED LOGGING)

async function generateFlashcards(text: string): Promise<GeneratedCard[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/ai/generate-qna`;
  
  console.log('[GENERATE] ===== FLASHCARD GENERATION START =====');
  console.log('[GENERATE] Target URL:', url);
  console.log('[GENERATE] Text length:', text.slice(0, MAX_TEXT_LENGTH).length);
  console.log('[GENERATE] Text preview:', text.slice(0, 200) + '...');
  
  try {
    console.log('[GENERATE] Making fetch request...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.slice(0, MAX_TEXT_LENGTH) }),
    });

    console.log('[GENERATE] Response received');
    console.log('[GENERATE] Status:', response.status, response.statusText);
    console.log('[GENERATE] Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Get the error response body
      const responseText = await response.text();
      console.error('[GENERATE] ERROR RESPONSE:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText };
      }
      
      throw new Error(
        `Flashcard generation failed: HTTP ${response.status} - ${errorData.error || responseText}`
      );
    }

    console.log('[GENERATE] Parsing JSON response...');
    const result = await response.json();
    
    console.log('[GENERATE] Result received:', {
      success: result.success,
      flashcardsCount: result.flashcards?.length || 0,
      hasError: !!result.error
    });

    if (!result.success) {
      throw new Error(`API returned success=false: ${result.error || 'Unknown error'}`);
    }

    if (!result.flashcards || !Array.isArray(result.flashcards)) {
      throw new Error('Invalid response format: missing flashcards array');
    }

    console.log('[GENERATE] Validating flashcards...');
    
    const validCards = result.flashcards
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

    console.log('[GENERATE] Valid cards:', validCards.length, '/', result.flashcards.length);

    if (validCards.length === 0) {
      throw new Error('No valid flashcards generated after filtering');
    }

    const finalCards = validCards.slice(0, MAX_CARDS_PER_DOCUMENT);
    console.log('[GENERATE] ===== SUCCESS =====');
    console.log('[GENERATE] Returning', finalCards.length, 'flashcards');

    return finalCards;
    
  } catch (error) {
    console.error('[GENERATE] ===== FATAL ERROR =====');
    console.error('[GENERATE] Error:', error);
    
    if (error instanceof Error) {
      console.error('[GENERATE] Error message:', error.message);
      console.error('[GENERATE] Error stack:', error.stack);
    }
    
    throw error;
  }
}

// STEP 3: DATABASE OPERATIONS

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

// STEP 4: BATCHED WRONG OPTIONS GENERATION (1 REQUEST FOR ALL CARDS!)

async function generateAllWrongOptions(cards: CardWithId[]): Promise<void> {
  const supabase = await createClient();
  const baseUrl = getBaseUrl();
  
  console.log(`[WRONG-OPTIONS] Generating for ${cards.length} cards in ONE request...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/generate-wrong-options-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: cards.map(c => ({ front: c.front, back: c.back }))
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.options) {
      throw new Error('Invalid response format');
    }

    console.log(`[WRONG-OPTIONS] Saving for ${cards.length} cards...`);
    
    for (let i = 0; i < cards.length; i++) {
      const cardId = cards[i].id;
      const wrongOptions = result.options[i];
      
      if (!wrongOptions || wrongOptions.length < 3) {
        console.warn(`[WRONG-OPTIONS] Skipping card ${cardId} - insufficient options`);
        continue;
      }

      const { error } = await supabase
        .from('card_options')
        .insert({
          card_id: cardId,
          wrong_option_1: wrongOptions[0],
          wrong_option_2: wrongOptions[1],
          wrong_option_3: wrongOptions[2],
        });

      if (error) {
        console.error(`[WRONG-OPTIONS] Failed for card ${cardId}:`, error);
      }
    }

    console.log('[WRONG-OPTIONS] Complete!');
  } catch (error) {
    console.error('[WRONG-OPTIONS] Failed:', error);
    throw error;
  }
}

// STEP 5: BATCHED BLANK WORDS GENERATION (1 REQUEST FOR ALL CARDS!)

async function generateAllBlankWords(cards: CardWithId[]): Promise<void> {
  const supabase = await createClient();
  const baseUrl = getBaseUrl();
  
  console.log(`[BLANK-WORDS] Generating for ${cards.length} cards in ONE request...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/ai/generate-blank-words-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        cards: cards.map(c => ({ back: c.back }))
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.blank_words) {
      throw new Error('Invalid response format');
    }

    console.log(`[BLANK-WORDS] Updating ${cards.length} cards...`);
    
    for (let i = 0; i < cards.length; i++) {
      const cardId = cards[i].id;
      const blankWord = result.blank_words[i];
      
      if (!blankWord || !blankWord.trim()) {
        console.warn(`[BLANK-WORDS] Skipping card ${cardId} - no word generated`);
        continue;
      }

      const { error } = await supabase
        .from('cards')
        .update({ blank_word: blankWord })
        .eq('id', cardId);

      if (error) {
        console.error(`[BLANK-WORDS] Failed for card ${cardId}:`, error);
      }
    }

    console.log('[BLANK-WORDS] Complete!');
  } catch (error) {
    console.error('[BLANK-WORDS] Failed:', error);
    throw error;
  }
}

// MAIN PIPELINE ORCHESTRATOR

export async function processDocument(importId: string): Promise<ProcessResult> {
  console.log('===============================================================');
  console.log('[PROCESS] DOCUMENT PROCESSING STARTED');
  console.log('[PROCESS] Import ID:', importId);
  console.log('[PROCESS] Timestamp:', new Date().toISOString());
  console.log('===============================================================');
  
  const supabase = await createClient();

  try {
    console.log('[PROCESS] Fetching import record...');
    
    const { data: importRecord, error: importError } = await supabase
      .from('ai_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (importError || !importRecord) {
      console.error('[PROCESS] ERROR: Failed to fetch import record:', importError);
      throw new Error('Import record not found');
    }

    console.log('[PROCESS] Import record found:', {
      fileName: importRecord.file_name,
      fileType: importRecord.file_type,
      filePath: importRecord.file_path,
      deckId: importRecord.deck_id,
      status: importRecord.status
    });

    console.log('[PROCESS] Updating status to processing...');
    await supabase
      .from('ai_imports')
      .update({ status: 'processing' })
      .eq('id', importId);

    // STEP 1: Extract text
    console.log('[PROCESS] ========================================');
    console.log('[PROCESS] STEP 1/5: Text Extraction');
    console.log('[PROCESS] ========================================');
    
    const extractedText = await extractTextFromDocument(
      supabase,
      importRecord.file_path,
      importRecord.file_type
    );

    if (!extractedText || extractedText.trim().length < 5) {
      console.error('[PROCESS] ERROR: Insufficient text content');
      console.error('[PROCESS] Text length:', extractedText?.length || 0);
      throw new Error('Insufficient text content');
    }
    
    console.log('[PROCESS] Text extracted successfully:', {
      length: extractedText.length,
      wordCount: extractedText.split(/\s+/).length,
      preview: extractedText.substring(0, 200) + '...'
    });

    // STEP 2: Generate flashcards
    console.log('[PROCESS] ========================================');
    console.log('[PROCESS] STEP 2/5: Flashcard Generation');
    console.log('[PROCESS] ========================================');
    
    const generatedCards = await generateFlashcards(extractedText);
    console.log('[PROCESS] Flashcards generated:', generatedCards.length);

    // STEP 3: Save to database
    console.log('[PROCESS] ========================================');
    console.log('[PROCESS] STEP 3/5: Saving to Database');
    console.log('[PROCESS] ========================================');
    
    const cardIds = await saveCardsToDatabase(
      supabase,
      importRecord.deck_id,
      generatedCards
    );

    if (cardIds.length === 0) {
      console.error('[PROCESS] ERROR: Failed to save any cards');
      throw new Error('Failed to save cards');
    }
    
    console.log('[PROCESS] Cards saved successfully:', cardIds.length);

    // STEP 4: Mark complete & cleanup
    console.log('[PROCESS] ========================================');
    console.log('[PROCESS] STEP 4/5: Updating Status & Cleanup');
    console.log('[PROCESS] ========================================');
    
    await supabase
      .from('ai_imports')
      .update({ 
        status: 'completed',
        cards_generated: cardIds.length,
      })
      .eq('id', importId);

    console.log('[PROCESS] Status updated to completed');

    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([importRecord.file_path]);

    if (deleteError) {
      console.error('[PROCESS] File deletion failed:', deleteError);
    } else {
      console.log('[PROCESS] File deleted from storage');
    }

    // STEP 5: Fetch all cards for batch processing
    console.log('[PROCESS] ========================================');
    console.log('[PROCESS] STEP 5/5: Background AI Processing');
    console.log('[PROCESS] ========================================');
    
    const { data: savedCards } = await supabase
      .from('cards')
      .select('id, front, back')
      .in('id', cardIds);

    if (!savedCards || savedCards.length === 0) {
      console.error('[PROCESS] ERROR: Failed to fetch saved cards');
      throw new Error('Failed to fetch saved cards');
    }

    console.log('[PROCESS] Cards fetched for background processing:', savedCards.length);

    // BACKGROUND: Process all cards with just 2 AI requests!
    (async () => {
      try {
        console.log('[BACKGROUND] Starting batched processing...');
        
        await generateAllWrongOptions(savedCards);
        await generateAllBlankWords(savedCards);
        
        console.log('[BACKGROUND] All processing complete!');
      } catch (error) {
        console.error('[BACKGROUND] Processing failed:', error);
      }
    })();

    console.log('===============================================================');
    console.log('[PROCESS] DOCUMENT PROCESSING COMPLETED SUCCESSFULLY');
    console.log('[PROCESS] Cards generated:', cardIds.length);
    console.log('===============================================================');

    return {
      success: true,
      cardsGenerated: cardIds.length,
    };

  } catch (error) {
    console.error('===============================================================');
    console.error('[PROCESS] PROCESSING FAILED');
    console.error('[PROCESS] Error:', error);
    if (error instanceof Error) {
      console.error('[PROCESS] Error message:', error.message);
      console.error('[PROCESS] Error stack:', error.stack);
    }
    console.error('===============================================================');

    await supabase
      .from('ai_imports')
      .update({ 
        status: 'failed',
      })
      .eq('id', importId);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed',
    };
  }
}

// STATUS CHECK

export async function getProcessingStatus(importId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('ai_imports')
      .select('status, cards_generated, file_name')
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