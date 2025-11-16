import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

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
    } catch (primaryError: any) {
      console.log('Primary model failed, trying gemini-2.5-flash-lite...');
      
      try {
        const fallbackResponse = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash-lite',
          config: {
            temperature: 0.7,
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
            temperature: 0.7,
          },
          contents,
        });

        for await (const chunk of finalFallbackResponse) {
          fullResponse += chunk.text || '';
        }
      }
    }

    // Clean response and parse JSON
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
    if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
      throw new Error('Invalid flashcard format');
    }

    // Validate each flashcard
    const validFlashcards = parsedData.flashcards.filter((card: any) => 
      card.front && card.back && 
      typeof card.front === 'string' && 
      typeof card.back === 'string'
    );

    if (validFlashcards.length === 0) {
      throw new Error('No valid flashcards generated');
    }

    return NextResponse.json({ 
      success: true, 
      flashcards: validFlashcards
    });

  } catch (error: any) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        flashcards: null, 
        error: error.message || 'Flashcard generation failed'
      },
      { status: 500 }
    );
  }
}