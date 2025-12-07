// app/api/ai/generate-wrong-options-batch/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface Card {
  front: string;
  back: string;
}

export async function POST(request: Request) {
  try {
    const { cards }: { cards: Card[] } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid cards array' },
        { status: 400 }
      );
    }

    console.log(`Generating wrong options for ${cards.length} cards in batch...`);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });

    // Create the prompt for ALL cards at once
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
      console.log('Primary model failed, trying gemini-2.5-pro...');

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
        console.log('Second model failed, trying gemini-2.5-flash-lite...');

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

    // Extract the results array
    const parsedOptions = parsedData.results || parsedData;

    // Validate response structure
    if (!Array.isArray(parsedOptions) || parsedOptions.length !== cards.length) {
      throw new Error(`Expected ${cards.length} sets of options, got ${parsedOptions.length}`);
    }

    // Validate and extract wrong_options from each result
    const allWrongOptions = [];
    for (let i = 0; i < parsedOptions.length; i++) {
      const result = parsedOptions[i];
      const wrongOpts = result.wrong_options || result;

      if (!Array.isArray(wrongOpts) || wrongOpts.length !== 3) {
        throw new Error(`Card ${i + 1} has invalid wrong options`);
      }

      allWrongOptions.push(wrongOpts);
    }

    console.log(`Successfully generated wrong options for ${cards.length} cards`);

    return NextResponse.json({
      success: true,
      options: allWrongOptions,
    });

  } catch (error) {
    console.error('Wrong options batch generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}