import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { back } = await req.json();
    
    if (!back) {
      return NextResponse.json(
        { success: false, error: 'No back content provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are an expert at selecting the most important word or phrase for active recall learning. Your task is to:

    1. Analyze the provided answer text (back of flashcard)
    2. Select the SINGLE most important word or short phrase (1-5 words max) that should be blanked out
    3. Return ONLY valid JSON - no markdown, no explanation, no extra text
    4. Format: { "blank_word": "selected word or phrase" }

    Selection criteria:
    - Choose the MOST critical keyword, concept, term, or name
    - Should be specific and meaningful (not generic words like "is", "the", "very")
    - Should be a word/phrase that tests core understanding
    - Prefer nouns, proper nouns, technical terms, or key concepts
    - If it's a definition, choose the term being defined
    - If it's a fact, choose the key detail (date, name, number, place)
    - Keep it SHORT - ideally 1 word, maximum 5 words

    CRITICAL: Return ONLY the JSON object with "blank_word" key. No markdown code blocks, no explanations.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I will select the best word/phrase for blanking and return only valid JSON.' }],
      },
      {
        role: 'user',
        parts: [{ text: `Select the best word/phrase to blank from this answer:\n\n${back}` }],
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
    } catch (primaryError: any) {
      console.log('Primary model failed, trying gemini-2.5-flash-lite...');
      
      try {
        const fallbackResponse = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash-lite',
          config: {
            temperature: 0.3,
            thinkingConfig: { thinkingBudget: -1 },
          },
          contents,
        });

        for await (const chunk of fallbackResponse) {
          fullResponse += chunk.text || '';
        }
      } catch (fallbackError: any) {
        console.log('Second model failed, trying gemini-2.0-flash...');
        
        const finalFallbackResponse = await ai.models.generateContentStream({
          model: 'gemini-2.0-flash',
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

    const cleanedResponse = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response was:', cleanedResponse);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsedData.blank_word || typeof parsedData.blank_word !== 'string') {
      throw new Error('Invalid blank_word format');
    }

    // Trim and validate the blank word
    const blankWord = parsedData.blank_word.trim();
    
    if (blankWord.length === 0 || blankWord.length > 50) {
      throw new Error('Invalid blank_word length');
    }

    return NextResponse.json({ 
      success: true, 
      blank_word: blankWord
    });

  } catch (error: any) {
    console.error("Blank word generation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        blank_word: null, 
        error: error.message || 'Blank word generation failed'
      },
      { status: 500 }
    );
  }
}