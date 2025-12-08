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
  try {
    // Convert Buffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(buffer);
    
    const { text, totalPages } = await unpdfExtract(uint8Array, {
      mergePages: true,
    });
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    return {
      text: text.trim(),
      pageCount: totalPages,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
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
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in DOCX');
    }

    const text = result.value.trim();
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
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
  try {
    const text = await officeParser.parseOfficeAsync(buffer);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in PPTX');
    }

    const cleanText = text.trim();
    
    return {
      text: cleanText,
      wordCount: cleanText.split(/\s+/).length,
    };
  } catch (error) {
    console.error('PPTX extraction error:', error);
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
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    const textContent: string[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      
      // Add sheet name as header
      textContent.push(`Sheet: ${sheetName}`);
      
      // Convert sheet to CSV format for better text representation
      const csv = XLSX.utils.sheet_to_csv(sheet);
      
      if (csv.trim()) {
        textContent.push(csv);
      }
    });

    if (textContent.length === 0) {
      throw new Error('No text content found in XLSX');
    }

    const text = textContent.join('\n\n');
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('XLSX extraction error:', error);
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
  try {
    const csvText = buffer.toString('utf-8');
    
    // Parse CSV to validate and format
    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing warnings:', parsed.errors);
    }

    if (!parsed.data || parsed.data.length === 0) {
      throw new Error('No data found in CSV');
    }

    // Convert parsed data back to readable text format
    const textLines = (parsed.data as unknown[][]).map(row => 
      Array.isArray(row) ? row.join(' | ') : String(row)
    );

    const text = textLines.join('\n');
    
    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('CSV extraction error:', error);
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
  try {
    const text = buffer.toString('utf-8').trim();
    
    if (!text || text.length === 0) {
      throw new Error('Text file is empty');
    }

    return {
      text,
      wordCount: text.split(/\s+/).length,
    };
  } catch (error) {
    console.error('TXT extraction error:', error);
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
  
  console.log(`📄 Extracting text from ${normalizedType.toUpperCase()} (${buffer.length} bytes)`);

  switch (normalizedType) {
    case 'pdf':
      return extractFromPDF(buffer);
    
    case 'docx':
      return extractFromDOCX(buffer);
    
    case 'pptx':
      return extractFromPPTX(buffer);
    
    case 'xlsx':
      return extractFromXLSX(buffer);
    
    case 'csv':
      return extractFromCSV(buffer);
    
    case 'txt':
      return extractFromTXT(buffer);
    
    default:
      throw new Error(
        `Unsupported file type: ${fileType}. ` +
        'Supported types: PDF, DOCX, PPTX, XLSX, CSV, TXT'
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION HELPER
// ═══════════════════════════════════════════════════════════════════════════

export function isSupportedFileType(fileType: string): boolean {
  const supportedTypes: SupportedFileType[] = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'txt'];
  const normalized = fileType.toLowerCase().replace('.', '');
  return supportedTypes.includes(normalized as SupportedFileType);
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE: Extract from File Path
// ═══════════════════════════════════════════════════════════════════════════

export async function extractTextFromFile(
  filePath: string,
  buffer: Buffer
): Promise<ExtractionResult> {
  const extension = filePath.split('.').pop() || '';
  
  if (!isSupportedFileType(extension)) {
    throw new Error(`Unsupported file extension: .${extension}`);
  }
  
  return extractText(buffer, extension);
}