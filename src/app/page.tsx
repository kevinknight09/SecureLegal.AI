'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, FileText, GitCompare, MessageSquare, Briefcase, Download, Sparkles, 
  ShieldAlert, Trash2, Users, Gavel, Clock, UploadCloud, FileCheck, 
  CheckCircle2, AlertTriangle, AlertCircle, BookOpen, CheckSquare, Send, 
  RefreshCw, Layers, Cpu
} from 'lucide-react';
import { SAMPLE_CONTRACTS } from '@/lib/samples';
import { ContractAnalysis } from '@/lib/legalEngine';

export default function Home() {
  const [activeView, setActiveView] = useState<'analyzer' | 'compare' | 'assistant' | 'prep'>('analyzer');
  const [selectedSample, setSelectedSample] = useState<string>('saas');
  const [contractText, setContractText] = useState<string>(SAMPLE_CONTRACTS.saas.content);
  const [activeTab, setActiveTab] = useState<'risks' | 'plain' | 'checklist'>('risks');

  // File Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis state
  const [report, setReport] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'heuristic' | null>(null);

  // Comparison state
  const [compareA, setCompareA] = useState<string>(SAMPLE_CONTRACTS.saas.content);
  const [compareB, setCompareB] = useState<string>(SAMPLE_CONTRACTS.lease.content);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; citation?: string; source?: string }[]>([
    {
      role: 'assistant',
      text: "Hello! I'm your Legal Copilot Assistant. Upload any contract or select a sample, and ask me anything about liability, termination rules, non-compete clauses, or data rights!"
    }
  ]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  useEffect(() => {
    runAnalysis(contractText);
  }, []);

  // Run AI Legal Analysis
  const runAnalysis = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) {
      setReport(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
        setAnalysisSource(data.source === 'gemini' ? 'gemini' : 'heuristic');
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle File Upload (PDF, TXT, DOCX)
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setContractText(data.text);
        setSelectedSample('');
        runAnalysis(data.text);
      } else {
        alert('Could not parse file text. Please try another file.');
      }
    } catch (err) {
      console.error('File parse error:', err);
      alert('Error uploading document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSampleClick = (key: string) => {
    setSelectedSample(key);
    setUploadedFileName(null);
    if (SAMPLE_CONTRACTS[key]) {
      setContractText(SAMPLE_CONTRACTS[key].content);
      runAnalysis(SAMPLE_CONTRACTS[key].content);
    }
  };

  // Handle Chat Assistant Send
  const handleChatSend = async (queryText?: string) => {
    const q = queryText || chatInputText;
    if (!q.trim() || isChatLoading) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: q }];
    setChatMessages(newMsgs);
    if (!queryText) setChatInputText('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          contractText: contractText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages([
          ...newMsgs,
          { role: 'assistant', text: data.answer, citation: data.citation, source: data.source }
        ]);
      }
    } catch (err) {
      setChatMessages([
        ...newMsgs,
        { role: 'assistant', text: 'Sorry, I ran into an issue processing your question.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle Contract Comparison
  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: compareA,
          docB: compareB
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompareResult(data.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    const content = `
SECURELEGAL.AI CONTRACT AUDIT REPORT
=====================================
Document: ${uploadedFileName || selectedSample || 'Custom Document'}
Parties: ${report.metadata.parties}
Governing Law: ${report.metadata.law}
Term/Duration: ${report.metadata.term}
Overall Risk Score: ${report.overallRiskScore} / 100 (${report.riskLevel})

EXECUTIVE SUMMARY
-----------------
${report.execSummary}

HIGH RISK RED FLAGS (${report.highRiskCount})
-------------------
${report.risks.high.map((r, i) => `${i + 1}. [${r.category}] ${r.title}\n   Explanation: ${r.explanation}\n   Suggested Redline: ${r.alternative}\n`).join('\n')}

PLAIN ENGLISH CLAUSE BREAKDOWN
------------------------------
${report.plainEnglish.map(p => `${p.number}. ${p.title}\n   ${p.simplified}\n`).join('\n')}

ACTIONABLE COMPLIANCE CHECKLIST
-------------------------------
${report.checklist.map(c => `- [ ] ${c.task} (Due: ${c.due}, Priority: ${c.status})`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Legal_Audit_Report_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0D121E]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SecureLegal.AI
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase px-2.5 py-0.5 bg-indigo-500/20 text-cyan-400 border border-indigo-500/40 rounded-full">
            <Cpu className="w-3 h-3" /> Legal AI Copilot
          </span>
        </div>

        {/* View Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveView('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'analyzer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Analyzer
          </button>
          <button 
            onClick={() => { setActiveView('compare'); if (!compareResult) handleRunComparison(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'compare' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <GitCompare className="w-4 h-4" /> Comparison
          </button>
          <button 
            onClick={() => setActiveView('assistant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'assistant' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" /> Legal Copilot
          </button>
          <button 
            onClick={() => setActiveView('prep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'prep' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase className="w-4 h-4" /> Counsel Prep
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={exportReport}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-medium hover:bg-white/15 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button 
            onClick={() => runAnalysis(contractText)}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        
        {/* Legal Disclaimer */}
        <div className="flex items-center justify-between p-3.5 mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span><strong>Legal AI:</strong> SecureLegal.AI simplifies contract comprehension using AI and dynamic document parsing. Not formal legal counsel.</span>
          </div>
          {analysisSource && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 border border-white/10 text-cyan-300">
              <Layers className="w-3 h-3" /> Engine: {analysisSource === 'gemini' ? 'Gemini 2.5 Flash API' : 'Dynamic Legal NLP'}
            </span>
          )}
        </div>

        {/* VIEW 1: DOCUMENT ANALYZER */}
        {activeView === 'analyzer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Legal Document Simplifier & Risk Radar</h1>
                <p className="text-slate-400 text-sm">Upload any legal document (PDF, TXT) or choose a sample contract below.</p>
              </div>

              {/* Sample Contracts Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Samples:</span>
                <div className="flex gap-2">
                  {Object.keys(SAMPLE_CONTRACTS).map(key => (
                    <button
                      key={key}
                      onClick={() => handleSampleClick(key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedSample === key ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-sm' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                      {SAMPLE_CONTRACTS[key].type.split('&')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: File Upload & Input Editor */}
              <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 font-semibold text-white text-sm">
                      <FileText className="w-4 h-4 text-indigo-400" /> Document Input
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        accept=".pdf,.txt,.docx,.md"
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-lg text-indigo-300 font-medium transition-all"
                      >
                        {isUploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                        {isUploading ? 'Parsing...' : 'Upload PDF/TXT'}
                      </button>

                      <button 
                        onClick={() => { setContractText(''); setReport(null); setUploadedFileName(null); }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white"
                        title="Clear Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Notification Badge */}
                  {uploadedFileName && (
                    <div className="flex items-center justify-between p-2.5 mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate font-medium">{uploadedFileName}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-500/20 rounded">Parsed</span>
                    </div>
                  )}

                  <textarea
                    value={contractText}
                    onChange={(e) => { 
                      setContractText(e.target.value); 
                      setSelectedSample('');
                      runAnalysis(e.target.value); 
                    }}
                    placeholder="Paste legal document text here or drag & drop a PDF above..."
                    className="w-full h-[420px] p-4 bg-[#0D121E]/80 border border-white/10 rounded-xl text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>

                {report && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Parties: <span className="font-semibold text-white">{report.metadata.parties}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Gavel className="w-3.5 h-3.5 text-cyan-400" /> Law: <span className="font-semibold text-white">{report.metadata.law}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Term: <span className="font-semibold text-white">{report.metadata.term}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Analysis Output */}
              <div className="lg:col-span-7 glass-card p-6 space-y-6">
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-[520px] space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                      <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-indigo-500/20 animate-spin flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-base font-semibold text-white">Analyzing Legal Document...</p>
                      <p className="text-xs text-slate-400">Evaluating risk factors, extracting key clauses, generating plain English</p>
                    </div>
                  </div>
                ) : report ? (
                  <>
                    {/* Top Risk Score Header Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Overall Score */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
                          report.overallRiskScore > 60 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          report.overallRiskScore > 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {report.overallRiskScore}
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Risk Assessment</div>
                          <div className="text-sm font-bold text-white">{report.riskLevel}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{report.wordCount} words • ~{report.readingTime}m read</div>
                        </div>
                      </div>

                      {/* Red Flags Summary */}
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">Red Flag Breakdown</div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-rose-400 font-bold">{report.highRiskCount} High</span>
                            <span className="text-amber-400 font-bold">{report.mediumRiskCount} Med</span>
                            <span className="text-emerald-400 font-bold">{report.safeRiskCount} Safe</span>
                          </div>
                        </div>
                        <AlertTriangle className={`w-8 h-8 ${report.highRiskCount > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
                      </div>

                      {/* AI Copilot Quick Launcher */}
                      <div 
                        onClick={() => setActiveView('assistant')}
                        className="p-4 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 cursor-pointer rounded-2xl transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-indigo-300">Ask Copilot</div>
                          <div className="text-xs text-slate-300 mt-1">Chat about liability & terms</div>
                        </div>
                        <MessageSquare className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 bg-slate-900/60 border border-white/10 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                        <BookOpen className="w-4 h-4" /> Executive Summary
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{report.execSummary}</p>
                    </div>

                    {/* Tab Switching: Risk Radar vs Plain English vs Checklist */}
                    <div>
                      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                        <button 
                          onClick={() => setActiveTab('risks')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'risks' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Risk Radar ({report.highRiskCount + report.mediumRiskCount})
                        </button>
                        <button 
                          onClick={() => setActiveTab('plain')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'plain' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <FileText className="w-3.5 h-3.5" /> Plain English ({report.plainEnglish.length})
                        </button>
                        <button 
                          onClick={() => setActiveTab('checklist')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'checklist' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Checklist ({report.checklist.length})
                        </button>
                      </div>

                      <div className="mt-4 max-h-[360px] overflow-y-auto space-y-3 pr-2">
                        {/* TAB 1: RISKS */}
                        {activeTab === 'risks' && (
                          <>
                            {report.risks.high.map((risk) => (
                              <div key={risk.id} className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/40">
                                    HIGH RISK • {risk.category}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white">{risk.title}</h4>
                                <blockquote className="p-2.5 bg-black/40 border-l-2 border-rose-500 text-xs font-mono text-slate-300 rounded-r-lg">
                                  "{risk.snippet}"
                                </blockquote>
                                <p className="text-xs text-slate-300">{risk.explanation}</p>
                                {risk.alternative && (
                                  <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
                                    <strong>Negotiation Redline Option:</strong> {risk.alternative}
                                  </div>
                                )}
                              </div>
                            ))}

                            {report.risks.medium.map((risk) => (
                              <div key={risk.id} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                                    MEDIUM RISK • {risk.category}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white">{risk.title}</h4>
                                <blockquote className="p-2.5 bg-black/40 border-l-2 border-amber-500 text-xs font-mono text-slate-300 rounded-r-lg">
                                  "{risk.snippet}"
                                </blockquote>
                                <p className="text-xs text-slate-300">{risk.explanation}</p>
                              </div>
                            ))}

                            {report.risks.safe.map((risk) => (
                              <div key={risk.id} className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-1">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">
                                  SAFE • {risk.category}
                                </span>
                                <h4 className="text-xs font-semibold text-white">{risk.title}</h4>
                                <p className="text-xs text-slate-400">{risk.explanation}</p>
                              </div>
                            ))}
                          </>
                        )}

                        {/* TAB 2: PLAIN ENGLISH */}
                        {activeTab === 'plain' && (
                          <div className="space-y-3">
                            {report.plainEnglish.map((item) => (
                              <div key={item.number} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
                                  <span>Clause #{item.number}: {item.title}</span>
                                </div>
                                <p className="text-xs font-mono text-slate-400 line-clamp-2">{item.original}</p>
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-cyan-300 font-medium">
                                  {item.simplified}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* TAB 3: ACTION CHECKLIST */}
                        {activeTab === 'checklist' && (
                          <div className="space-y-2">
                            {report.checklist.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200">
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                  <span>{item.task}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-white/10 rounded text-[11px] text-slate-400">{item.due}</span>
                                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded text-[11px] font-semibold">{item.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                    <FileText className="w-12 h-12 mb-3 text-slate-600" />
                    <p className="text-sm font-medium">No document loaded yet.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CONTRACT COMPARISON */}
        {activeView === 'compare' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Side-by-Side Contract Comparison</h1>
              <p className="text-slate-400 text-sm">Compare terms, liability caps, and renewal notice windows between two agreements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doc A */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between font-semibold text-sm text-indigo-300 border-b border-white/10 pb-2">
                  <span>Document A</span>
                  <span className="text-xs text-slate-400">SaaS Agreement</span>
                </div>
                <textarea
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="w-full h-48 p-3 bg-[#0D121E] border border-white/10 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                />
              </div>

              {/* Doc B */}
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between font-semibold text-sm text-cyan-300 border-b border-white/10 pb-2">
                  <span>Document B</span>
                  <span className="text-xs text-slate-400">Commercial Lease</span>
                </div>
                <textarea
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="w-full h-48 p-3 bg-[#0D121E] border border-white/10 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleRunComparison}
                disabled={isComparing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all"
              >
                {isComparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                {isComparing ? 'Comparing Agreements...' : 'Run Side-by-Side AI Comparison'}
              </button>
            </div>

            {compareResult && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Comparison Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 text-slate-400 font-semibold border-b border-white/10">
                      <tr>
                        <th className="p-3">Clause / Feature</th>
                        <th className="p-3">Document A</th>
                        <th className="p-3">Document B</th>
                        <th className="p-3">Safer Option</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {compareResult.comparisons.map((c: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-3 font-semibold text-white">{c.feature}</td>
                          <td className="p-3 text-indigo-300">{c.valA}</td>
                          <td className="p-3 text-cyan-300">{c.valB}</td>
                          <td className="p-3 font-bold text-emerald-400">{c.winner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LEGAL Q&A ASSISTANT */}
        {activeView === 'assistant' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Legal Copilot Assistant</h1>
              <p className="text-slate-400 text-sm">Ask questions about your uploaded document. Powered by RAG clause citations.</p>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                "What is the limitation of liability cap?",
                "How do I prevent automatic renewal?",
                "Does the vendor have rights to train AI on my data?",
                "What are the post-termination restrictions?"
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatSend(query)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 hover:text-white transition-all"
                >
                  💬 {query}
                </button>
              ))}
            </div>

            {/* Chat Container */}
            <div className="glass-card flex flex-col h-[520px]">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl space-y-2 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.citation && (
                        <div className="p-2 bg-black/40 border-l-2 border-cyan-400 text-[11px] font-mono text-cyan-300 rounded-r-lg">
                          📌 Citation: {msg.citation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Legal AI is analyzing contract text...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask any question about your document..."
                  className="flex-1 px-4 py-3 bg-[#0D121E] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleChatSend()}
                  disabled={isChatLoading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: COUNSEL PREP SHEET */}
        {activeView === 'prep' && report && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Attorney Consultation Prep Sheet</h1>
                <p className="text-slate-400 text-sm">Strategic question pack to bring to your legal counsel before signing.</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>

            <div className="glass-card p-8 space-y-6 bg-slate-900/90 border-indigo-500/30">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white">{report.attorneyPrep.title}</h2>
                  <p className="text-xs text-slate-400">Date Generated: {report.attorneyPrep.date} • Law: {report.attorneyPrep.law}</p>
                </div>
                <div className="px-4 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full font-bold text-xs">
                  Risk Level: {report.attorneyPrep.riskLevel} ({report.attorneyPrep.riskScore}/100)
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">High Risk Red Flags to Raise</h3>
                <div className="space-y-3">
                  {report.attorneyPrep.highRisks.map((r, i) => (
                    <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1 text-xs">
                      <div className="font-semibold text-white">{i + 1}. {r.title} ({r.category})</div>
                      <p className="text-slate-300">{r.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">Strategic Questions for Legal Counsel</h3>
                <div className="space-y-2">
                  {report.attorneyPrep.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
                      <span className="font-bold text-cyan-400">Q{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
