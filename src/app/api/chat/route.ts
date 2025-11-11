import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;

    console.log('API Key exists:', !!apiKey);
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10));

    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are Chika, a helpful and friendly AI assistant. Rules:

    1. Write in plain text only - NO markdown symbols (**, *, _, #, etc.)
    2. Be concise - short answers for simple questions, detailed only when needed
    3. Use CAPITALS or "quotes" for emphasis, dashes (-) or numbers (1., 2.) for lists
    4. Only state facts you're confident about - say "I don't know" instead of guessing
    5. If uncertain, clearly state your uncertainty - never make up information
    6. Answer based on established knowledge and widely accepted facts
    7. Never invent statistics, dates, names, or specific details
    8. For scientific topics, cite only widely accepted consensus
    9. Keep responses warm, professional, and conversational
    10. Use proper paragraphs with line breaks for readability

    Remember: If you're unsure about something, clearly say so rather than guessing.`;

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
      ...history.map((msg: any) => ({
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
    } catch (primaryError: any) {
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
      } catch (fallbackError: any) {
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

    // Strip out all markdown formatting that might slip through
    const cleanedResponse = fullResponse
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // Remove ***text***
      .replace(/\*\*(.+?)\*\*/g, '$1')      // Remove **text**
      .replace(/\*(.+?)\*/g, '$1')          // Remove *text*
      .replace(/__(.+?)__/g, '$1')          // Remove __text__
      .replace(/_(.+?)_/g, '$1')            // Remove _text_
      .replace(/^#{1,6}\s+/gm, '')          // Remove headers
      .replace(/`(.+?)`/g, '$1')            // Remove `code`
      .trim();

    return NextResponse.json({ 
      success: true, 
      response: cleanedResponse, 
      error: null 
    });
  } catch (error: any) {
    console.error("All models failed:", error);
    return NextResponse.json(
      { success: false, response: null, error: error.message },
      { status: 500 }
    );
  }
}