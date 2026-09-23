import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { legalEngine } from '@/lib/legalEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, contractText, userApiKey } = body;

    if (!question || !contractText) {
      return NextResponse.json({ error: 'Question and contract text are required' }, { status: 400 });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const res = legalEngine.answerQuestion(question, contractText);
      return NextResponse.json({ answer: res.answer, citation: res.citation, source: 'heuristic' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert Senior Legal Advisor AI assistant.
Answer the user's question accurately based ON THE PROVIDED CONTRACT TEXT.

Contract Text:
"""
${contractText.slice(0, 30000)}
"""

User Question: "${question}"

Respond with JSON in this format:
{
  "answer": "<Direct, clear legal answer explaining the clause or rights in plain language. Use markdown bold for key numbers, dates, or terms>",
  "citation": "<Relevant Section / Article title or verbatim clause line citation from the document>"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    return NextResponse.json({
      answer: parsed.answer || "Based on the provided document terms, please review the contract text.",
      citation: parsed.citation || "Document Context",
      source: 'gemini'
    });
  } catch (err) {
    console.error('Gemini Legal Q&A Error:', err);
    // Fall back to heuristic answer engine
    try {
      const body = await req.json().catch(() => ({}));
      if (body.question && body.contractText) {
        const fallback = legalEngine.answerQuestion(body.question, body.contractText);
        return NextResponse.json({ answer: fallback.answer, citation: fallback.citation, source: 'heuristic' });
      }
    } catch (_) {}

    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}
