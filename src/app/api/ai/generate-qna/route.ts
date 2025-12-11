import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

// Vercel timeout config (10s for Hobby, 60s for Pro)
export const maxDuration = 10;

interface RequestBody {
  text: string;
}

interface Flashcard {
  front: string;
  back: string;
}

export async function POST(req: Request) {
  console.log('[GENERATE-QNA] ===== REQUEST START =====');
  console.log('[GENERATE-QNA] Timestamp:', new Date().toISOString());
  
  try {
    const { text } = await req.json() as RequestBody;
    
    console.log('[GENERATE-QNA] Text received, length:', text?.length);
    
    if (!text) {
      console.log('[GENERATE-QNA] ERROR: No text provided');
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    // SECURITY FIX: Use GEMINI_KEY not NEXT_PUBLIC_GEMINI_KEY
    const apiKey = process.env.GEMINI_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
    
    if (!apiKey) {
      console.log('[GENERATE-QNA] ERROR: API key missing');
      console.log('[GENERATE-QNA] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      throw new Error("GEMINI_KEY is not set");
    }

    console.log('[GENERATE-QNA] API key found');
    console.log('[GENERATE-QNA] Initializing GoogleGenAI...');
    
    const ai = new GoogleGenAI({ apiKey });
    
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
    
    console.log('[GENERATE-QNA] Starting AI generation with gemini-2.5-flash...');
    
    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        config: {
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: -1 },
        },
        contents,
      });

      console.log('[GENERATE-QNA] Streaming response chunks...');
      
      for await (const chunk of response) {
        fullResponse += chunk.text || '';
      }
      
      console.log('[GENERATE-QNA] Primary model SUCCESS, response length:', fullResponse.length);
      
    } catch (primaryError) {
      console.log('[GENERATE-QNA] Primary model FAILED:', primaryError);
      console.log('[GENERATE-QNA] Trying fallback: gemini-2.5-pro...');
      
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
        
        console.log('[GENERATE-QNA] Fallback model SUCCESS, response length:', fullResponse.length);
        
      } catch (fallbackError) {
        console.log('[GENERATE-QNA] Fallback model FAILED:', fallbackError);
        console.log('[GENERATE-QNA] Trying final fallback: gemini-2.5-flash-lite...');
        
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
        
        console.log('[GENERATE-QNA] Final fallback SUCCESS, response length:', fullResponse.length);
      }
    }

    console.log('[GENERATE-QNA] Cleaning and parsing response...');
    console.log('[GENERATE-QNA] Raw response preview:', fullResponse.substring(0, 200));

    // Clean response and parse JSON
    const cleanedResponse = fullResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
      console.log('[GENERATE-QNA] JSON parse SUCCESS');
    } catch (parseError) {
      console.error('[GENERATE-QNA] JSON PARSE ERROR:', parseError);
      console.error('[GENERATE-QNA] Cleaned response was:', cleanedResponse.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
      console.error('[GENERATE-QNA] Invalid structure:', parsedData);
      throw new Error('Invalid flashcard format');
    }

    console.log('[GENERATE-QNA] Validating flashcards...');

    // Validate each flashcard
    const validFlashcards = parsedData.flashcards.filter((card: Flashcard) => 
      card.front && card.back && 
      typeof card.front === 'string' && 
      typeof card.back === 'string'
    );

    console.log('[GENERATE-QNA] Valid flashcards:', validFlashcards.length, '/', parsedData.flashcards.length);

    if (validFlashcards.length === 0) {
      throw new Error('No valid flashcards generated');
    }

    console.log('[GENERATE-QNA] ===== SUCCESS =====');
    console.log('[GENERATE-QNA] Generated', validFlashcards.length, 'flashcards');

    return NextResponse.json({ 
      success: true, 
      flashcards: validFlashcards
    });

  } catch (error: unknown) {
    console.error("[GENERATE-QNA] ===== FATAL ERROR =====");
    console.error("[GENERATE-QNA] Error:", error);
    
    if (error instanceof Error) {
      console.error("[GENERATE-QNA] Message:", error.message);
      console.error("[GENERATE-QNA] Stack:", error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Flashcard generation failed';
    
    return NextResponse.json(
      { 
        success: false, 
        flashcards: null, 
        error: errorMessage
      },
      { status: 500 }
    );
  }
}