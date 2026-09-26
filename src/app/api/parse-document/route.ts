import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // Tier 1: Try standard pdf-parse library
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const textResult = await parser.getText();
        extractedText = textResult.text || '';
        await parser.destroy().catch(() => {});
      } catch (pdfErr) {
        console.warn('pdf-parse primary parser warning:', pdfErr);
      }

      // Tier 2: If primary pdf-parse extracted less than 20 chars, extract PDF text streams directly
      if (!extractedText || extractedText.trim().length < 20) {
        const rawString = buffer.toString('utf-8');
        // Match parenthesized text contents in PDF streams e.g. (text) Tj
        const matches = rawString.match(/\(([^()]{3,})\)\s*T[jJ]/g) || rawString.match(/\(([^()]{3,})\)/g);
        if (matches) {
          extractedText = matches
            .map(m => m.replace(/^[\(\s]+|[\)\s]+$/g, '').trim())
            .filter(t => t.length > 2 && !t.includes('PDF-') && !t.includes('Obj'))
            .join(' ');
        }
      }

      // Tier 3: Fallback printable string scan for any remaining text bytes
      if (!extractedText || extractedText.trim().length < 20) {
        const rawString = buffer.toString('utf-8');
        const printableMatches = rawString.match(/[a-zA-Z0-9\s,.:;\-'"()]{10,}/g);
        if (printableMatches) {
          extractedText = printableMatches.join('\n');
        }
      }
    } else {
      // Plain text, markdown, docx plain text fallback
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace/newlines
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText || extractedText.length < 5) {
      return NextResponse.json({ error: 'Could not extract text from document.' }, { status: 422 });
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      wordCount: extractedText.split(/\s+/).length
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to parse document';
    console.error('Error parsing document:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
