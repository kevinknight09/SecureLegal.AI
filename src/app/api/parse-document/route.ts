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

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      extractedText = textResult.text;
      await parser.destroy();
    } else {
      // Plain text, markdown, docx plain text fallback
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace/newlines
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText) {
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
