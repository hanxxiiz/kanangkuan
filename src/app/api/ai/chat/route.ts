import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  history: ChatMessage[];
  cardContext?: {
    front: string;
    back: string;
  };
  isInitialExplanation?: boolean;
}

export async function POST(req: Request) {
  try {
    const { message, history, cardContext, isInitialExplanation } = await req.json() as RequestBody;
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;

    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });
    
    let systemInstruction = `You are Chika, a helpful and friendly AI assistant specialized in explaining flashcard concepts. Rules:

    1. Write in plain text only - NO markdown symbols (**, *, _, #, etc.)
    2. Be concise - short answers for simple questions, detailed only when needed
    3. Use CAPITALS or "quotes" for emphasis, dashes (-) or numbers (1., 2.) for lists
    4. Only state facts you're confident about - say "I don't know" instead of guessing
    5. If uncertain, clearly state your uncertainty - never make up information
    6. Answer based on established knowledge and widely accepted facts
    7. Never invent statistics, dates, names, or specific details
    8. Keep responses warm, professional, and conversational
    9. Use proper paragraphs with line breaks for readability
    10. ALWAYS start your responses with "Hey classmate!" as a friendly greeting


    Remember: If you're unsure about something, clearly say so rather than guessing.`;

    if (isInitialExplanation) {
      systemInstruction += `\n\nThis is your first message. Directly explain the CONTENT and CONCEPT shown in this flashcard. Do NOT explain what a flashcard is or what "front" and "back" mean. Jump straight into explaining the actual topic, concept, or information presented. Provide helpful context, examples, or elaboration to help the user understand the material better.`;
    } else if (cardContext) {
      systemInstruction += `\n\nContext: You are helping explain this flashcard:\nFront: ${cardContext.front}\nBack: ${cardContext.back}\n\nAnswer the user's follow-up question while keeping this flashcard content in mind.`;
    }

    const userMessage = message;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemInstruction }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood! I will provide accurate, concise responses in plain text based on facts and context provided.' }],
      },
      ...history.map((msg: ChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }],
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
    } catch (primaryError: unknown) {
      console.log('Primary model (gemini-2.5-flash) failed, trying gemini-2.5-flash-lite...');
      console.error('Primary model error:', primaryError);
      
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
      } catch (fallbackError: unknown) {
        console.error('Second model (gemini-2.5-flash-lite) failed, trying gemini-2.0-flash...');
        console.error('Fallback model error:', fallbackError);
        
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
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/`(.+?)`/g, '$1')
      .trim();

    return NextResponse.json({ 
      success: true, 
      response: cleanedResponse, 
      error: null 
    });
  } catch (error: unknown) {
    console.error("All models failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { success: false, response: null, error: errorMessage },
      { status: 500 }
    );
  }
}