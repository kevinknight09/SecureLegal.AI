import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { legalEngine } from '@/lib/legalEngine';

export async function POST(req: NextRequest) {
  let docA = '';
  let docB = '';

  try {
    const body = await req.json();
    docA = body.docA || '';
    docB = body.docB || '';

    if (!docA || !docB) {
      return NextResponse.json({ error: 'Two contract texts are required for comparison' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const res = legalEngine.compareContracts(docA, docB);
      return NextResponse.json({ comparison: res, source: 'heuristic' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a Senior Corporate Attorney conducting a side-by-side contract comparison between two legal agreements.

Contract Document A:
"""
${docA.slice(0, 15000)}
"""

Contract Document B:
"""
${docB.slice(0, 15000)}
"""

Analyze key differences across liability, termination notice, price escalation, IP rights, and governing law.
Return a structured JSON response formatted as follows:
{
  "comparisons": [
    {
      "feature": "<Feature Name e.g. Overall Risk Score>",
      "valA": "<Description or value in Doc A>",
      "valB": "<Description or value in Doc B>",
      "winner": "<Which document is safer for the client e.g. 'Doc A (Safer)' or 'Doc B' or 'Equal'>"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const compA = legalEngine.analyzeDocument(docA);
    const compB = legalEngine.analyzeDocument(docB);

    return NextResponse.json({
      comparison: {
        analysisA: compA,
        analysisB: compB,
        comparisons: parsed.comparisons || []
      },
      source: 'gemini'
    });
  } catch (err) {
    console.error('Gemini Contract Compare Error:', err);
    if (docA && docB) {
      const fallback = legalEngine.compareContracts(docA, docB);
      return NextResponse.json({ comparison: fallback, source: 'heuristic' });
    }

    return NextResponse.json({ error: 'Failed to compare contracts' }, { status: 500 });
  }
}
