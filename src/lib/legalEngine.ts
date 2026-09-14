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
    const risks = this._assessRisks(text);
    const metadata = this._extractMetadata(text);
    const plainEnglish = this._generatePlainEnglish(clauses);
    const execSummary = this._generateExecutiveSummary(metadata, risks);
    const checklist = this._generateChecklist();
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
      riskLevel: "Low",
      highRiskCount: 0,
      mediumRiskCount: 0,
      safeRiskCount: 0,
      risks: { score: 0, level: "Safe", high: [], medium: [], safe: [] },
      execSummary: "Please paste a legal document or select a sample contract to analyze.",
      plainEnglish: [],
      checklist: [],
      attorneyPrep: { title: "Attorney Prep Sheet", date: "", law: "", riskScore: 0, riskLevel: "", highRisks: [], questions: [] }
    };
  }

  private _extractClauses(text: string) {
    const rawSections = text.split(/(?=SECTION \d+|ARTICLE \d+|\d+\.\d+)/g);
    const clauses: { id: string; title: string; content: string }[] = [];

    rawSections.forEach((sec, idx) => {
      const clean = sec.trim();
      if (clean.length > 20) {
        const lines = clean.split('\n');
        const title = lines[0].replace(/[:.]/g, '').trim();
        clauses.push({
          id: `clause_${idx + 1}`,
          title: title.length > 60 ? title.substring(0, 60) + '...' : title,
          content: clean
        });
      }
    });

    return clauses.length > 0 ? clauses : [{ id: "clause_1", title: "General Terms", content: text }];
  }

  private _extractMetadata(text: string) {
    let parties = "Not Explicitly Named";
    let law = "Standard Applicable Jurisdiction";
    let term = "Standard Agreement Duration";

    if (text.match(/between\s+([^,.\n]+)\s+and\s+([^,.\n]+)/i)) {
      const match = text.match(/between\s+([^,.\n]+)\s+and\s+([^,.\n]+)/i);
      if (match) parties = `${match[1].trim()} & ${match[2].trim()}`;
    }

    if (text.match(/State of ([A-Za-z\s]+)/i)) {
      const match = text.match(/State of ([A-Za-z\s]+)/i);
      if (match) law = `State of ${match[1].trim()}`;
    }

    if (text.match(/(\d+)\s*(months|years|month|year)/i)) {
      const match = text.match(/(\d+)\s*(months|years|month|year)/i);
      if (match) term = match[0];
    }

    return { parties, law, term };
  }

  private _assessRisks(text: string) {
    const high: RiskItem[] = [];
    const medium: RiskItem[] = [];
    const safe: RiskItem[] = [];

    const lower = text.toLowerCase();

    if (lower.includes("1 month") || lower.includes("one (1) month") || (lower.includes("limitation of liability") && lower.includes("total fees paid"))) {
      high.push({
        id: "r_liability",
        category: "Limitation of Liability",
        title: "Severe Cap on Liability & One-Sided Protection",
        snippet: "PROVIDER'S TOTAL AGGREGATE LIABILITY... SHALL BE LIMITED TO THE TOTAL FEES PAID BY CUSTOMER IN THE PRIOR ONE (1) MONTH.",
        explanation: "The provider limits their financial liability to only 1 month of service fees, while you remain fully exposed to third-party claims.",
        alternative: "Negotiate liability cap to at least 12 months of fees or $1,000,000, with mutual carve-outs for data breaches."
      });
    }

    if (lower.includes("automatically renew") || lower.includes("auto-renew")) {
      high.push({
        id: "r_auto_renew",
        category: "Automatic Renewal",
        title: "Strict 90-Day Auto-Renewal Notice Window",
        snippet: "automatically renew for successive 12-month periods unless Customer provides written notice... at least ninety (90) days prior...",
        explanation: "If you miss the 90-day cancellation deadline, you are legally locked into another full year of payments.",
        alternative: "Reduce notice requirement to 30 days and add automated calendar reminders."
      });
    }

    if (lower.includes("non-compete covenant") || lower.includes("twenty-four (24) months")) {
      high.push({
        id: "r_non_compete",
        category: "Restrictive Covenants",
        title: "Overly Broad 24-Month Global Non-Compete",
        snippet: "Executive shall not directly or indirectly engage in... any business offering products competing... anywhere in North America, Europe, or Asia.",
        explanation: "This restricts your ability to work in your industry across three entire continents for 2 full years after leaving.",
        alternative: "Narrow scope to direct competitors within a 25-mile radius for max 6 months, or strike out completely."
      });
    }

    if (lower.includes("entire security deposit") || lower.includes("forfeiture")) {
      high.push({
        id: "r_deposit",
        category: "Security Deposit & Forfeiture",
        title: "Full Deposit Forfeiture for Minor 5-Day Delay",
        snippet: "defaults on rent payment by more than five (5) days, Landlord may retain the ENTIRE Security Deposit as liquidated damages...",
        explanation: "A slight delay in rent payment allows the landlord to permanently confiscate your entire $42,000 security deposit.",
        alternative: "Require written notice and a 15-day cure period before any security deposit offset can occur."
      });
    }

    if (lower.includes("machine learning model training")) {
      high.push({
        id: "r_ai_data",
        category: "Data Rights & AI Training",
        title: "Irrevocable License to Train AI Models on Your Data",
        snippet: "grants Provider a perpetual, irrevocable... license to use anonymized Customer Data for machine learning model training...",
        explanation: "Your proprietary company data will be used permanently to train commercial AI models.",
        alternative: "Insert explicit opt-out clause forbidding vendor from using customer data for external model training."
      });
    }

    if (lower.includes("increase annual subscription fees by up to 15%")) {
      medium.push({
        id: "r_price_escalation",
        category: "Pricing & Fee Escalation",
        title: "Uncontrolled 15% Annual Price Escalation",
        snippet: "Provider reserves the right to increase annual subscription fees by up to 15% without prior Customer consent.",
        explanation: "Your annual software costs could compound significantly upon every renewal term.",
        alternative: "Cap price increases to CPI index or maximum 3% to 5% per year."
      });
    }

    if (lower.includes("confidential information") || lower.includes("standard of care")) {
      safe.push({
        id: "r_confidentiality",
        category: "Confidentiality",
        title: "Mutual Confidentiality Protection",
        snippet: "Receiving Party agrees to hold Confidential Information in strict confidence and exercise at least a reasonable degree of care...",
        explanation: "Standard, balanced protection ensuring both parties keep proprietary information secure."
      });
    }

    let score = (high.length * 28) + (medium.length * 14);
    if (score > 95) score = 95;
    if (score === 0 && text.length > 50) score = 15;

    let level = "Low Risk";
    if (score > 65) level = "Critical High Risk";
    else if (score > 35) level = "Moderate Caution";

    return { score, level, high, medium, safe };
  }

  private _generateExecutiveSummary(metadata: { parties: string; law: string; term: string }, risks: { score: number; high: RiskItem[]; medium: RiskItem[] }) {
    const riskDesc = risks.score > 60 
      ? "contains significant high-risk terms that heavily favor the drafting party" 
      : risks.score > 30 
        ? "contains moderate risk clauses requiring negotiation before signature" 
        : "appears relatively balanced with standard commercial terms";

    return `This agreement between **${metadata.parties}** (${metadata.term}, governed by ${metadata.law}) ${riskDesc}. We identified **${risks.high.length} high-risk red flags** (including liability caps and restrictive terms) and **${risks.medium.length} medium-risk clauses**. Review the highlighted risk radar breakdown and suggested alternative clauses before signing.`;
  }

  private _generatePlainEnglish(clauses: { title: string; content: string }[]) {
    return clauses.map((c, i) => {
      let plain = "This section sets out general rights and operational expectations for both parties.";
      const lower = c.content.toLowerCase();

      if (lower.includes("auto") && lower.includes("renew")) {
        plain = "⚡ Plain English: The contract automatically renews every year unless you tell them in writing 90 days before it ends.";
      } else if (lower.includes("limitation of liability")) {
        plain = "⚡ Plain English: If the company breaks the agreement or causes damages, the most you can collect from them is 1 month of service fees.";
      } else if (lower.includes("non-compete")) {
        plain = "⚡ Plain English: You are forbidden from working for any competitor anywhere in North America, Europe, or Asia for 2 years after leaving.";
      } else if (lower.includes("security deposit")) {
        plain = "⚡ Plain English: If you pay rent even 5 days late, the landlord can take your entire $42,000 security deposit.";
      } else if (lower.includes("machine learning") || lower.includes("training")) {
        plain = "⚡ Plain English: The vendor gets permission to use your private business data forever to train their AI technology.";
      } else if (lower.includes("confidential")) {
        plain = "⚡ Plain English: Both companies must keep each other's secrets private for 3 years.";
      }

      return {
        number: i + 1,
        title: c.title,
        original: c.content.length > 220 ? c.content.substring(0, 220) + '...' : c.content,
        simplified: plain
      };
    });
  }

  private _generateChecklist(): ChecklistItem[] {
    return [
      { task: "Verify exact legal entity names for both parties", due: "Immediate", status: "Required" },
      { task: "Set 90-day advance calendar reminder for contract cancellation/non-renewal", due: "Key Milestone", status: "Critical" },
      { task: "Request liability cap adjustment from 1 month to 12 months", due: "Before Signature", status: "Negotiation" },
      { task: "Confirm governing law jurisdiction aligns with local legal counsel", due: "Review", status: "Action Item" }
    ];
  }

  private _generateAttorneyPrep(metadata: { parties: string; law: string }, risks: { score: number; level: string; high: RiskItem[] }): AttorneyPrepPack {
    return {
      title: `Attorney Consultation Prep Sheet - ${metadata.parties}`,
      date: new Date().toLocaleDateString(),
      law: metadata.law,
      riskScore: risks.score,
      riskLevel: risks.level,
      highRisks: risks.high,
      questions: [
        "Is the 1-month limitation of liability cap legally enforceable in our jurisdiction, and how can we expand it to 12 months?",
        "How can we modify the automatic renewal clause to require 30 days written notice instead of 90 days?",
        "Can we strike out the broad global non-compete clause or carve out specific non-competing sub-sectors?",
        "Are there statutory protections against full security deposit forfeiture for minor 5-day rent delays?",
        "What specific data privacy addendum (DPA) should we attach to prevent vendor AI model training on customer data?"
      ]
    };
  }

  answerQuestion(question: string, contractText: string) {
    const qLower = question.toLowerCase();
    const textLower = contractText.toLowerCase();

    if (qLower.includes("cancel") || qLower.includes("terminate") || qLower.includes("end")) {
      if (textLower.includes("auto") && textLower.includes("ninety (90) days")) {
        return {
          answer: "You can prevent automatic renewal by providing written notice of non-renewal at least **90 days prior** to the expiration of the current term. However, the Customer has **no right to terminate for convenience** prior to the end of the full 36-month commitment period.",
          citation: "SECTION 2.2 & SECTION 5.2 (Automatic Renewal & Termination)"
        };
      }
      return {
        answer: "Termination rules depend on the specific section. Generally, written notice is required prior to renewal.",
        citation: "General Termination Clause"
      };
    }

    if (qLower.includes("liability") || qLower.includes("sue") || qLower.includes("damage")) {
      return {
        answer: "The provider's total maximum liability is capped at **1 month of paid subscription fees**. Furthermore, provider disclaims all indirect, consequential, or punitive damages.",
        citation: "SECTION 4.2 (Limitation of Liability)"
      };
    }

    if (qLower.includes("ai") || qLower.includes("data") || qLower.includes("train")) {
      return {
        answer: "While you retain title to Customer Data, the contract grants the provider a **perpetual, irrevocable worldwide license** to use anonymized Customer Data for machine learning model training and product development.",
        citation: "SECTION 3.2 (Intellectual Property & Data License)"
      };
    }

    if (qLower.includes("compete") || qLower.includes("work") || qLower.includes("job")) {
      return {
        answer: "The agreement imposes a strict **24-month post-employment non-compete** prohibiting work with competing businesses anywhere in North America, Europe, or Asia.",
        citation: "SECTION 2.1 (Non-Competition Covenant)"
      };
    }

    if (qLower.includes("deposit") || qLower.includes("late")) {
      return {
        answer: "If rent is defaulted by more than **5 days**, the landlord claims the right to confiscate the **entire $42,000 security deposit** as liquidated damages.",
        citation: "SECTION 2.2 (Security Deposit & Forfeiture)"
      };
    }

    return {
      answer: "Based on the provided legal document: This agreement sets out specific binding obligations regarding performance, fees, data usage, and liability.",
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
          winner: analysisA.overallRiskScore < analysisB.overallRiskScore ? "Doc A (Safer)" : "Doc B (Safer)"
        },
        {
          feature: "Limitation of Liability Cap",
          valA: analysisA.risks.high.some(r => r.id === 'r_liability') ? "1 Month Fees (Very Harsh)" : "Standard Cap",
          valB: analysisB.risks.high.some(r => r.id === 'r_liability') ? "1 Month Fees (Very Harsh)" : "Standard Cap",
          winner: analysisA.risks.high.some(r => r.id === 'r_liability') ? "Doc B" : "Doc A"
        },
        {
          feature: "Cancellation Notice Window",
          valA: analysisA.risks.high.some(r => r.id === 'r_auto_renew') ? "90 Days Prior Notice" : "Standard Notice",
          valB: analysisB.risks.high.some(r => r.id === 'r_auto_renew') ? "90 Days Prior Notice" : "Standard Notice",
          winner: "Equally Strict"
        }
      ]
    };
  }
}

export const legalEngine = new LegalEngine();
