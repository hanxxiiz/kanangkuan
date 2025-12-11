/** TEXT EXTRACTION UTILITY
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles text extraction from multiple file formats:
 * - PDF (pdf-parse)
 * - Word Documents (mammoth)
 * - Excel/CSV (xlsx + papaparse)
 * - PowerPoint (xlsx - extracts text from slides)
 * - Plain Text
 * ═══════════════════════════════════════════════════════════════════════════
 */

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import officeParser from 'officeparser';
import { extractText as unpdfExtract } from 'unpdf';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount?: number;
  metadata?: Record<string, unknown>;
}

export type SupportedFileType = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'csv' | 'txt';

// ═══════════════════════════════════════════════════════════════════════════
// PDF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[PDF] Starting extraction, buffer size:', buffer.length);
  
  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);
    console.log('[PDF] Converted to Uint8Array, length:', uint8Array.length);
    
    const { text, totalPages } = await unpdfExtract(uint8Array, {
      mergePages: true,
    });
    
    console.log('[PDF] Extraction complete:', {
      textLength: text?.length || 0,
      totalPages,
      hasText: !!text,
      firstChars: text?.substring(0, 100)
    });
    
    if (!text || text.trim().length === 0) {
      console.error('[PDF] ERROR: No text content found');
      throw new Error('No text content found in PDF');
    }

    const result = {
      text: text.trim(),
      pageCount: totalPages,
      wordCount: text.split(/\s+/).length,
    };
    
    console.log('[PDF] SUCCESS:', {
      wordCount: result.wordCount,
      pageCount: result.pageCount
    });

    return result;
  } catch (error) {
    console.error('[PDF] EXTRACTION FAILED:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from PDF'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCX EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromDOCX(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[DOCX] Starting extraction, buffer size:', buffer.length);
  
  try {
    console.log('[DOCX] Calling mammoth.extractRawText...');
    const result = await mammoth.extractRawText({ buffer });
    
    console.log('[DOCX] Mammoth result:', {
      hasValue: !!result.value,
      valueLength: result.value?.length || 0,
      firstChars: result.value?.substring(0, 100),
      messagesCount: result.messages?.length || 0,
      messages: result.messages
    });
    
    if (!result.value || result.value.trim().length === 0) {
      console.error('[DOCX] ERROR: No text content found');
      console.error('[DOCX] Mammoth messages:', result.messages);
      throw new Error('No text content found in DOCX');
    }

    const text = result.value.trim();
    
    const extractionResult = {
      text,
      wordCount: text.split(/\s+/).length,
    };
    
    console.log('[DOCX] SUCCESS:', {
      wordCount: extractionResult.wordCount,
      textLength: text.length
    });
    
    return extractionResult;
  } catch (error) {
    console.error('[DOCX] EXTRACTION FAILED:', {
      errorType: error?.constructor?.name,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      bufferSize: buffer.length
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from DOCX'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PPTX EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromPPTX(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[PPTX] Starting extraction, buffer size:', buffer.length);
  
  try {
    console.log('[PPTX] Calling officeParser.parseOfficeAsync...');
    const text = await officeParser.parseOfficeAsync(buffer);
    
    console.log('[PPTX] Parser result:', {
      hasText: !!text,
      textLength: text?.length || 0,
      firstChars: text?.substring(0, 100)
    });
    
    if (!text || text.trim().length === 0) {
      console.error('[PPTX] ERROR: No text content found');
      throw new Error('No text content found in PPTX');
    }

    const cleanText = text.trim();
    
    const result = {
      text: cleanText,
      wordCount: cleanText.split(/\s+/).length,
    };
    
    console.log('[PPTX] SUCCESS:', {
      wordCount: result.wordCount,
      textLength: cleanText.length
    });
    
    return result;
  } catch (error) {
    console.error('[PPTX] EXTRACTION FAILED:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from PPTX'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// XLSX EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromXLSX(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[XLSX] Starting extraction, buffer size:', buffer.length);
  
  try {
    console.log('[XLSX] Reading workbook...');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    console.log('[XLSX] Workbook loaded:', {
      sheetCount: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames
    });
    
    const textContent: string[] = [];
    
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`[XLSX] Processing sheet ${index + 1}:`, sheetName);
      const sheet = workbook.Sheets[sheetName];
      
      // Add sheet name as header
      textContent.push(`Sheet: ${sheetName}`);
      
      // Convert sheet to CSV format for better text representation
      const csv = XLSX.utils.sheet_to_csv(sheet);
      
      console.log(`[XLSX] Sheet "${sheetName}" CSV length:`, csv.length);
      
      if (csv.trim()) {
        textContent.push(csv);
      }
    });

    if (textContent.length === 0) {
      console.error('[XLSX] ERROR: No text content found');
      throw new Error('No text content found in XLSX');
    }

    const text = textContent.join('\n\n');
    
    const result = {
      text,
      wordCount: text.split(/\s+/).length,
    };
    
    console.log('[XLSX] SUCCESS:', {
      wordCount: result.wordCount,
      textLength: text.length,
      sheetsProcessed: workbook.SheetNames.length
    });
    
    return result;
  } catch (error) {
    console.error('[XLSX] EXTRACTION FAILED:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from XLSX'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CSV EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromCSV(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[CSV] Starting extraction, buffer size:', buffer.length);
  
  try {
    const csvText = buffer.toString('utf-8');
    console.log('[CSV] Converted to UTF-8, length:', csvText.length);
    
    // Parse CSV to validate and format
    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    console.log('[CSV] Papa parse result:', {
      rowCount: parsed.data.length,
      errorCount: parsed.errors.length,
      hasData: !!parsed.data
    });

    if (parsed.errors.length > 0) {
      console.warn('[CSV] WARNING: Parsing warnings:', parsed.errors);
    }

    if (!parsed.data || parsed.data.length === 0) {
      console.error('[CSV] ERROR: No data found');
      throw new Error('No data found in CSV');
    }

    // Convert parsed data back to readable text format
    const textLines = (parsed.data as unknown[][]).map(row => 
      Array.isArray(row) ? row.join(' | ') : String(row)
    );

    const text = textLines.join('\n');
    
    const result = {
      text,
      wordCount: text.split(/\s+/).length,
    };
    
    console.log('[CSV] SUCCESS:', {
      wordCount: result.wordCount,
      rowCount: textLines.length,
      textLength: text.length
    });
    
    return result;
  } catch (error) {
    console.error('[CSV] EXTRACTION FAILED:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from CSV'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TXT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

async function extractFromTXT(buffer: Buffer): Promise<ExtractionResult> {
  console.log('[TXT] Starting extraction, buffer size:', buffer.length);
  
  try {
    const text = buffer.toString('utf-8').trim();
    
    console.log('[TXT] Text extracted:', {
      length: text.length,
      isEmpty: text.length === 0,
      firstChars: text.substring(0, 100)
    });
    
    if (!text || text.length === 0) {
      console.error('[TXT] ERROR: File is empty');
      throw new Error('Text file is empty');
    }

    const result = {
      text,
      wordCount: text.split(/\s+/).length,
    };
    
    console.log('[TXT] SUCCESS:', {
      wordCount: result.wordCount,
      textLength: text.length
    });

    return result;
  } catch (error) {
    console.error('[TXT] EXTRACTION FAILED:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to extract text from TXT'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<ExtractionResult> {
  const normalizedType = fileType.toLowerCase().replace('.', '') as SupportedFileType;
  
  console.log('===============================================================');
  console.log('TEXT EXTRACTION STARTED');
  console.log('===============================================================');
  console.log('File Type:', normalizedType.toUpperCase());
  console.log('Buffer Size:', buffer.length, 'bytes');
  console.log('Timestamp:', new Date().toISOString());
  console.log('===============================================================');

  try {
    let result: ExtractionResult;

    switch (normalizedType) {
      case 'pdf':
        result = await extractFromPDF(buffer);
        break;
      
      case 'docx':
        result = await extractFromDOCX(buffer);
        break;
      
      case 'pptx':
        result = await extractFromPPTX(buffer);
        break;
      
      case 'xlsx':
        result = await extractFromXLSX(buffer);
        break;
      
      case 'csv':
        result = await extractFromCSV(buffer);
        break;
      
      case 'txt':
        result = await extractFromTXT(buffer);
        break;
      
      default:
        console.error('ERROR: Unsupported file type:', fileType);
        throw new Error(
          `Unsupported file type: ${fileType}. ` +
          'Supported types: PDF, DOCX, PPTX, XLSX, CSV, TXT'
        );
    }

    console.log('===============================================================');
    console.log('TEXT EXTRACTION COMPLETED SUCCESSFULLY');
    console.log('===============================================================');
    console.log('Final Result:', {
      textLength: result.text.length,
      wordCount: result.wordCount,
      pageCount: result.pageCount || 'N/A'
    });
    console.log('===============================================================');

    return result;
  } catch (error) {
    console.error('===============================================================');
    console.error('TEXT EXTRACTION FAILED');
    console.error('===============================================================');
    console.error('File Type:', normalizedType.toUpperCase());
    console.error('Error:', error);
    console.error('===============================================================');
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPER
// ═══════════════════════════════════════════════════════════════════════════

export function isSupportedFileType(fileType: string): boolean {
  const supportedTypes: SupportedFileType[] = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'txt'];
  const normalized = fileType.toLowerCase().replace('.', '');
  const isSupported = supportedTypes.includes(normalized as SupportedFileType);
  
  console.log('[VALIDATION] File type check:', {
    original: fileType,
    normalized,
    isSupported,
    supportedTypes
  });
  
  return isSupported;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE: Extract from File Path
// ═══════════════════════════════════════════════════════════════════════════

export async function extractTextFromFile(
  filePath: string,
  buffer: Buffer
): Promise<ExtractionResult> {
  console.log('[FILE] extractTextFromFile called:', {
    filePath,
    bufferSize: buffer.length
  });
  
  const extension = filePath.split('.').pop() || '';
  
  console.log('[FILE] Extracted extension:', extension);
  
  if (!isSupportedFileType(extension)) {
    console.error('[FILE] ERROR: Unsupported extension:', extension);
    throw new Error(`Unsupported file extension: .${extension}`);
  }
  
  return extractText(buffer, extension);
}