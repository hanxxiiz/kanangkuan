// src/app/api/text-extraction/pptx/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import OfficeParser from 'officeparser';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Processing PPTX file:', file.name, 'Size:', file.size);

    // Create temp file with proper .pptx extension
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    tempFilePath = path.join(tempDir, `${timestamp}.pptx`);

    await fs.writeFile(tempFilePath, buffer);
    console.log('Temp file created:', tempFilePath);

    // Extract text using OfficeParser - wrap callback in Promise
    const text = await new Promise<string>((resolve, reject) => {
      OfficeParser.parseOffice(tempFilePath!, (data: string, err: Error | null) => {
        if (err) {
          console.error('OfficeParser error:', err);
          reject(err);
        } else {
          console.log('Extracted text length:', data?.length || 0);
          console.log('First 200 chars:', data?.substring(0, 200));
          resolve(data || '');
        }
      });
    });

    // Clean up temp file
    await fs.unlink(tempFilePath);
    tempFilePath = null;

    if (!text || text.trim().length === 0) {
      console.warn('Warning: No text content extracted from PPTX');
      return NextResponse.json({ 
        success: false,
        text: '',
        message: 'No text content found in the PowerPoint file'
      });
    }

    return NextResponse.json({ 
      success: true,
      text: text.trim()
    });
  } catch (error) {
    console.error('PPTX extraction error:', error);
    
    // Clean up temp file if it exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to extract text from PPTX',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}