import React, { useState, useRef, useEffect } from 'react';
import { AgentResearchLog, SPDEParameters, BayesianInferenceResult, HolographicReadbackResult } from '../types';
import { Sparkles, Send, Play, Terminal, Bot, User, Cpu, FileText, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface AgenticResearchConsoleProps {
  logs: AgentResearchLog[];
  onSendMessage: (msg: string) => void;
  onTriggerAutoInvestigate: () => void;
  isAgentThinking: boolean;
  params: SPDEParameters;
  inference: BayesianInferenceResult | null;
  latestReadback: HolographicReadbackResult | null;
}

export const AgenticResearchConsole: React.FC<AgenticResearchConsoleProps> = ({
  logs,
  onSendMessage,
  onTriggerAutoInvestigate,
  isAgentThinking,
  params,
  inference,
  latestReadback
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isAgentThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAgentThinking) return;
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const quickPrompts = [
    "Analyze SPDE state u(x,t) residuals vs pure thermal decoherence",
    "How does damping λ affect our Bayesian credible interval?",
    "Check if observed QBER matches Compton frequency for this DM candidate",
    "Synthesize hypothesis on coupling α(m_d) and surface code syndrome violations"
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Antigravity AI Quantum Research Agent</span>
              <span className="text-[10px] font-mono text-blue-400 font-normal px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30 uppercase">
                Gemini 3.7 Flash
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Autonomous reasoning over SPDE parameters, holographic errors, and Bayesian DM mass estimates
            </p>
          </div>
        </div>

        {/* Auto Investigate Action */}
        <button
          onClick={onTriggerAutoInvestigate}
          disabled={isAgentThinking}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 uppercase font-mono"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Auto-Investigate</span>
        </button>
      </div>

      {/* Chat / Thought Stream Display */}
      <div
        ref={logContainerRef}
        className="flex-1 rounded bg-[#0c0c0e] border border-white/10 p-3 overflow-y-auto space-y-3 font-sans text-xs scroll-smooth"
      >
        {logs.map((log) => {
          const isAgent = log.sender === 'agent';
          const isUser = log.sender === 'user';

          return (
            <div
              key={log.id}
              className={`flex flex-col gap-1 ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase">
                {isAgent ? (
                  <>
                    <Bot className="w-3 h-3 text-blue-400" />
                    <span className="font-semibold text-blue-400">Antigravity Agent</span>
                    {log.agentRole && <span className="text-slate-600">• {log.agentRole}</span>}
                  </>
                ) : isUser ? (
                  <>
                    <span className="font-semibold text-blue-300">You (Dr. Bheemaiah Anil Kumar's Lab)</span>
                    <User className="w-3 h-3 text-blue-400" />
                  </>
                ) : (
                  <>
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Quantum Cloud System</span>
                  </>
                )}
                <span className="text-slate-600 ml-1">{log.timestamp.split('T')[1]?.substring(0, 8) || ''}</span>
              </div>

              <div
                className={`p-3 rounded max-w-[90%] leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-950/40 text-blue-100 border border-blue-500/30'
                    : isAgent
                    ? 'bg-[#16161a] text-slate-200 border border-white/10 shadow-sm'
                    : 'bg-[#0c0c0e] text-slate-400 border border-white/5 font-mono text-[11px]'
                }`}
              >
                {log.content}
              </div>
            </div>
          );
        })}

        {isAgentThinking && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-[#16161a] border border-blue-500/30 text-blue-300 animate-pulse text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Antigravity Agent is synthesizing SPDE dynamics & Bayesian posterior...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            disabled={isAgentThinking}
            className="px-2 py-0.5 rounded bg-[#16161a] text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/20 whitespace-nowrap transition flex-shrink-0 flex items-center gap-1 font-mono"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </button>
        ))}
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Antigravity Agent to analyze SPDE parameters, dark matter mass, or cloud functions..."
          disabled={isAgentThinking}
          className="flex-1 px-3 py-1.5 rounded bg-[#0c0c0e] border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition font-mono"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isAgentThinking}
          className="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
