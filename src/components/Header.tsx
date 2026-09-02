import React from 'react';
import { AUTHOR_INFO } from '../physics/constants';
import { Atom, Play, Pause, RotateCcw, Cpu, Sparkles, FileText, CheckCircle2, CloudLightning } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  isAutoPilot: boolean;
  onToggleRun: () => void;
  onToggleAutoPilot: () => void;
  onReset: () => void;
  onSingleStep: () => void;
  onOpenReport: () => void;
  totalLoops: number;
  averageFidelity: number;
  bayesFactor: number;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  isAutoPilot,
  onToggleRun,
  onToggleAutoPilot,
  onReset,
  onSingleStep,
  onOpenReport,
  totalLoops,
  averageFidelity,
  bayesFactor
}) => {
  return (
    <header className="border-b border-white/10 bg-[#111114] sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Branding & Author Attribution matching Elegant Dark prototype */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-sm shadow-blue-500/30">
            SR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wider uppercase text-blue-400">
                Synergy Robotics Seattle
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-white/5 border border-white/10 text-slate-400">
                v2.4 SPDE Core
              </span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Quantum Holographic Storage & Dark Matter Mass Inference
            </p>
          </div>
        </div>

        {/* Center / Investigator & Link status */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Principal Investigator</p>
            <p className="text-xs font-medium text-slate-200">{AUTHOR_INFO.name}</p>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-mono text-emerald-500 font-semibold tracking-wide">
              Quantum Cloud Link: Active
            </span>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          {/* Quick Metrics */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded bg-black/40 border border-white/5 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Loops: </span>
              <span className="text-white font-bold">{totalLoops}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">Fidelity: </span>
              <span className="text-blue-400 font-bold">{(averageFidelity * 100).toFixed(2)}%</span>
            </div>
            <span className="text-slate-700">|</span>
            <div>
              <span className="text-slate-500 text-[10px] uppercase">B₁₀: </span>
              <span className={`font-bold ${bayesFactor > 10 ? 'text-emerald-400' : 'text-amber-500'}`}>
                {bayesFactor > 1000 ? '> 10³' : bayesFactor.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Single step loop button */}
          <button
            id="btn-step-loop"
            onClick={onSingleStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 text-[10px] font-bold uppercase rounded bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            title="Execute a single holographic write/read loop"
          >
            <Cpu className="w-3 h-3 text-blue-400" />
            <span>Single Loop</span>
          </button>

          {/* Continuous Run / Pause button */}
          <button
            id="btn-toggle-run"
            onClick={onToggleRun}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded border transition flex items-center gap-1.5 ${
              isRunning
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20'
                : 'bg-blue-600/10 border-blue-500/50 text-blue-400 hover:bg-blue-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Run SPDE Loops</span>
              </>
            )}
          </button>

          {/* Auto-Pilot Agent Toggle */}
          <button
            id="btn-toggle-autopilot"
            onClick={onToggleAutoPilot}
            className={`px-2.5 py-1.5 text-[10px] font-bold uppercase rounded border transition flex items-center gap-1.5 ${
              isAutoPilot
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 ring-1 ring-purple-500/30'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Toggle autonomous Antigravity AI research loop"
          >
            <Sparkles className={`w-3 h-3 ${isAutoPilot ? 'text-purple-300 animate-pulse' : 'text-purple-400'}`} />
            <span>{isAutoPilot ? 'Auto Active' : 'Auto Agent'}</span>
          </button>

          {/* Reset button */}
          <button
            id="btn-reset-simulation"
            onClick={onReset}
            className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition"
            title="Reset SPDE state and observation history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* LaTeX Report Modal button */}
          <button
            id="btn-open-report"
            onClick={onOpenReport}
            className="px-2.5 py-1.5 text-[10px] font-bold uppercase rounded bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition flex items-center gap-1.5"
            title="Generate academic LaTeX research paper"
          >
            <FileText className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">LaTeX</span>
          </button>
        </div>
      </div>
    </header>
  );
};
