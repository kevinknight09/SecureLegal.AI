export interface RiskItem {
  id: string;
  category: string;
  title: string;
  snippet: string;
  explanation: string;
  alternative?: string;
  level?: 'high' | 'medium' | 'safe';
}

export interface PlainEnglishItem {
  number: number;
  title: string;
  original: string;
  simplified: string;
}

export interface ChecklistItem {
  task: string;
  due: string;
  status: string;
}

export interface AttorneyPrepPack {
  title: string;
  date: string;
  law: string;
  riskScore: number;
  riskLevel: string;
  highRisks: RiskItem[];
  questions: string[];
}

export interface ContractAnalysis {
  wordCount: number;
  readingTime: number;
  metadata: {
    parties: string;
    law: string;
    term: string;
  };
  overallRiskScore: number;
  riskLevel: string;
  highRiskCount: number;
  mediumRiskCount: number;
  safeRiskCount: number;
  risks: {
    score: number;
    level: string;
    high: RiskItem[];
    medium: RiskItem[];
    safe: RiskItem[];
  };
  execSummary: string;
  plainEnglish: PlainEnglishItem[];
  checklist: ChecklistItem[];
  attorneyPrep: AttorneyPrepPack;
}

export class LegalEngine {
  analyzeDocument(text: string): ContractAnalysis {
    if (!text || text.trim().length === 0) {
      return this._getEmptyReport();
    }

    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    const clauses = this._extractClauses(text);
    const metadata = this._extractMetadata(text);
    const risks = this._assessRisksDynamic(text, clauses);
    const plainEnglish = this._generatePlainEnglishDynamic(clauses);
    const execSummary = this._generateExecutiveSummary(metadata, risks);
    const checklist = this._generateChecklistDynamic(risks);
    const attorneyPrep = this._generateAttorneyPrep(metadata, risks);

    return {
      wordCount,
      readingTime,
      metadata,
      overallRiskScore: risks.score,
      riskLevel: risks.level,
      highRiskCount: risks.high.length,
      mediumRiskCount: risks.medium.length,
      safeRiskCount: risks.safe.length,
      risks,
      execSummary,
      plainEnglish,
      checklist,
      attorneyPrep
    };
  }

  private _getEmptyReport(): ContractAnalysis {
    return {
      wordCount: 0,
      readingTime: 0,
      metadata: { parties: "Unknown", law: "Not Specified", term: "Unspecified" },
      overallRiskScore: 0,
      riskLevel: "Low Risk",
      highRiskCount: 0,
      mediumRiskCount: 0,
      safeRiskCount: 0,
      risks: { score: 0, level: "Safe", high: [], medium: [], safe: [] },
      execSummary: "Please paste a legal document or upload a PDF to run analysis.",
      plainEnglish: [],
      checklist: [],
      attorneyPrep: { title: "Attorney Prep Sheet", date: "", law: "", riskScore: 0, riskLevel: "", highRisks: [], questions: [] }
    };
  }

  private _extractClauses(text: string) {
    const rawSections = text.split(/(?:\n\s*\n|SECTION \d+|ARTICLE \d+|\d+\.\d+)/g);
    const clauses: { id: string; title: string; content: string }[] = [];

    rawSections.forEach((sec, idx) => {
      const clean = sec.trim();
      if (clean.length > 30) {
        const lines = clean.split('\n');
        const firstLine = lines[0].replace(/[:.]/g, '').trim();
        const title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
        clauses.push({
          id: `clause_${idx + 1}`,
          title: title || `Clause ${idx + 1}`,
          content: clean
        });
      }
    });

    if (clauses.length === 0) {
      return [{ id: "clause_1", title: "General Terms", content: text }];
    }

    return clauses.slice(0, 15);
  }

  private _extractMetadata(text: string) {
    let parties = "Extracted Legal Entities";
    let law = "Standard Commercial Jurisdiction";
    let term = "Standard Agreement Term";

    // Extract parties
    const partyMatch = text.match(/(?:between|by and between)\s+([^\n,\.]{3,40})\s+and\s+([^\n,\.]{3,40})/i);
    if (partyMatch) {
      parties = `${partyMatch[1].trim()} & ${partyMatch[2].trim()}`;
    }

    // Extract governing law
    const lawMatch = text.match(/(?:governed by|laws of|jurisdiction of)\s+([A-Za-z\s,]{3,35})(?:\.|\n|$)/i);
    if (lawMatch) {
      law = lawMatch[1].trim();
    } else if (text.match(/State of ([A-Za-z\s]+)/i)) {
      const stateMatch = text.match(/State of ([A-Za-z\s]+)/i);
      if (stateMatch) law = `State of ${stateMatch[1].trim()}`;
    }

    // Extract term/duration
    const termMatch = text.match(/(\d+|\b(?:one|two|three|four|five)\b)\s*(?:months|years|month|year)\s*(?:term|period)?/i);
    if (termMatch) {
      term = termMatch[0].trim();
    }

    return { parties, law, term };
  }

  private _assessRisksDynamic(text: string, clauses: { title: string; content: string }[]) {
    const high: RiskItem[] = [];
    const medium: RiskItem[] = [];
    const safe: RiskItem[] = [];

    const textLower = text.toLowerCase();

    // 1. Liability Cap Risk
    if (textLower.includes("limitation of liability") || textLower.includes("liability cap") || textLower.includes("aggregate liability")) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("liability")) || clauses[0];
      const isExtreme = textLower.includes("1 month") || textLower.includes("total fees paid") || textLower.includes("$0");
      
      const item: RiskItem = {
        id: "r_liability",
        category: "Limitation of Liability",
        title: isExtreme ? "Severe Cap on Liability & One-Sided Protection" : "Aggressive Liability Restriction",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Total aggregate liability is strictly limited.",
        explanation: "The liability clause restricts financial recourse in the event of breach, data loss, or non-performance.",
        alternative: "Negotiate liability cap to at least 12 months of contract fees with carve-outs for confidentiality & gross negligence."
      };
      if (isExtreme) high.push(item);
      else medium.push(item);
    }

    // 2. Auto-Renewal / Termination Notice
    if (textLower.includes("auto") && (textLower.includes("renew") || textLower.includes("renewal"))) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("renew")) || clauses[0];
      high.push({
        id: "r_auto_renew",
        category: "Automatic Renewal",
        title: "Strict Automatic Renewal Notice Requirement",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Agreement automatically renews unless advance notice is provided.",
        explanation: "Automatic renewal lock-in occurs unless cancellation notice is served within a strict advance window.",
        alternative: "Require a 30-day cancellation window and mandatory electronic reminder prior to renewal."
      });
    }

    // 3. Non-Compete / Restrictive Covenants
    if (textLower.includes("non-compete") || textLower.includes("covenant not to compete") || textLower.includes("restrictive covenant")) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("compete")) || clauses[0];
      high.push({
        id: "r_non_compete",
        category: "Restrictive Covenants",
        title: "Broad Post-Termination Non-Compete Restriction",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Restricts engaging in competing business activities post-termination.",
        explanation: "This clause limits your business or employment operations across geographical markets.",
        alternative: "Narrow non-compete scope strictly to direct competitors within immediate zip code for maximum 6 months."
      });
    }

    // 4. Data Rights / AI Model Training
    if (textLower.includes("machine learning") || textLower.includes("ai model") || textLower.includes("training") || textLower.includes("irrevocable license")) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("data") || c.content.toLowerCase().includes("license")) || clauses[0];
      high.push({
        id: "r_ai_data",
        category: "Data Rights & AI Training",
        title: "Broad License & Data Processing Authorization",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Grants permission to use customer data for algorithm training.",
        explanation: "Your data may be utilized to train commercial machine learning models.",
        alternative: "Include explicit Data Processing Addendum forbidding vendor from training AI on customer proprietary data."
      });
    }

    // 5. Price Escalation / Fees
    if (textLower.includes("price increase") || textLower.includes("fee escalation") || textLower.includes("increase annual")) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("fee") || c.content.toLowerCase().includes("increase")) || clauses[0];
      medium.push({
        id: "r_price_escalation",
        category: "Pricing & Fee Escalation",
        title: "Uncapped Fee Escalation Authority",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Reserves right to adjust fees upon renewal.",
        explanation: "Annual subscription or service fees may increase automatically at renewal without prior consent.",
        alternative: "Cap annual price increases to consumer price index (CPI) or maximum 3% per annum."
      });
    }

    // 6. Confidentiality (Safe/Standard)
    if (textLower.includes("confidential") || textLower.includes("non-disclosure")) {
      const foundClause = clauses.find(c => c.content.toLowerCase().includes("confidential")) || clauses[0];
      safe.push({
        id: "r_confidentiality",
        category: "Confidentiality",
        title: "Standard Mutual Confidentiality Safeguards",
        snippet: foundClause ? foundClause.content.substring(0, 180) + "..." : "Both parties agree to hold confidential information in confidence.",
        explanation: "Standard protection ensuring proprietary data and trade secrets remain protected."
      });
    }

    // Dynamic scoring calculation
    let score = (high.length * 25) + (medium.length * 15) + 10;
    if (score > 95) score = 95;
    if (high.length === 0 && medium.length === 0) score = 18;

    let level = "Low Risk";
    if (score > 60) level = "Critical High Risk";
    else if (score > 30) level = "Moderate Caution";

    return { score, level, high, medium, safe };
  }

  private _generateExecutiveSummary(metadata: { parties: string; law: string; term: string }, risks: { score: number; high: RiskItem[]; medium: RiskItem[] }) {
    const riskDesc = risks.score > 60 
      ? "contains critical high-risk terms that strongly favor the drafting party" 
      : risks.score > 30 
        ? "contains moderate risk clauses requiring targeted negotiation" 
        : "appears standard and relatively balanced across commercial terms";

    return `This agreement involving **${metadata.parties}** (${metadata.term}, governed under ${metadata.law}) ${riskDesc}. Analysis identified **${risks.high.length} high-risk red flags** and **${risks.medium.length} medium-risk terms**. Review the simplified clause breakdown and attorney prep notes before executing.`;
  }

  private _generatePlainEnglishDynamic(clauses: { title: string; content: string }[]): PlainEnglishItem[] {
    return clauses.map((c, i) => {
      const lower = c.content.toLowerCase();
      let simplified = "⚡ Plain English: Sets standard rules and expectations for performance and party compliance.";

      if (lower.includes("auto") && lower.includes("renew")) {
        simplified = "⚡ Plain English: This contract will automatically renew every term unless you send written notice before the deadline.";
      } else if (lower.includes("limitation of liability") || lower.includes("liability")) {
        simplified = "⚡ Plain English: Limits the maximum damages you can claim if the other party breaches or fails to perform.";
      } else if (lower.includes("non-compete") || lower.includes("compete")) {
        simplified = "⚡ Plain English: Restricts you from operating or working in competing business sectors after this agreement ends.";
      } else if (lower.includes("confidential")) {
        simplified = "⚡ Plain English: Requires both parties to keep shared business secrets and non-public data confidential.";
      } else if (lower.includes("indemni")) {
        simplified = "⚡ Plain English: Specifies who pays legal fees and damages if a third party sues over this work.";
      } else if (lower.includes("terminate") || lower.includes("cancellation")) {
        simplified = "⚡ Plain English: Explains when and how either party can cancel or end this agreement early.";
      }

      return {
        number: i + 1,
        title: c.title,
        original: c.content.length > 220 ? c.content.substring(0, 220) + '...' : c.content,
        simplified
      };
    });
  }

  private _generateChecklistDynamic(risks: { high: RiskItem[]; medium: RiskItem[] }): ChecklistItem[] {
    const items: ChecklistItem[] = [
      { task: "Verify legal entity names and authorized signatory titles", due: "Immediate", status: "Required" }
    ];

    if (risks.high.some(r => r.category.includes("Renewal"))) {
      items.push({ task: "Set advance calendar reminder for contract cancellation window", due: "Key Milestone", status: "Critical" });
    }
    if (risks.high.some(r => r.category.includes("Liability"))) {
      items.push({ task: "Submit proposed amendment expanding limitation of liability cap", due: "Before Signature", status: "Negotiation" });
    }
    if (risks.high.some(r => r.category.includes("Data"))) {
      items.push({ task: "Attach Data Processing Addendum restricting AI training on user data", due: "Before Signature", status: "Critical" });
    }

    items.push({ task: "Confirm governing jurisdiction matches local counsel recommendations", due: "Review", status: "Action Item" });

    return items;
  }

  private _generateAttorneyPrep(metadata: { parties: string; law: string }, risks: { score: number; level: string; high: RiskItem[] }): AttorneyPrepPack {
    const questions = [
      "Are the limitation of liability caps and indemnification obligations mutual and standard for our industry?",
      "What notice period and formalities are required to terminate this agreement for convenience?",
      "Does this contract contain enforceable restrictive covenants or non-solicitation liabilities?"
    ];

    if (risks.high.some(r => r.category.includes("Data"))) {
      question: questions.unshift("How can we ensure customer proprietary data is explicitly excluded from AI model training?");
    }

    return {
      title: `Attorney Consultation Sheet - ${metadata.parties}`,
      date: new Date().toLocaleDateString(),
      law: metadata.law,
      riskScore: risks.score,
      riskLevel: risks.level,
      highRisks: risks.high,
      questions
    };
  }

  answerQuestion(question: string, contractText: string) {
    const qLower = question.toLowerCase();
    const textLower = contractText.toLowerCase();

    if (qLower.includes("cancel") || qLower.includes("terminate") || qLower.includes("end")) {
      if (textLower.includes("auto") && textLower.includes("renew")) {
        return {
          answer: "The document contains an **automatic renewal clause**. Written notice must be provided prior to the renewal notice deadline to prevent commitment rollover.",
          citation: "Termination & Renewal Provision"
        };
      }
      return {
        answer: "Termination rules are outlined in the agreement. Usually written notice is required prior to cancellation.",
        citation: "General Termination Clause"
      };
    }

    if (qLower.includes("liability") || qLower.includes("sue") || qLower.includes("damage")) {
      return {
        answer: "Liability is subject to explicit caps defined in the contract. Review the Limitation of Liability section for specific maximum monetary caps.",
        citation: "Limitation of Liability Provision"
      };
    }

    if (qLower.includes("data") || qLower.includes("ai") || qLower.includes("privacy")) {
      return {
        answer: "Data ownership and usage rights govern how information submitted under this agreement may be processed.",
        citation: "Data & Intellectual Property Clause"
      };
    }

    return {
      answer: "Based on the provided document: The contract establishes binding legal obligations regarding terms, performance, and dispute resolution.",
      citation: "Full Document Context"
    };
  }

  compareContracts(docA: string, docB: string) {
    const analysisA = this.analyzeDocument(docA);
    const analysisB = this.analyzeDocument(docB);

    return {
      analysisA,
      analysisB,
      comparisons: [
        {
          feature: "Overall Risk Score",
          valA: `${analysisA.overallRiskScore} / 100 (${analysisA.riskLevel})`,
          valB: `${analysisB.overallRiskScore} / 100 (${analysisB.riskLevel})`,
          winner: analysisA.overallRiskScore <= analysisB.overallRiskScore ? "Doc A (Safer)" : "Doc B (Safer)"
        },
        {
          feature: "Identified High Risk Red Flags",
          valA: `${analysisA.highRiskCount} Red Flags`,
          valB: `${analysisB.highRiskCount} Red Flags`,
          winner: analysisA.highRiskCount <= analysisB.highRiskCount ? "Doc A (Safer)" : "Doc B (Safer)"
        },
        {
          feature: "Governing Law Jurisdiction",
          valA: analysisA.metadata.law,
          valB: analysisB.metadata.law,
          winner: "Review Jurisdictions"
        }
      ]
    };
  }
}

export const legalEngine = new LegalEngine();
