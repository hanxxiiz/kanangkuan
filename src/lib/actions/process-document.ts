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
  console.log(`Extracting text from ${fileType} file: ${filePath}`);
  
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  console.log(`File downloaded successfully (${fileData.size} bytes)`);

  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const result = await extractText(buffer, fileType);
  
  console.log(` Extracted ${result.wordCount} words from ${fileType.toUpperCase()}`);
  
  if (!result.text || result.text.trim().length < 5) {
    throw new Error('Insufficient text content extracted');
  }
  
  return result.text;
}

// STEP 2: FLASHCARD GENERATION

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
  
  console.log(`Generating wrong options for ${cards.length} cards in ONE request...`);
  
  try {
    // ONE API REQUEST FOR ALL CARDS
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

    // Save all wrong options to database
    console.log(`Saving wrong options for ${cards.length} cards...`);
    
    for (let i = 0; i < cards.length; i++) {
      const cardId = cards[i].id;
      const wrongOptions = result.options[i];
      
      if (!wrongOptions || wrongOptions.length < 3) {
        console.warn(`Skipping card ${cardId} - insufficient wrong options`);
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
        console.error(`Failed to save wrong options for card ${cardId}:`, error);
      }
    }

    console.log('Wrong options generation complete!');
  } catch (error) {
    console.error('Batched wrong options generation failed:', error);
    throw error;
  }
}

// STEP 5: BATCHED BLANK WORDS GENERATION (1 REQUEST FOR ALL CARDS!)

async function generateAllBlankWords(cards: CardWithId[]): Promise<void> {
  const supabase = await createClient();
  const baseUrl = getBaseUrl();
  
  console.log(`Generating blank words for ${cards.length} cards in ONE request...`);
  
  try {
    // ONE API REQUEST FOR ALL CARDS
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

    // Update all cards with blank words
    console.log(`Updating ${cards.length} cards with blank words...`);
    
    for (let i = 0; i < cards.length; i++) {
      const cardId = cards[i].id;
      const blankWord = result.blank_words[i];
      
      if (!blankWord || !blankWord.trim()) {
        console.warn(`Skipping card ${cardId} - no blank word generated`);
        continue;
      }

      const { error } = await supabase
        .from('cards')
        .update({ blank_word: blankWord })
        .eq('id', cardId);

      if (error) {
        console.error(`Failed to update blank word for card ${cardId}:`, error);
      }
    }

    console.log('Blank words generation complete!');
  } catch (error) {
    console.error('Batched blank words generation failed:', error);
    throw error;
  }
}

// MAIN PIPELINE ORCHESTRATOR

export async function processDocument(importId: string): Promise<ProcessResult> {
  const supabase = await createClient();

  try {
    console.log('[PIPELINE START] Document:', importId);
    
    const { data: importRecord, error: importError } = await supabase
      .from('ai_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (importError || !importRecord) {
      throw new Error('Import record not found');
    }

    console.log('File:', importRecord.file_name);

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

    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([importRecord.file_path]);

    if (deleteError) {
      console.error('File deletion failed:', deleteError);
    } else {
      console.log('File deleted from storage');
    }

    // STEP 5: Fetch all cards for batch processing
    console.log('[STEP 5/5] Fetching cards for batch AI processing...');
    const { data: savedCards } = await supabase
      .from('cards')
      .select('id, front, back')
      .in('id', cardIds);

    if (!savedCards || savedCards.length === 0) {
      throw new Error('Failed to fetch saved cards');
    }

    // BACKGROUND: Process all cards with just 2 AI requests!
    (async () => {
      try {
        console.log('Starting batched background processing (2 AI requests total)...');
        
        // Request 1: Generate all wrong options
        await generateAllWrongOptions(savedCards);
        
        // Request 2: Generate all blank words
        await generateAllBlankWords(savedCards);
        
        console.log('All background processing complete!');
      } catch (error) {
        console.error('Background processing failed:', error);
      }
    })();

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

// STATUS CHECK

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