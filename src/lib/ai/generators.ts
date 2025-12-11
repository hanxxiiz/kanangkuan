// lib/ai/generators.ts

import { GoogleGenAI } from '@google/genai';

// ============================================
// TYPES
// ============================================

interface Flashcard {
  front: string;
  back: string;
}

interface Card {
  front: string;
  back: string;
}

interface CardAnswer {
  back: string;
}

// ============================================
// HELPER: Get AI Client
// ============================================

function getAIClient() {
  const apiKey = process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_KEY is not set");
  }
  
  return new GoogleGenAI({ apiKey });
}

// ============================================
// 1. GENERATE FLASHCARDS
// ============================================

export async function generateFlashcardsFromText(text: string): Promise<Flashcard[]> {
  console.log('[AI-FLASHCARDS] Starting generation...');
  console.log('[AI-FLASHCARDS] Text length:', text?.length);
  
  if (!text) {
    throw new Error('No text provided');
  }

  const ai = getAIClient();
  
  const systemInstruction = `You are an expert flashcard generator. Your task is to:

1. Analyze the provided text content
2. Generate high-quality question-and-answer flashcards
3. Return ONLY valid JSON - no markdown, no explanation, no extra text
4. Format: { "flashcards": [{ "front": "question", "back": "answer" }] }

Rules for flashcard creation:
- Create clear, focused questions (front side)
- Provide accurate, concise answers (back side)
- Cover key concepts, definitions, facts, and important details
- Each flashcard should test one specific piece of knowledge
- Questions should be specific and answerable
- Answers should be complete but concise
- Generate between 5-20 flashcards depending on content length
- Ensure questions are diverse (definitions, explanations, examples, comparisons)

CRITICAL: Return ONLY the JSON object. No markdown code blocks, no explanations.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will generate flashcards and return only valid JSON.' }],
    },
    {
      role: 'user',
      parts: [{ text: `Generate flashcards from this content:\n\n${text}` }],
    },
  ];

  let fullResponse = '';
  
  console.log('[AI-FLASHCARDS] Calling Gemini API...');
  
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: -1 },
      },
      contents,
    });

    for await (const chunk of response) {
      fullResponse += chunk.text || '';
    }
    
    console.log('[AI-FLASHCARDS] Primary model SUCCESS, response length:', fullResponse.length);
    
  } catch (primaryError) {
    console.log('[AI-FLASHCARDS] Primary model FAILED, trying fallback...');
    
    try {
      const fallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        config: {
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: -1 },
        },
        contents,
      });

      for await (const chunk of fallbackResponse) {
        fullResponse += chunk.text || '';
      }
      
      console.log('[AI-FLASHCARDS] Fallback model SUCCESS');
      
    } catch (fallbackError) {
      console.log('[AI-FLASHCARDS] Fallback FAILED, trying final fallback...');
      
      const finalFallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        config: {
          temperature: 0.7,
        },
        contents,
      });

      for await (const chunk of finalFallbackResponse) {
        fullResponse += chunk.text || '';
      }
      
      console.log('[AI-FLASHCARDS] Final fallback SUCCESS');
    }
  }

  console.log('[AI-FLASHCARDS] Parsing response...');

  const cleanedResponse = fullResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let parsedData;
  try {
    parsedData = JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('[AI-FLASHCARDS] JSON parse error:', parseError);
    console.error('[AI-FLASHCARDS] Response was:', cleanedResponse.substring(0, 500));
    throw new Error('Failed to parse AI response as JSON');
  }

  if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
    throw new Error('Invalid flashcard format');
  }

  const validFlashcards = parsedData.flashcards.filter((card: Flashcard) => 
    card.front && card.back && 
    typeof card.front === 'string' && 
    typeof card.back === 'string'
  );

  if (validFlashcards.length === 0) {
    throw new Error('No valid flashcards generated');
  }

  console.log('[AI-FLASHCARDS] SUCCESS:', validFlashcards.length, 'flashcards');
  
  return validFlashcards;
}

// ============================================
// 2. GENERATE WRONG OPTIONS (BATCH)
// ============================================

export async function generateWrongOptionsBatch(cards: Card[]): Promise<string[][]> {
  console.log(`[AI-WRONG-OPTIONS] Generating for ${cards.length} cards...`);

  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    throw new Error('Invalid cards array');
  }

  const ai = getAIClient();

  const cardsText = cards
    .map((card, idx) => `Card ${idx + 1}:\nQuestion: ${card.front}\nAnswer: ${card.back}`)
    .join('\n\n');

  const systemInstruction = `You are generating wrong answer options for multiple flashcards. For EACH card, provide exactly 3 plausible but incorrect options.

${cardsText}

Return your response as a JSON object with a "results" array where each element contains 3 wrong options:

{
  "results": [
    { "wrong_options": ["wrong1", "wrong2", "wrong3"] },
    { "wrong_options": ["wrong1", "wrong2", "wrong3"] },
    ...
  ]
}

Requirements:
- Generate wrong options for ALL ${cards.length} cards
- Each card gets exactly 3 wrong options
- Wrong options should be plausible but clearly incorrect
- Keep options concise (under 50 words each)
- Maintain the same order as the input cards
- Return ONLY the JSON object, no markdown code blocks, no explanations`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will generate wrong options for all cards and return only valid JSON.' }],
    },
    {
      role: 'user',
      parts: [{ text: 'Generate the wrong options now.' }],
    },
  ];

  let fullResponse = '';

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: -1 },
      },
      contents,
    });

    for await (const chunk of response) {
      fullResponse += chunk.text || '';
    }
  } catch {
    console.log('[AI-WRONG-OPTIONS] Primary model failed, trying fallback...');

    try {
      const fallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        config: {
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: -1 },
        },
        contents,
      });

      for await (const chunk of fallbackResponse) {
        fullResponse += chunk.text || '';
      }
    } catch {
      console.log('[AI-WRONG-OPTIONS] Fallback failed, trying final...');

      const finalFallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        config: {
          temperature: 0.8,
        },
        contents,
      });

      for await (const chunk of finalFallbackResponse) {
        fullResponse += chunk.text || '';
      }
    }
  }

  const cleanedText = fullResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let parsedData;
  try {
    parsedData = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('[AI-WRONG-OPTIONS] JSON parse error:', parseError);
    throw new Error('Failed to parse AI response as JSON');
  }

  const parsedOptions = parsedData.results || parsedData;

  if (!Array.isArray(parsedOptions) || parsedOptions.length !== cards.length) {
    throw new Error(`Expected ${cards.length} sets of options, got ${parsedOptions.length}`);
  }

  const allWrongOptions = [];
  for (let i = 0; i < parsedOptions.length; i++) {
    const result = parsedOptions[i];
    const wrongOpts = result.wrong_options || result;

    if (!Array.isArray(wrongOpts) || wrongOpts.length !== 3) {
      throw new Error(`Card ${i + 1} has invalid wrong options`);
    }

    allWrongOptions.push(wrongOpts);
  }

  console.log(`[AI-WRONG-OPTIONS] SUCCESS: ${cards.length} cards`);

  return allWrongOptions;
}

// ============================================
// 3. GENERATE BLANK WORDS (BATCH)
// ============================================

export async function generateBlankWordsBatch(cards: CardAnswer[]): Promise<string[]> {
  console.log(`[AI-BLANK-WORDS] Generating for ${cards.length} cards...`);

  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    throw new Error('Invalid cards array');
  }

  const ai = getAIClient();

  const answersText = cards
    .map((card, idx) => `Answer ${idx + 1}: ${card.back}`)
    .join('\n');

  const systemInstruction = `You are identifying the most important word or short phrase in each answer that should be blanked out for a fill-in-the-blank exercise.

${answersText}

Return your response as a JSON object with a "blank_words" array:

{
  "blank_words": ["blank1", "blank2", "blank3", ...]
}

Requirements:
- Generate a blank word for ALL ${cards.length} answers
- Choose the MOST important/central concept in each answer
- Prefer single words, but 2-3 word phrases are acceptable if critical
- The blank should make the answer incomplete without it
- Maintain the same order as the input answers
- Return ONLY the JSON object, no markdown code blocks, no explanations`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will select blank words for all answers and return only valid JSON.' }],
    },
    {
      role: 'user',
      parts: [{ text: 'Generate the blank words now.' }],
    },
  ];

  let fullResponse = '';

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: -1 },
      },
      contents,
    });

    for await (const chunk of response) {
      fullResponse += chunk.text || '';
    }
  } catch {
    console.log('[AI-BLANK-WORDS] Primary model failed, trying fallback...');

    try {
      const fallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        config: {
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: -1 },
        },
        contents,
      });

      for await (const chunk of fallbackResponse) {
        fullResponse += chunk.text || '';
      }
    } catch {
      console.log('[AI-BLANK-WORDS] Fallback failed, trying final...');

      const finalFallbackResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        config: {
          temperature: 0.3,
        },
        contents,
      });

      for await (const chunk of finalFallbackResponse) {
        fullResponse += chunk.text || '';
      }
    }
  }

  const cleanedText = fullResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  let parsedData;
  try {
    parsedData = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error('[AI-BLANK-WORDS] JSON parse error:', parseError);
    throw new Error('Failed to parse AI response as JSON');
  }

  const parsedBlankWords = parsedData.blank_words || parsedData;

  if (!Array.isArray(parsedBlankWords) || parsedBlankWords.length !== cards.length) {
    throw new Error(`Expected ${cards.length} blank words, got ${parsedBlankWords.length}`);
  }

  for (let i = 0; i < parsedBlankWords.length; i++) {
    if (typeof parsedBlankWords[i] !== 'string' || !parsedBlankWords[i].trim()) {
      throw new Error(`Blank word ${i + 1} is invalid`);
    }
  }

  console.log(`[AI-BLANK-WORDS] SUCCESS: ${cards.length} cards`);

  return parsedBlankWords;
}