'use server';

import { createClient } from '@/utils/supabase/server';
import { generateWrongOptionsBatch, generateBlankWordsBatch } from '@/lib/ai/generators';

interface GenerateResult {
  success: boolean;
  message?: string;
  error?: string;
  cardsProcessed?: number;
  cardsUpdated?: number;
  cardsSkipped?: number;
}

interface Card {
  id: string;
  front: string;
  back: string;
  blank_word: string | null;
}

interface CardOption {
  id: string;
  card_id: string;
  wrong_option_1: string | null;
  wrong_option_2: string | null;
  wrong_option_3: string | null;
}

interface CardWithOptions extends Card {
  card_options: CardOption[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export async function generateWrongOptionsAndBlankWordsForDeck(
  deckId: string,
  userId?: string
): Promise<GenerateResult> {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`[PIPELINE START] Deck ID: ${deckId}`);
  console.log(`${'═'.repeat(80)}\n`);

  const supabase = await createClient();

  try {
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[STAGE 1/6] Authenticating user...');
    // ─────────────────────────────────────────────────────────────────────────
    
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = userId || user?.id;
    
    if (!effectiveUserId) {
      console.error('[STAGE 1/6] Authentication failed');
      return { success: false, error: 'User not authenticated' };
    }
    console.log(`[STAGE 1/6] User authenticated: ${effectiveUserId}`);

    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 2/6] Verifying deck access...');
    // ─────────────────────────────────────────────────────────────────────────
    
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, deck_name, created_by')
      .eq('id', deckId)
      .eq('created_by', effectiveUserId)
      .single();

    if (deckError || !deck) {
      console.error('[STAGE 2/6] Deck access denied or not found:', deckError);
      return { success: false, error: 'Deck not found or access denied' };
    }
    console.log(`[STAGE 2/6] Deck found: "${deck.deck_name}"`);

    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 3/6] Fetching cards from deck...');
    // ─────────────────────────────────────────────────────────────────────────
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        id,
        front,
        back,
        blank_word,
        card_options (
          id,
          card_id,
          wrong_option_1,
          wrong_option_2,
          wrong_option_3
        )
      `)
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (cardsError) {
      console.error('[STAGE 3/6] Failed to fetch cards:', cardsError);
      return { success: false, error: 'Failed to fetch cards from deck' };
    }

    if (!cards || cards.length === 0) {
      console.log('[STAGE 3/6] No cards found in deck');
      return {
        success: true,
        message: 'No cards found in this deck',
        cardsProcessed: 0,
        cardsUpdated: 0,
        cardsSkipped: 0,
      };
    }
    console.log(`[STAGE 3/6] Found ${cards.length} total cards`);

    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 4/6] Filtering cards needing generation...');
    // ─────────────────────────────────────────────────────────────────────────
    
    const cardsNeedingGeneration = cards.filter((card: CardWithOptions) => {
      const hasOptions = card.card_options && card.card_options.length > 0;
      const optionsComplete = hasOptions && 
        card.card_options[0]?.wrong_option_1 && 
        card.card_options[0]?.wrong_option_2 && 
        card.card_options[0]?.wrong_option_3;
      
      const hasBlankWord = card.blank_word && card.blank_word.trim() !== '';
      
      const needsOptions = !optionsComplete;
      const needsBlankWord = !hasBlankWord;
      
      return needsOptions || needsBlankWord; 
    });

    console.log(`Total cards: ${cards.length}`);
    console.log(`Need generation: ${cardsNeedingGeneration.length}`);
    console.log(`Already complete: ${cards.length - cardsNeedingGeneration.length}`);

    if (cardsNeedingGeneration.length === 0) {
      console.log('[STAGE 4/6] All cards already complete');
      return {
        success: true,
        message: 'All cards already have wrong options and blank words',
        cardsProcessed: cards.length,
        cardsUpdated: 0,
        cardsSkipped: cards.length,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[STAGE 5/6] Generating AI data via DIRECT FUNCTION CALLS...`);
    console.log(`Processing ${cardsNeedingGeneration.length} cards at once`);
    // ─────────────────────────────────────────────────────────────────────────
    
    // DIRECT FUNCTION CALLS - NO HTTP, NO AUTH ISSUES
    let wrongOptionsResults: string[][] | null = null;
    let blankWordsResults: string[] | null = null;

    try {
      [wrongOptionsResults, blankWordsResults] = await Promise.all([
        generateWrongOptionsBatch(
          cardsNeedingGeneration.map(c => ({ front: c.front, back: c.back }))
        ),
        generateBlankWordsBatch(
          cardsNeedingGeneration.map(c => ({ back: c.back }))
        )
      ]);
    } catch (error) {
      console.error('[STAGE 5/6] AI generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI generation failed',
        cardsProcessed: cards.length,
        cardsUpdated: 0,
        cardsSkipped: cards.length - cardsNeedingGeneration.length,
      };
    }

    if (!wrongOptionsResults || !blankWordsResults) {
      console.error('[STAGE 5/6] Generation returned null results');
      return {
        success: false,
        error: 'Failed to generate AI data',
        cardsProcessed: cards.length,
        cardsUpdated: 0,
        cardsSkipped: cards.length - cardsNeedingGeneration.length,
      };
    }

    console.log('[STAGE 5/6] Generation complete');

    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[STAGE 6/6] Saving results to database...`);
    // ─────────────────────────────────────────────────────────────────────────
    
    let successCount = 0;

    for (let i = 0; i < cardsNeedingGeneration.length; i++) {
      const card = cardsNeedingGeneration[i] as CardWithOptions;
      const wrongOptions = wrongOptionsResults[i];
      const blankWord = blankWordsResults[i];

      console.log(`[${i + 1}/${cardsNeedingGeneration.length}] Saving card ${card.id}...`);

      try {
        // Check if card needs options
        const hasOptions = card.card_options && card.card_options.length > 0;
        const optionsComplete = hasOptions && 
          card.card_options[0]?.wrong_option_1 && 
          card.card_options[0]?.wrong_option_2 && 
          card.card_options[0]?.wrong_option_3;

        // Only save options if needed
        if (!optionsComplete) {
          if (!wrongOptions || wrongOptions.length !== 3) {
            console.error(`Invalid wrong options for card ${card.id}`);
            continue;
          }

          const { error: optionsError } = await supabase
            .from('card_options')
            .upsert({
              card_id: card.id,
              wrong_option_1: wrongOptions[0],
              wrong_option_2: wrongOptions[1],
              wrong_option_3: wrongOptions[2],
            }, {
              onConflict: 'card_id'
            });

          if (optionsError) {
            console.error(`Failed to save card_options for ${card.id}:`, optionsError);
            continue;
          }
        }

        // Check if card needs blank word
        const hasBlankWord = card.blank_word && card.blank_word.trim() !== '';

        // Only save blank word if needed
        if (!hasBlankWord) {
          if (!blankWord || !blankWord.trim()) {
            console.error(`Invalid blank word for card ${card.id}`);
            continue;
          }

          const { error: blankWordError } = await supabase
            .from('cards')
            .update({ blank_word: blankWord })
            .eq('id', card.id);

          if (blankWordError) {
            console.error(`Failed to save blank_word for ${card.id}:`, blankWordError);
            continue;
          }
        }

        successCount++;
        console.log(`Card ${card.id} saved successfully`);

      } catch (error) {
        console.error(`Exception saving card ${card.id}:`, error);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[STAGE 6/6] Generation complete`);
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed: ${cardsNeedingGeneration.length - successCount}`);
    console.log(`Already complete: ${cards.length - cardsNeedingGeneration.length}`);

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`[PIPELINE END] Total cards processed: ${cards.length}`);
    console.log(`${'═'.repeat(80)}\n`);

    return {
      success: true,
      message: `Successfully generated wrong options and blank words for ${successCount} cards`,
      cardsProcessed: cards.length,
      cardsUpdated: successCount,
      cardsSkipped: cards.length - cardsNeedingGeneration.length,
    };

  } catch (error) {
    console.error('\n[PIPELINE FAILED] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      cardsProcessed: 0,
      cardsUpdated: 0,
      cardsSkipped: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK STATUS
// ═══════════════════════════════════════════════════════════════════════════

export async function checkWrongOptionsAndBlankWordsStatus(deckId: string) {
  console.log(`\n[STATUS CHECK] Checking deck ${deckId}...`);
  
  try {
    const supabase = await createClient();
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, blank_word')
      .eq('deck_id', deckId);

    if (cardsError) {
      console.error('[STATUS CHECK] Failed to fetch cards:', cardsError.message);
      return { success: false, error: cardsError.message };
    }

    if (!cards || cards.length === 0) {
      console.log('[STATUS CHECK] No cards found');
      return {
        success: true,
        totalCards: 0,
        cardsWithWrongOptions: 0,
        cardsWithBlankWords: 0,
        cardsComplete: 0,
        cardsNeedingGeneration: 0,
        percentage: 0,
        needsGeneration: false,
      };
    }

    const cardIds = cards.map(c => c.id);
    const { data: cardOptions, error: optionsError } = await supabase
      .from('card_options')
      .select('card_id, wrong_option_1, wrong_option_2, wrong_option_3')
      .in('card_id', cardIds);

    if (optionsError) {
      console.error('[STATUS CHECK] Failed to fetch card_options:', optionsError.message);
    }

    const cardsWithOptions = cards.map(card => ({
      ...card,
      card_options: cardOptions?.filter(opt => opt.card_id === card.id) || []
    })) as CardWithOptions[];

    const cardsWithWrongOptions = cardsWithOptions.filter((card: CardWithOptions) => {
      const opts = card.card_options[0];
      return opts && opts.wrong_option_1 && opts.wrong_option_2 && opts.wrong_option_3;
    }).length;

    const cardsWithBlankWords = cardsWithOptions.filter(
      (card: CardWithOptions) => card.blank_word && card.blank_word.trim() !== ''
    ).length;

    const cardsComplete = cardsWithOptions.filter((card: CardWithOptions) => {
      const opts = card.card_options[0];
      const optionsComplete = opts && opts.wrong_option_1 && opts.wrong_option_2 && opts.wrong_option_3;
      const hasBlankWord = card.blank_word && card.blank_word.trim() !== '';
      return optionsComplete && hasBlankWord;
    }).length;

    const cardsNeedingGeneration = cards.length - cardsComplete;
    const percentage = Math.round((cardsComplete / cards.length) * 100);

    console.log(`[STATUS CHECK] Results:`);
    console.log(`Total cards: ${cards.length}`);
    console.log(`Complete: ${cardsComplete} (${percentage}%)`);
    console.log(`Need generation: ${cardsNeedingGeneration}`);

    return {
      success: true,
      totalCards: cards.length,
      cardsWithWrongOptions,
      cardsWithBlankWords,
      cardsComplete,
      cardsNeedingGeneration,
      percentage,
      needsGeneration: cardsNeedingGeneration > 0,
    };
  } catch (error) {
    console.error('[STATUS CHECK] Exception:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKGROUND TRIGGER (NON-BLOCKING)
// ═══════════════════════════════════════════════════════════════════════════

// In generate-qna-and-blank-words.ts
export async function triggerGenerationInBackground(deckId: string): Promise<void> {
  console.log(`\n[TRIGGER] Starting background generation for deck ${deckId}...`);
  
  // Check status first before triggering
  const status = await checkWrongOptionsAndBlankWordsStatus(deckId);
  
  if (!status.needsGeneration) {
    console.log('[TRIGGER] Generation not needed - all cards complete');
    return;
  }
  
  generateWrongOptionsAndBlankWordsForDeck(deckId).catch((error) => {
    console.error('[TRIGGER] Background generation failed:', error);
  });
  
  console.log('[TRIGGER] Background process initiated (non-blocking)\n');
}