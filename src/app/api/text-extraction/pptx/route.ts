import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // @ts-expect-error - pptx-parser has no TypeScript definitions
    const pptxParser = (await import('pptx-parser')).default;
    
    const slides = await pptxParser(buffer);
    const text = slides.map((slide: { text: string }) => slide.text).join('\n\n');

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('PPTX extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PPTX' },
      { status: 500 }
    );
  }
}