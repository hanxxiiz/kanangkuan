'use server';

import { createClient } from '@/utils/supabase/server';

const BATCH_SIZE = 5; 
const DELAY_BETWEEN_CARDS = 3000; 

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

interface GeneratedData {
  card_options: string[];
  blank_word: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: DELAY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════════════════════
// AI API CALLS
// ═══════════════════════════════════════════════════════════════════════════

async function generateWrongOptionsAndBlankWord(
  front: string, 
  back: string,
  cardId: string
): Promise<GeneratedData | null> {
  const getBaseUrl = () => {
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
  };

  const baseUrl = getBaseUrl();
  
  console.log(`Generating for card ${cardId}...`);
  console.log(`   Front: ${front.substring(0, 50)}...`);
  console.log(`   Back: ${back.substring(0, 50)}...`);

  try {
    const [wrongOptionsResponse, blankWordResponse] = await Promise.all([
      fetch(`${baseUrl}/api/ai/generate-wrong-options`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/ai/generate-blank-words`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ back }),
        cache: 'no-store',
      })
    ]);

    console.log(`Response status - Wrong Options: ${wrongOptionsResponse.status}, Blank Words: ${blankWordResponse.status}`);

    if (!wrongOptionsResponse.ok || !blankWordResponse.ok) {
      console.error(`Failed for card ${cardId}`);
      return null;
    }

    const [wrongOptionsResult, blankWordResult] = await Promise.all([
      wrongOptionsResponse.json(),
      blankWordResponse.json()
    ]);

    if (
      wrongOptionsResult.success && 
      wrongOptionsResult.wrong_options &&
      blankWordResult.success && 
      blankWordResult.blank_word
    ) {
      console.log(`Successfully generated for card ${cardId}`);
      return {
        card_options: wrongOptionsResult.wrong_options,
        blank_word: blankWordResult.blank_word,
      };
    }

    console.error(`Invalid response structure for card ${cardId}`);
    return null;
  } catch (error) {
    console.error(`Exception for card ${cardId}:`, error);
    return null;
  }
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
    console.log(' [STAGE 1/6] Authenticating user...');
    // ─────────────────────────────────────────────────────────────────────────
    
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = userId || user?.id;
    
    if (!effectiveUserId) {
      console.error(' [STAGE 1/6] Authentication failed');
      return { success: false, error: 'User not authenticated' };
    }
    console.log(` [STAGE 1/6] User authenticated: ${effectiveUserId}`);

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
      console.error(' [STAGE 2/6] Deck access denied or not found:', deckError);
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
      
      // ONLY return cards that need BOTH blank_words AND card_options
      const needsOptions = !optionsComplete;
      const needsBlankWord = !hasBlankWord;
      
      return needsOptions && needsBlankWord; // CHANGED: Must need BOTH
    });

    console.log(` Total cards: ${cards.length}`);
    console.log(` Need generation: ${cardsNeedingGeneration.length}`);
    console.log(` Already complete: ${cards.length - cardsNeedingGeneration.length}`);

    if (cardsNeedingGeneration.length === 0) {
      console.log('[STAGE 4/6] All cards already complete!');
      return {
        success: true,
        message: 'All cards already have wrong options and blank words',
        cardsProcessed: cards.length,
        cardsUpdated: 0,
        cardsSkipped: cards.length,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[STAGE 5/6] Processing ${cardsNeedingGeneration.length} cards SEQUENTIALLY...`);
    console.log(`Rate limit: ${DELAY_BETWEEN_CARDS / 1000}s delay between cards`);
    console.log(`Batch size: ${BATCH_SIZE} cards per batch`);
    // ─────────────────────────────────────────────────────────────────────────
    
    let successCount = 0;
    const totalBatches = Math.ceil(cardsNeedingGeneration.length / BATCH_SIZE);

    for (let i = 0; i < cardsNeedingGeneration.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = cardsNeedingGeneration.slice(i, i + BATCH_SIZE);
      
      console.log(`\n[BATCH ${batchNumber}/${totalBatches}] Processing ${batch.length} cards...`);
      
      // CHANGED: Process cards SEQUENTIALLY instead of Promise.allSettled
      for (let j = 0; j < batch.length; j++) {
        const card = batch[j] as CardWithOptions;
        const cardNumber = i + j + 1;
        
        console.log(`\n[${cardNumber}/${cardsNeedingGeneration.length}] Processing card ${card.id}...`);
        
        try {
          const generatedData = await generateWrongOptionsAndBlankWord(
            card.front, 
            card.back,
            card.id
          );

          if (!generatedData) {
            console.error(`Card ${card.id}: Generation failed`);
            continue; // Skip to next card
          }

          let updateSuccess = true;

          // Insert card_options
          console.log(`Creating card_options for card ${card.id}...`);
          
          const { error: optionsError } = await supabase
            .from('card_options')
            .upsert({
              card_id: card.id,
              wrong_option_1: generatedData.card_options[0] || null,
              wrong_option_2: generatedData.card_options[1] || null,
              wrong_option_3: generatedData.card_options[2] || null,
            }, {
              onConflict: 'card_id' // Specify which column has the unique constraint
            });

          if (optionsError) {
            console.error(`Card ${card.id}: Failed to insert card_options`, optionsError);
            updateSuccess = false;
          }

          // Update blank_word
          console.log(`Updating blank_word for card ${card.id}...`);
          
          const { error: blankWordError } = await supabase
            .from('cards')
            .update({ blank_word: generatedData.blank_word })
            .eq('id', card.id);

          if (blankWordError) {
            console.error(`Card ${card.id}: Failed to update blank_word`, blankWordError);
            updateSuccess = false;
          }

          if (updateSuccess) {
            successCount++;
            console.log(`Card ${card.id}: Successfully updated`);
          }

        } catch (error) {
          console.error(`Card ${card.id}: Exception`, error);
        }
        
        // CRITICAL: Wait before processing next card (except for last card in last batch)
        if (!(i + j === cardsNeedingGeneration.length - 1)) {
          console.log(`Waiting ${DELAY_BETWEEN_CARDS / 1000}s before next card...`);
          await delay(DELAY_BETWEEN_CARDS);
        }
      }
      
      console.log(`[BATCH ${batchNumber}/${totalBatches}] Completed: ${successCount} total successful so far`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    console.log(`\n[STAGE 6/6] Generation complete!`);
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`   Successfully updated: ${successCount}`);
    console.log(`   Failed: ${cardsNeedingGeneration.length - successCount}`);
    console.log(`   Already complete: ${cards.length - cardsNeedingGeneration.length}`);

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
    console.error('\n [PIPELINE FAILED] Unexpected error:', error);
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
    
    // Fetch cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, blank_word')
      .eq('deck_id', deckId);

    if (cardsError) {
      console.error(' [STATUS CHECK] Failed to fetch cards:', cardsError.message);
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

    // Fetch all card_options for this deck's cards
    const cardIds = cards.map(c => c.id);
    const { data: cardOptions, error: optionsError } = await supabase
      .from('card_options')
      .select('card_id, wrong_option_1, wrong_option_2, wrong_option_3')
      .in('card_id', cardIds);

    if (optionsError) {
      console.error('[STATUS CHECK] Failed to fetch card_options:', optionsError.message);
    }

    console.log('DEBUG:', {
      cardsCount: cards.length,
      cardOptionsCount: cardOptions?.length || 0
    });

    // Merge the data
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

    console.log(`   [STATUS CHECK] Results:`);
    console.log(`   Total cards: ${cards.length}`);
    console.log(`   Complete: ${cardsComplete} (${percentage}%)`);
    console.log(`   Need generation: ${cardsNeedingGeneration}`);

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

export async function triggerGenerationInBackground(deckId: string): Promise<void> {
  console.log(`\n[TRIGGER] Starting background generation for deck ${deckId}...`);
  
  generateWrongOptionsAndBlankWordsForDeck(deckId).catch((error) => {
    console.error('[TRIGGER] Background generation failed:', error);
  });
  
  console.log('[TRIGGER] Background process initiated (non-blocking)\n');
}