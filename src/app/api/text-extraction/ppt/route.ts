import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pptxParser from 'pptx-parser';

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

    const slides = await pptxParser(buffer);
    const text = slides.map((slide: any) => slide.text).join('\n\n');

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error('PPTX extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PPTX' },
      { status: 500 }
    );
  }
}