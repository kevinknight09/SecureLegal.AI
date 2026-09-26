import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { legalEngine, ContractAnalysis } from '@/lib/legalEngine';

export async function POST(req: NextRequest) {
  let text = '';
  try {
    const body = await req.json();
    text = body.text || '';

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Legal document text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Use dynamic NLP heuristic fallback engine on actual document text
      const fallbackReport = legalEngine.analyzeDocument(text);
      return NextResponse.json({ report: fallbackReport, source: 'heuristic' });
    }

    // Call Gemini 2.5 Flash API with JSON mode
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a top-tier Senior Legal Counsel and AI Risk Analyst.
Analyze the following legal document / contract thoroughly and return a comprehensive structured analysis in JSON format.

Contract Text:
"""
${text.slice(0, 30000)}
"""

You MUST respond with valid JSON adhering EXACTLY to this structure:
{
  "metadata": {
    "parties": "Full legal names of all parties involved (or 'Unspecified')",
    "law": "Governing law and legal jurisdiction (e.g., 'State of Delaware')",
    "term": "Agreement duration / term (e.g., '12 Months' or 'Indefinite')"
  },
  "overallRiskScore": <number from 0 to 100 where 0 is safest and 100 is extreme liability>,
  "riskLevel": "<'Low Risk' | 'Moderate Caution' | 'Critical High Risk'>",
  "execSummary": "<A concise 2-3 sentence executive summary explaining the contract purpose and primary risk areas>",
  "risks": {
    "high": [
      {
        "id": "h1",
        "category": "<Category e.g. Liability, Termination, Non-Compete, Data Rights>",
        "title": "<Short high risk headline>",
        "snippet": "<Exact excerpt or quote from the contract text>",
        "explanation": "<Why this clause poses severe legal/commercial risk>",
        "alternative": "<Recommended redline / alternative clause to negotiate>"
      }
    ],
    "medium": [
      {
        "id": "m1",
        "category": "<Category>",
        "title": "<Medium risk headline>",
        "snippet": "<Exact excerpt>",
        "explanation": "<Why this requires caution>",
        "alternative": "<Suggested improvement>"
      }
    ],
    "safe": [
      {
        "id": "s1",
        "category": "<Category>",
        "title": "<Safe/Standard clause headline>",
        "snippet": "<Exact excerpt>",
        "explanation": "<Why this clause is balanced and standard>"
      }
    ]
  },
  "plainEnglish": [
    {
      "number": 1,
      "title": "<Section or Clause Name>",
      "original": "<Original verbatim text (shortened if long)>",
      "simplified": "<Plain English translation starting with '⚡ Plain English: ' explaining what it means in plain everyday words>"
    }
  ],
  "checklist": [
    {
      "task": "<Actionable task or negotiation point>",
      "due": "<Timeline e.g. 'Before Signature', 'Immediate', 'Key Milestone'>",
      "status": "<'Required' | 'Critical' | 'Negotiation' | 'Action Item'>"
    }
  ],
  "attorneyPrep": {
    "title": "<Title for Attorney Consultation Sheet>",
    "date": "<Current date>",
    "law": "<Governing law>",
    "riskScore": <same as overallRiskScore>,
    "riskLevel": "<same as riskLevel>",
    "highRisks": [],
    "questions": [
      "<Targeted strategic question for legal counsel based on identified risks>"
    ]
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || '';
    const parsedData = JSON.parse(jsonText);

    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const report: ContractAnalysis = {
      wordCount,
      readingTime,
      metadata: parsedData.metadata || { parties: "Extracted Parties", law: "Standard Law", term: "Standard Term" },
      overallRiskScore: parsedData.overallRiskScore ?? 50,
      riskLevel: parsedData.riskLevel || "Moderate Caution",
      highRiskCount: parsedData.risks?.high?.length || 0,
      mediumRiskCount: parsedData.risks?.medium?.length || 0,
      safeRiskCount: parsedData.risks?.safe?.length || 0,
      risks: {
        score: parsedData.overallRiskScore ?? 50,
        level: parsedData.riskLevel || "Moderate Caution",
        high: (parsedData.risks?.high || []).map((r: any, idx: number) => ({ ...r, level: 'high', id: r.id || `h_${idx}` })),
        medium: (parsedData.risks?.medium || []).map((r: any, idx: number) => ({ ...r, level: 'medium', id: r.id || `m_${idx}` })),
        safe: (parsedData.risks?.safe || []).map((r: any, idx: number) => ({ ...r, level: 'safe', id: r.id || `s_${idx}` }))
      },
      execSummary: parsedData.execSummary || "Document analysis completed.",
      plainEnglish: parsedData.plainEnglish || [],
      checklist: parsedData.checklist || [],
      attorneyPrep: {
        title: parsedData.attorneyPrep?.title || "Attorney Consultation Prep Sheet",
        date: new Date().toLocaleDateString(),
        law: parsedData.metadata?.law || "Applicable Jurisdiction",
        riskScore: parsedData.overallRiskScore ?? 50,
        riskLevel: parsedData.riskLevel || "Moderate Caution",
        highRisks: (parsedData.risks?.high || []),
        questions: parsedData.attorneyPrep?.questions || []
      }
    };

    return NextResponse.json({ report, source: 'gemini' });
  } catch (err: unknown) {
    console.error('Gemini Legal Analysis Error:', err);
    if (text) {
      const fallbackReport = legalEngine.analyzeDocument(text);
      return NextResponse.json({ 
        report: fallbackReport, 
        source: 'heuristic_fallback', 
        warning: 'Gemini API call failed or key was invalid. Using dynamic legal engine.' 
      });
    }

    return NextResponse.json({ error: 'Failed to analyze document with AI' }, { status: 500 });
  }
}
