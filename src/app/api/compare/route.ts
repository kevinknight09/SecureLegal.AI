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

    // Ultra-fast comparison prompt (< 2s generation time)
    const prompt = `
Compare two contracts side-by-side across 5 features: Liability & Caps, Termination Notice, Price Escalation, IP Rights & Data Ownership, Governing Law / Jurisdiction.

Doc A:
"""
${docA.slice(0, 3000)}
"""

Doc B:
"""
${docB.slice(0, 3000)}
"""

Return JSON with extremely brief answers (max 10 words per field):
{
  "comparisons": [
    {
      "feature": "<Feature Name>",
      "valA": "<Brief summary Doc A (max 10 words)>",
      "valB": "<Brief summary Doc B (max 10 words)>",
      "winner": "<'Doc A' | 'Doc B' | 'Equal'>"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 500
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
