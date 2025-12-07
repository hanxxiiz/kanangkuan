// app/api/ai/generate-blank-words-batch/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface CardAnswer {
  back: string;
}

export async function POST(request: Request) {
  try {
    const { cards }: { cards: CardAnswer[] } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid cards array' },
        { status: 400 }
      );
    }

    console.log(`Generating blank words for ${cards.length} cards in batch...`);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });

    // Create the prompt for ALL cards at once
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
      console.log('Primary model failed, trying gemini-2.5-pro...');

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
        console.log('Second model failed, trying gemini-2.5-flash-lite...');

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

    console.log('Raw AI response:', fullResponse);

    // Clean and parse the response
    const cleanedText = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response was:', cleanedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Extract blank_words array
    const parsedBlankWords = parsedData.blank_words || parsedData;

    // Validate response structure
    if (!Array.isArray(parsedBlankWords) || parsedBlankWords.length !== cards.length) {
      throw new Error(`Expected ${cards.length} blank words, got ${parsedBlankWords.length}`);
    }

    // Validate each blank word is a non-empty string
    for (let i = 0; i < parsedBlankWords.length; i++) {
      if (typeof parsedBlankWords[i] !== 'string' || !parsedBlankWords[i].trim()) {
        throw new Error(`Blank word ${i + 1} is invalid`);
      }
    }

    console.log(`Successfully generated blank words for ${cards.length} cards`);

    return NextResponse.json({
      success: true,
      blank_words: parsedBlankWords,
    });

  } catch (error) {
    console.error('Blank words batch generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}