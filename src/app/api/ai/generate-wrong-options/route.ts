import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { front, back } = await req.json();
    
    if (!front || !back) {
      return NextResponse.json(
        { success: false, error: 'Question (front) and answer (back) are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are an expert at generating plausible wrong answer options for multiple-choice questions.

    Your task:
    1. Given a question (front) and correct answer (back), generate 3 wrong options
    2. Wrong options must be plausible but clearly incorrect
    3. They should be similar in length and style to the correct answer
    4. Avoid obviously wrong or silly options
    5. Make them challenging but fair distractors
    6. Return ONLY valid JSON - no markdown, no explanation

    Format: { "wrong_options": ["option1", "option2", "option3"] }

    Rules:
    - Each wrong option should be distinct from others
    - Options should be in the same domain/category as the correct answer
    - They should test similar knowledge but be factually incorrect
    - Keep similar formatting/structure to the correct answer
    - Don't make options that are partially correct

    CRITICAL: Return ONLY the JSON object. No markdown code blocks, no explanations.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I will generate 3 plausible wrong options and return only valid JSON.' }],
      },
      {
        role: 'user',
        parts: [{ 
          text: `Generate 3 wrong options for this flashcard:
            Question: ${front}
            Correct Answer: ${back}` 
        }],
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
    } catch (primaryError: any) {
      console.log('Primary model failed, trying gemini-2.5-flash-lite...');
      
      try {
        const fallbackResponse = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash-lite',
          config: {
            temperature: 0.8,
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
            temperature: 0.8,
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
    if (!parsedData.wrong_options || !Array.isArray(parsedData.wrong_options)) {
      throw new Error('Invalid wrong options format');
    }

    // Validate we have exactly 3 options
    if (parsedData.wrong_options.length !== 3) {
      throw new Error('Expected exactly 3 wrong options');
    }

    // Validate each option is a non-empty string
    const validOptions = parsedData.wrong_options.every((opt: any) => 
      typeof opt === 'string' && opt.trim().length > 0
    );

    if (!validOptions) {
      throw new Error('Invalid wrong option format');
    }

    return NextResponse.json({ 
      success: true, 
      wrong_options: parsedData.wrong_options
    });

  } catch (error: any) {
    console.error("Wrong options generation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        wrong_options: null, 
        error: error.message || 'Wrong options generation failed'
      },
      { status: 500 }
    );
  }
}