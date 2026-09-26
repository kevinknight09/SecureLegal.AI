import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { legalEngine } from '@/lib/legalEngine';

export async function POST(req: NextRequest) {
  let question = '';
  let contractText = '';

  try {
    const body = await req.json();
    question = body.question || '';
    contractText = body.contractText || '';

    if (!question || !contractText) {
      return NextResponse.json({ error: 'Question and contract text are required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const res = legalEngine.answerQuestion(question, contractText);
      return NextResponse.json({ answer: res.answer, citation: res.citation, source: 'heuristic' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a fast, concise Senior Legal Advisor AI assistant.
Answer the user's question directly in 2-3 sentences based on the contract text.

Contract Text:
"""
${contractText.slice(0, 6000)}
"""

User Question: "${question}"

Respond with JSON adhering to:
{
  "answer": "<Concise 2-3 sentence legal answer using bold for key dates, caps, or entities>",
  "citation": "<Relevant Section / Article title or verbatim clause title>"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 300
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
    if (question && contractText) {
      const fallback = legalEngine.answerQuestion(question, contractText);
      return NextResponse.json({ answer: fallback.answer, citation: fallback.citation, source: 'heuristic' });
    }

    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}
