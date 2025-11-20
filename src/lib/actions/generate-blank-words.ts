/** 
 * ═══════════════════════════════════════════════════════════════════════════
 * GENERATE BLANK WORDS FOR EXISTING DECK
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module handles generating blank_words for cards that don't have them yet.
 * Used when a user wants to enable active recall for an existing deck.
 * 
 * FLOW:
 * ─────
 * 1. Check which cards in the deck are missing blank_words
 * 2. Fetch the 'back' content for those cards
 * 3. Call AI to generate appropriate blank word for each card
 * 4. Update cards with generated blank_words
 * 5. Process in batches to save tokens and for better performance 
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use server';

import { createClient } from '@/utils/supabase/server';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const BATCH_SIZE = 10; // Process 10 cards at a time

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GenerateBlankWordsResult {
  success: boolean;
  message?: string;
  error?: string;
  cardsProcessed?: number;
  cardsUpdated?: number;
  cardsSkipped?: number;
}

interface Card {
  id: string;
  back: string;
  blank_word: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI API CALL
// ═══════════════════════════════════════════════════════════════════════════

async function generateBlankWord(back: string): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/ai/generate-blank-words`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ back }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.blank_word) {
      return result.blank_word;
    }

    return null;
  } catch (error) {
    console.error('Blank word generation error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export async function generateBlankWordsForDeck(
  deckId: string,
  userId?: string
): Promise<GenerateBlankWordsResult> {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const effectiveUserId = userId || user?.id;
    
    if (!effectiveUserId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Verify deck exists and user has access
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, deck_name, created_by')
      .eq('id', deckId)
      .eq('created_by', effectiveUserId)
      .single();

    if (deckError || !deck) {
      return {
        success: false,
        error: 'Deck not found or access denied',
      };
    }

    // Get all cards from this deck
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, back, blank_word')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });

    if (cardsError) {
      return {
        success: false,
        error: 'Failed to fetch cards from deck',
      };
    }

    if (!cards || cards.length === 0) {
      return {
        success: true,
        message: 'No cards found in this deck',
        cardsProcessed: 0,
        cardsUpdated: 0,
        cardsSkipped: 0,
      };
    }

    // Filter cards that need blank_words
    const cardsNeedingBlankWords = cards.filter(
      (card: Card) => !card.blank_word || card.blank_word.trim() === ''
    );

    if (cardsNeedingBlankWords.length === 0) {
      return {
        success: true,
        message: 'All cards already have blank words',
        cardsProcessed: cards.length,
        cardsUpdated: 0,
        cardsSkipped: cards.length,
      };
    }

    // Process cards in batches
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < cardsNeedingBlankWords.length; i += BATCH_SIZE) {
      const batch = cardsNeedingBlankWords.slice(i, i + BATCH_SIZE);
      
      const results = await Promise.allSettled(
        batch.map(async (card: Card) => {
          try {
            const blankWord = await generateBlankWord(card.back);

            if (!blankWord) {
              return false;
            }

            const { error: updateError } = await supabase
              .from('cards')
              .update({ blank_word: blankWord })
              .eq('id', card.id);

            if (updateError) {
              return false;
            }

            return true;
          } catch (error) {
            return false;
          }
        })
      );

      // Count successes and failures
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          successCount++;
        } else {
          failCount++;
        }
      });
    }

    return {
      success: true,
      message: `Successfully generated blank words for ${successCount} cards`,
      cardsProcessed: cards.length,
      cardsUpdated: successCount,
      cardsSkipped: cards.length - cardsNeedingBlankWords.length,
    };

  } catch (error) {
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

export async function checkBlankWordsStatus(deckId: string) {
  try {
    const supabase = await createClient();
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select('id, blank_word')
      .eq('deck_id', deckId);

    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }

    if (!cards || cards.length === 0) {
      return {
        success: true,
        totalCards: 0,
        cardsWithBlankWords: 0,
        cardsWithoutBlankWords: 0,
        percentage: 0,
      };
    }

    const cardsWithBlankWords = cards.filter(
      (card) => card.blank_word && card.blank_word.trim() !== ''
    ).length;

    const cardsWithoutBlankWords = cards.length - cardsWithBlankWords;
    const percentage = Math.round((cardsWithBlankWords / cards.length) * 100);

    return {
      success: true,
      totalCards: cards.length,
      cardsWithBlankWords,
      cardsWithoutBlankWords,
      percentage,
      needsGeneration: cardsWithoutBlankWords > 0,
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}