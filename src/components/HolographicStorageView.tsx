import React, { useState } from 'react';
import { HolographicReadbackResult, HolographicStorageConfig } from '../types';
import { Database, Binary, ShieldCheck, RefreshCw, AlertTriangle, Cpu, Radio, Sparkles } from 'lucide-react';

interface HolographicStorageViewProps {
  latestResult: HolographicReadbackResult | null;
  config: HolographicStorageConfig;
  onUpdateConfig: (newConfig: Partial<HolographicStorageConfig>) => void;
  onTriggerWriteReadLoop: () => void;
  isRunning: boolean;
}

export const HolographicStorageView: React.FC<HolographicStorageViewProps> = ({
  latestResult,
  config,
  onUpdateConfig,
  onTriggerWriteReadLoop,
  isRunning
}) => {
  const [activeTab, setActiveTab] = useState<'error_map' | 'written_vs_read' | 'syndrome'>('error_map');
  const [patternType, setPatternType] = useState<'superposition_random' | 'checkerboard' | 'hadamard_basis' | 'phase_vortex'>('superposition_random');

  const rows = config.qubitRows;
  const cols = config.qubitCols;

  const errorMap = latestResult?.errorMap || [];
  const writtenBits = latestResult?.writtenBits || [];
  const readBits = latestResult?.readBits || [];

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Quantum Holographic Storage Array</span>
              <span className="text-[10px] font-mono text-blue-400 font-normal px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30 uppercase">
                {rows}x{cols} ({rows * cols} Qubits)
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Optical lattice register coupled to continuous SPDE state u(x,t)
            </p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0c0c0e] rounded border border-white/5 text-[10px]">
          <button
            onClick={() => setActiveTab('error_map')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'error_map'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            e(x,t) Error Map
          </button>
          <button
            onClick={() => setActiveTab('written_vs_read')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'written_vs_read'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Bit Flip Check
          </button>
          <button
            onClick={() => setActiveTab('syndrome')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'syndrome'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Surface Code
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="relative aspect-square w-full max-h-[360px] rounded overflow-hidden bg-[#0c0c0e] border border-white/10 p-2 flex items-center justify-center">
        {errorMap.length > 0 ? (
          <div 
            className="grid gap-1 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
            }}
          >
            {errorMap.map((row, r) =>
              row.map((errVal, c) => {
                const written = writtenBits[r]?.[c] ?? 0;
                const read = readBits[r]?.[c] ?? 0;
                const isFlipped = written !== read;

                // Color calculation based on active tab
                let bgClass = 'bg-[#16161a]';
                let style: React.CSSProperties = {};

                if (activeTab === 'error_map') {
                  const normErr = Math.min(1.0, errVal * 12);
                  style = {
                    backgroundColor: `rgb(${Math.floor(normErr * 230 + 15)}, ${Math.floor((1 - normErr) * 120 + 20)}, ${Math.floor((1 - normErr) * 200 + 35)})`
                  };
                } else if (activeTab === 'written_vs_read') {
                  if (isFlipped) {
                    bgClass = 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse';
                  } else {
                    bgClass = written === 1 ? 'bg-blue-600/80' : 'bg-[#16161a]';
                  }
                } else {
                  // Surface Code Syndrome
                  bgClass = isFlipped ? 'bg-amber-500 border border-amber-400' : 'bg-emerald-600/50';
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    style={style}
                    className={`rounded-[2px] transition-all duration-300 flex items-center justify-center text-[8px] font-mono select-none cursor-pointer ${bgClass}`}
                    title={`Qubit [${r},${c}] - Err: ${(errVal * 100).toFixed(2)}% | In: ${written} -> Out: ${read}`}
                  >
                    {activeTab === 'written_vs_read' && (
                      <span className={isFlipped ? 'text-white font-bold' : 'text-slate-300'}>
                        {read}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="text-center text-slate-500 space-y-2 p-6">
            <Radio className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
            <p className="text-xs uppercase font-mono">Awaiting holographic write/read execution...</p>
          </div>
        )}

        {/* Overlay loop info badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-[#111114]/90 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-2">
          <span>QBER: <strong className="text-rose-400 font-bold">{((latestResult?.meanErrorRate || 0) * 100).toFixed(3)}%</strong></span>
          <span className="text-slate-600">|</span>
          <span>Fidelity: <strong className="text-blue-400 font-bold">{((latestResult?.quantumFidelity || 0.99) * 100).toFixed(2)}%</strong></span>
          <span className="text-slate-600">|</span>
          <span>Flips: <strong className="text-amber-400 font-bold">{latestResult?.syndromeViolations || 0}</strong></span>
        </div>
      </div>

      {/* Controls & Hardware parameters footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
        <div className="p-2 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Storage Duration (T_store)</span>
          <span className="font-mono text-blue-400 font-semibold">{config.storageDuration_us} µs</span>
        </div>

        <div className="p-2 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Cryogenic Temp</span>
          <span className="font-mono text-emerald-400 font-semibold">{config.temperature_mK} mK</span>
        </div>

        <div className="p-2 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Coherence T₁ / T₂</span>
          <span className="font-mono text-indigo-300 font-semibold">{config.decoherenceT1_us} / {config.dephasingT2_us} µs</span>
        </div>

        <div className="p-2 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Correction Code</span>
          <span className="font-mono text-purple-300 font-semibold truncate block">
            {config.errorCorrectionCode === 'surface_code_17' ? 'Surface-17' : config.errorCorrectionCode}
          </span>
        </div>
      </div>
    </div>
  );
};
