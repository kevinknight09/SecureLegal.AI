'use client';

import React, { useState, useEffect } from 'react';
import { 
  Scale, FileText, GitCompare, MessageSquare, Briefcase, Download, Sparkles, 
  ShieldAlert, Trash2, Users, Gavel, Clock, AlertTriangle, AlertCircle, 
  CheckCircle2, BookOpen, CheckSquare, Send, Bookmark, Printer 
} from 'lucide-react';
import { SAMPLE_CONTRACTS } from '@/lib/samples';
import { legalEngine, ContractAnalysis } from '@/lib/legalEngine';

export default function Home() {
  const [activeView, setActiveView] = useState<'analyzer' | 'compare' | 'assistant' | 'prep'>('analyzer');
  const [selectedSample, setSelectedSample] = useState<string>('saas');
  const [contractText, setContractText] = useState<string>(SAMPLE_CONTRACTS.saas.content);
  const [activeTab, setActiveTab] = useState<'risks' | 'plain' | 'checklist'>('risks');

  // Analysis state
  const [report, setReport] = useState<ContractAnalysis | null>(null);

  // Comparison state
  const [compareA, setCompareA] = useState<string>(SAMPLE_CONTRACTS.saas.content);
  const [compareB, setCompareB] = useState<string>(SAMPLE_CONTRACTS.lease.content);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; citation?: string }[]>([
    {
      role: 'assistant',
      text: "Hello! I'm your Legal Copilot Assistant. I have analyzed your document context. Ask me anything about termination rules, liability caps, payment deadlines, or non-compete clauses!"
    }
  ]);
  const [chatInputText, setChatInputText] = useState<string>('');

  useEffect(() => {
    runAnalysis(contractText);
  }, []);

  const runAnalysis = (text: string) => {
    const res = legalEngine.analyzeDocument(text);
    setReport(res);
  };

  const handleSampleClick = (key: string) => {
    setSelectedSample(key);
    if (SAMPLE_CONTRACTS[key]) {
      setContractText(SAMPLE_CONTRACTS[key].content);
      runAnalysis(SAMPLE_CONTRACTS[key].content);
    }
  };

  const handleChatSend = (queryText?: string) => {
    const q = queryText || chatInputText;
    if (!q.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: q }];
    setChatMessages(newMsgs);
    if (!queryText) setChatInputText('');

    setTimeout(() => {
      const res = legalEngine.answerQuestion(q, contractText);
      setChatMessages([...newMsgs, { role: 'assistant', text: res.answer, citation: res.citation }]);
    }, 200);
  };

  const compResult = legalEngine.compareContracts(compareA, compareB);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#0D121E]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Scale className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SecureLegal.AI
          </span>
          <span className="text-xs font-semibold uppercase px-2.5 py-0.5 bg-indigo-500/20 text-cyan-400 border border-indigo-500/40 rounded-full">
            Legal Copilot
          </span>
        </div>

        <nav className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveView('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'analyzer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" /> Document Analyzer
          </button>
          <button 
            onClick={() => setActiveView('compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'compare' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <GitCompare className="w-4 h-4" /> Contract Comparison
          </button>
          <button 
            onClick={() => setActiveView('assistant')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'assistant' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" /> Legal Q&A Assistant
          </button>
          <button 
            onClick={() => setActiveView('prep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeView === 'prep' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase className="w-4 h-4" /> Attorney Prep Pack
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('prep')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-sm font-medium hover:bg-white/15"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button 
            onClick={() => runAnalysis(contractText)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/40 hover:translate-y-[-1px] transition-all"
          >
            <Sparkles className="w-4 h-4" /> Run AI Analysis
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-6">
        
        {/* Legal Disclaimer */}
        <div className="flex items-center gap-3 p-3.5 mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-slate-300">
          <ShieldAlert className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span><strong>Legal Information Disclaimer:</strong> SecureLegal.AI provides automated legal document simplification and information assistance. It is designed to assist comprehension and is not a substitute for formal professional legal advice.</span>
        </div>

        {/* VIEW 1: DOCUMENT ANALYZER */}
        {activeView === 'analyzer' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Legal Document Simplifier & Risk Radar</h1>
                <p className="text-slate-400 text-sm">Paste your legal agreement or choose a pre-loaded sample document below.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Sample Contracts:</span>
                <div className="flex gap-2">
                  {Object.keys(SAMPLE_CONTRACTS).map(key => (
                    <button
                      key={key}
                      onClick={() => handleSampleClick(key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${selectedSample === key ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                      {SAMPLE_CONTRACTS[key].type.split('&')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Input Editor */}
              <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <FileText className="w-5 h-5 text-indigo-400" /> Contract Input
                    </div>
                    <button 
                      onClick={() => { setContractText(''); runAnalysis(''); }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>

                  <textarea
                    value={contractText}
                    onChange={(e) => { setContractText(e.target.value); runAnalysis(e.target.value); }}
                    placeholder="Paste legal document text here..."
                    className="w-full h-[460px] p-4 bg-[#0D121E]/80 border border-white/10 rounded-xl text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>

                {report && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400" /> Parties: <span className="font-semibold">{report.metadata.parties}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Gavel className="w-3.5 h-3.5 text-cyan-400" /> Law: <span className="font-semibold">{report.metadata.law}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Term: <span className="font-semibold">{report.metadata.term}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Analysis Results */}
              <div className="lg:col-span-7 glass-card p-6 space-y-6">
                
                {report && (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-bold">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white leading-none">{report.overallRiskScore} / 100</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{report.riskLevel}</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
                          {report.highRiskCount} High
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white leading-none">{report.highRiskCount} Red Flags</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Critical Clauses</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white leading-none">{report.wordCount} Words</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{report.readingTime} Min Read</div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-lg flex items-center justify-center">
                          <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white leading-none">{report.checklist.length} Actions</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Checklist Items</div>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> AI Executive Summary
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {report.execSummary.replace(/\*\*/g, '')}
                      </p>
                    </div>

                    {/* Tabs */}
                    <div>
                      <div className="flex gap-4 border-b border-white/10 mb-4">
                        <button
                          onClick={() => setActiveTab('risks')}
                          className={`pb-2 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'risks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                          <ShieldAlert className="w-4 h-4" /> Risk Radar & Red Flags
                        </button>
                        <button
                          onClick={() => setActiveTab('plain')}
                          className={`pb-2 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'plain' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                          <FileText className="w-4 h-4" /> Plain English Breakdown
                        </button>
                        <button
                          onClick={() => setActiveTab('checklist')}
                          className={`pb-2 text-sm font-medium flex items-center gap-2 transition-all border-b-2 ${activeTab === 'checklist' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                          <CheckSquare className="w-4 h-4" /> Actionable Checklist
                        </button>
                      </div>

                      {/* Tab 1: Risk Radar Cards */}
                      {activeTab === 'risks' && (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {[...report.risks.high.map(r => ({ ...r, level: 'high' as const })), ...report.risks.medium.map(r => ({ ...r, level: 'medium' as const })), ...report.risks.safe.map(r => ({ ...r, level: 'safe' as const }))].map((r, i) => (
                            <div key={i} className={`p-4 rounded-xl border ${r.level === 'high' ? 'bg-red-500/10 border-red-500/30' : r.level === 'medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-semibold flex items-center gap-2 ${r.level === 'high' ? 'text-red-400' : r.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {r.level === 'high' ? <AlertTriangle className="w-4 h-4" /> : r.level === 'medium' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                  {r.title}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${r.level === 'high' ? 'bg-red-500' : r.level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                  {r.level === 'high' ? 'High Risk' : r.level === 'medium' ? 'Caution' : 'Safe Standard'}
                                </span>
                              </div>
                              <div className="p-2.5 mb-2 bg-black/40 border-l-2 border-slate-500 rounded font-mono text-xs text-slate-300">
                                {r.snippet}
                              </div>
                              <p className="text-xs text-slate-200 mb-2">{r.explanation}</p>
                              {r.alternative && (
                                <div className="p-2 bg-emerald-500/10 border border-dashed border-emerald-500/30 rounded text-xs text-emerald-300">
                                  <strong>💡 Recommended Safer Rewrite:</strong> {r.alternative}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab 2: Plain English Side-by-Side */}
                      {activeTab === 'plain' && (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {report.plainEnglish.map((item, i) => (
                            <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                              <div className="px-4 py-2 bg-white/5 text-xs font-semibold text-cyan-400 border-b border-white/10">
                                {item.title}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                                <div className="font-mono text-xs text-slate-400 border-r border-white/10 pr-2">
                                  📄 {item.original}
                                </div>
                                <div className="text-xs text-slate-200">
                                  {item.simplified}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab 3: Actionable Checklist */}
                      {activeTab === 'checklist' && (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {report.checklist.map((item, i) => (
                            <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CheckSquare className="w-5 h-5 text-cyan-400" />
                                <div>
                                  <div className="text-sm font-medium text-white">{item.task}</div>
                                  <div className="text-xs text-slate-400">Timing: {item.due}</div>
                                </div>
                              </div>
                              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 rounded-full">
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CONTRACT COMPARISON */}
        {activeView === 'compare' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Side-by-Side Contract Comparison</h1>
                <p className="text-slate-400 text-sm">Compare two agreement versions or vendor proposals to identify key differences in risk, liability, and rights.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4 space-y-3">
                <div className="text-sm font-semibold text-cyan-400 flex items-center justify-between">
                  <span>Document A (Proposal 1)</span>
                  <span className="text-xs text-slate-400 font-normal">SaaS Agreement</span>
                </div>
                <textarea
                  value={compareA}
                  onChange={(e) => setCompareA(e.target.value)}
                  className="w-full h-64 p-3 bg-[#0D121E]/80 border border-white/10 rounded-xl text-xs font-mono text-slate-300"
                />
              </div>

              <div className="glass-card p-4 space-y-3">
                <div className="text-sm font-semibold text-cyan-400 flex items-center justify-between">
                  <span>Document B (Proposal 2)</span>
                  <span className="text-xs text-slate-400 font-normal">Commercial Lease</span>
                </div>
                <textarea
                  value={compareB}
                  onChange={(e) => setCompareB(e.target.value)}
                  className="w-full h-64 p-3 bg-[#0D121E]/80 border border-white/10 rounded-xl text-xs font-mono text-slate-300"
                />
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" /> Side-by-Side Feature Matrix Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-white/5 text-cyan-400 uppercase text-xs">
                    <tr>
                      <th className="p-3">Legal Feature / Clause</th>
                      <th className="p-3">Document A</th>
                      <th className="p-3">Document B</th>
                      <th className="p-3">Safer Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {compResult.comparisons.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-white">{row.feature}</td>
                        <td className="p-3">{row.valA}</td>
                        <td className="p-3">{row.valB}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md text-xs font-semibold">
                            {row.winner}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: LEGAL Q&A ASSISTANT */}
        {activeView === 'assistant' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Grounded Legal Q&A Assistant</h1>
              <p className="text-slate-400 text-sm">Ask specific questions about your uploaded document. Answers are strictly grounded with exact clause citations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[580px]">
              <div className="lg:col-span-8 glass-card flex flex-col overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'}`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-white/10 text-slate-200'}`}>
                        <div>{msg.text}</div>
                        {msg.citation && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 font-mono text-[11px]">
                            <Bookmark className="w-3 h-3" /> Grounded Citation: {msg.citation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[#0D121E]/90 border-t border-white/10 flex gap-3">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Ask a legal question (e.g. 'What happens if I cancel early?')..."
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleChatSend()}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4" /> Ask AI
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 glass-card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Common Legal Questions
                </h3>
                <div className="space-y-2">
                  {[
                    "What happens if I cancel the agreement early?",
                    "What is the maximum liability cap under this contract?",
                    "Does the vendor get rights to train AI models on my data?",
                    "Are there any non-compete restrictions for employees?",
                    "What happens if rent is paid late?"
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleChatSend(prompt)}
                      className="w-full text-left p-3 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 transition-all"
                    >
                      ❓ {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ATTORNEY PREP PACK */}
        {activeView === 'prep' && report && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Attorney Consultation Prep Sheet</h1>
                <p className="text-slate-400 text-sm">Generate a structured consultation document to save expensive billable time with professional legal counsel.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>

            <div className="bg-[#0D121E] border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="border-b-2 border-indigo-500 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">{report.attorneyPrep.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Generated on {report.attorneyPrep.date} | Jurisdiction: {report.attorneyPrep.law}</p>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${report.overallRiskScore > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                    Risk Rating: {report.overallRiskScore}/100
                  </div>
                  <div className="text-xs text-slate-400">{report.riskLevel}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-cyan-400">1. High-Priority Risk Red Flags to Address</h3>
                <div className="space-y-2">
                  {report.attorneyPrep.highRisks.map((r, i) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                      <div className="text-sm font-semibold text-red-400">⚠️ {r.title}</div>
                      <div className="text-xs text-slate-300">{r.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-cyan-400">2. Recommended Questions to Ask Your Lawyer</h3>
                <div className="space-y-2">
                  {report.attorneyPrep.questions.map((q, i) => (
                    <div key={i} className="p-3 bg-white/5 border-l-4 border-indigo-500 rounded-r-xl text-xs text-slate-200">
                      <strong>Q{i + 1}:</strong> {q}
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
