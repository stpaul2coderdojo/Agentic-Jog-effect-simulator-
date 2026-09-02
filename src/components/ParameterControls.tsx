import React, { useState } from 'react';
import { SPDEParameters, HolographicStorageConfig, DarkMatterCandidateType } from '../types';
import { DM_CANDIDATES } from '../physics/constants';
import { Sliders, Cpu, Sparkles, Settings2, Info, RefreshCw, Zap } from 'lucide-react';

interface ParameterControlsProps {
  params: SPDEParameters;
  storageConfig: HolographicStorageConfig;
  onUpdateParams: (newParams: Partial<SPDEParameters>) => void;
  onUpdateStorageConfig: (newConfig: Partial<HolographicStorageConfig>) => void;
  onSelectCandidate: (candidateType: DarkMatterCandidateType) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  params,
  storageConfig,
  onUpdateParams,
  onUpdateStorageConfig,
  onSelectCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'spde_params' | 'holographic'>('candidates');

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm">
      {/* Header with Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase">
              Simulation Controls & Calibration
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Dark matter candidate parameters, SPDE coefficients, and holographic memory array
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#0c0c0e] rounded border border-white/5 text-[10px]">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'candidates'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            DM Candidates
          </button>
          <button
            onClick={() => setActiveTab('spde_params')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'spde_params'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            SPDE Params (λ, α, β)
          </button>
          <button
            onClick={() => setActiveTab('holographic')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              activeTab === 'holographic'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Quantum Hardware
          </button>
        </div>
      </div>

      {/* Tab 1: Dark Matter Candidates */}
      {activeTab === 'candidates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {DM_CANDIDATES.map((c) => {
            const isSelected = params.candidateType === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCandidate(c.id)}
                className={`p-3 rounded border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50 shadow-sm'
                    : 'bg-[#16161a] border-white/5 hover:bg-[#1c1c22] hover:border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-white tracking-wide">
                      {c.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0c0c0e] text-blue-400 border border-white/5">
                      {c.massRangeDisplay}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-slate-500 border-t border-white/5 pt-1.5 flex items-center justify-between">
                  <span>α_coupling: <strong className="text-blue-400">{c.predictedAlpha}</strong></span>
                  <span className="text-slate-400 truncate max-w-[120px] uppercase text-[9px]">{c.couplingType.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: SPDE Mathematical Parameters (lambda, alpha, beta, D) */}
      {activeTab === 'spde_params' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-[#16161a] rounded border border-white/10">
          {/* Damping lambda */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Damping (λ)</span>
              <span className="font-mono text-blue-400 font-bold">{params.damping_lambda.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.00"
              step="0.05"
              value={params.damping_lambda}
              onChange={(e) => onUpdateParams({ damping_lambda: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Field relaxation rate -λu(x,t)
            </p>
          </div>

          {/* DM Coupling alpha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">DM Coupling (α)</span>
              <span className="font-mono text-purple-300 font-bold">{params.coupling_alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.00"
              max="2.00"
              step="0.05"
              value={params.coupling_alpha}
              onChange={(e) => onUpdateParams({ coupling_alpha: parseFloat(e.target.value) })}
              className="w-full accent-purple-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Interaction strength α(m_d) · V_eff
            </p>
          </div>

          {/* Noise intensity beta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Noise Amplitude (β)</span>
              <span className="font-mono text-rose-300 font-bold">{params.noise_beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.80"
              step="0.02"
              value={params.noise_beta}
              onChange={(e) => onUpdateParams({ noise_beta: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Stochastic noise β·Ẇ
            </p>
          </div>

          {/* Diffusion D */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Diffusion Constant (D)</span>
              <span className="font-mono text-amber-300 font-bold">{params.diffusion_D.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.050"
              step="0.002"
              value={params.diffusion_D}
              onChange={(e) => onUpdateParams({ diffusion_D: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Spatial Laplacian D·∇²u
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Quantum Holographic Hardware Parameters */}
      {activeTab === 'holographic' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-[#16161a] rounded border border-white/10">
          {/* Storage duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Storage Time (T_store)</span>
              <span className="font-mono text-blue-400 font-bold">{storageConfig.storageDuration_us} µs</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={storageConfig.storageDuration_us}
              onChange={(e) => onUpdateStorageConfig({ storageDuration_us: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Holographic memory hold time
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Temperature (T)</span>
              <span className="font-mono text-emerald-400 font-bold">{storageConfig.temperature_mK} mK</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={storageConfig.temperature_mK}
              onChange={(e) => onUpdateStorageConfig({ temperature_mK: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Dilution stage temperature
            </p>
          </div>

          {/* Readout efficiency */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Readout Efficiency</span>
              <span className="font-mono text-indigo-300 font-bold">{((storageConfig.readoutEfficiency) * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.90"
              max="0.999"
              step="0.005"
              value={storageConfig.readoutEfficiency}
              onChange={(e) => onUpdateStorageConfig({ readoutEfficiency: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 h-1.5 bg-[#0c0c0e] rounded cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono">
              Single-shot detector efficiency
            </p>
          </div>

          {/* Error Correction Code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium text-[11px]">Error Correction</span>
              <span className="font-mono text-purple-300 font-bold text-[10px]">
                {storageConfig.errorCorrectionCode === 'surface_code_17' ? 'Surface-17' : storageConfig.errorCorrectionCode}
              </span>
            </div>
            <select
              value={storageConfig.errorCorrectionCode}
              onChange={(e) => onUpdateStorageConfig({ errorCorrectionCode: e.target.value as any })}
              className="w-full p-1.5 rounded bg-[#0c0c0e] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="surface_code_17">Surface Code (Distance-3, 17-qubit)</option>
              <option value="holographic_color_code">Holographic Color Code [[7,1,3]]</option>
              <option value="bosonic_cat">Bosonic Cat Code / Kerr Qubit</option>
              <option value="none">Unprotected Physical Qubits</option>
            </select>
            <p className="text-[9px] text-slate-500 font-mono">
              QEC syndrome decoding scheme
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
