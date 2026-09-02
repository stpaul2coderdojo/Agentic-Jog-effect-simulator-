import React, { useState } from 'react';
import { BayesianInferenceResult, SPDEParameters } from '../types';
import { TrendingUp, Target, ShieldAlert, BarChart3, Activity, Zap, CheckCircle2 } from 'lucide-react';

interface BayesianPosteriorViewProps {
  inference: BayesianInferenceResult | null;
  params: SPDEParameters;
  totalLoops: number;
}

export const BayesianPosteriorView: React.FC<BayesianPosteriorViewProps> = ({
  inference,
  params,
  totalLoops
}) => {
  const [chartType, setChartType] = useState<'posterior' | 'mcmc_trace' | 'likelihood'>('posterior');

  const curve = inference?.posteriorCurve || [];
  const mcmc = inference?.mcmcSamples || [];

  const trueLogMass = params.candidateType === 'null_hypothesis' ? -30 : Math.log10(Math.max(1e-25, params.injectedMass_eV));
  const inferredLogMass = inference?.inferredMass_log10eV ?? 0;

  // Format mass in clean scientific notation
  const formatMass = (eV: number): string => {
    if (params.candidateType === 'null_hypothesis' || eV <= 0) return '0 eV (Null)';
    if (eV < 1e-15) return `${(eV * 1e21).toFixed(2)} × 10⁻²¹ eV`;
    if (eV < 1e-6) return `${(eV * 1e12).toFixed(2)} × 10⁻¹² eV`;
    if (eV < 1e3) return `${eV.toFixed(2)} eV`;
    if (eV < 1e6) return `${(eV / 1e3).toFixed(2)} keV`;
    if (eV < 1e9) return `${(eV / 1e6).toFixed(2)} MeV`;
    return `${(eV / 1e9).toFixed(2)} GeV`;
  };

  // Bayes factor interpretation
  const getBayesEvidenceText = (bf: number): { label: string; color: string } => {
    if (params.candidateType === 'null_hypothesis' || bf < 1) return { label: 'Supports Null Hypothesis (No DM)', color: 'text-slate-400' };
    if (bf < 3) return { label: 'Anecdotal Evidence', color: 'text-amber-400' };
    if (bf < 10) return { label: 'Moderate Evidence', color: 'text-yellow-400' };
    if (bf < 30) return { label: 'Strong Evidence', color: 'text-emerald-400' };
    if (bf < 100) return { label: 'Very Strong Evidence', color: 'text-cyan-400' };
    return { label: 'Decisive Evidence for Dark Matter (B₁₀ > 100)', color: 'text-cyan-300 font-bold' };
  };

  const bayesStatus = getBayesEvidenceText(inference?.bayesFactorVsNull || 1);

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Bayesian SPDE Dark Matter Mass Posterior</span>
              <span className="text-[10px] font-mono text-blue-400 font-normal px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30 uppercase">
                P(m_d | e(x,t))
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Posterior probability density computed from space-time holographic error signatures
            </p>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#0c0c0e] rounded border border-white/5 text-[10px]">
          <button
            onClick={() => setChartType('posterior')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              chartType === 'posterior'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Posterior Density
          </button>
          <button
            onClick={() => setChartType('likelihood')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              chartType === 'likelihood'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Likelihood
          </button>
          <button
            onClick={() => setChartType('mcmc_trace')}
            className={`px-2 py-0.5 rounded uppercase font-mono font-semibold transition ${
              chartType === 'mcmc_trace'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            MCMC Chains
          </button>
        </div>
      </div>

      {/* Primary SVG Chart */}
      <div className="relative aspect-[16/9] w-full max-h-[300px] rounded overflow-hidden bg-[#0c0c0e] border border-white/10 p-3 flex flex-col justify-between">
        {curve.length > 0 ? (
          <div className="w-full h-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Background Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#16161a" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="#16161a" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#16161a" strokeDasharray="3 3" />
              <line x1="40" y1="155" x2="480" y2="155" stroke="#23232a" />

              {/* Y-Axis Label */}
              <text x="15" y="90" fill="#64748b" fontSize="8" textAnchor="middle" transform="rotate(-90 15 90)" fontFamily="monospace">
                {chartType === 'posterior' ? 'P(m_d | e)' : chartType === 'likelihood' ? 'L(m_d)' : 'Log₁₀(m_d / eV)'}
              </text>

              {/* X-Axis Labels */}
              <text x="50" y="175" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">10⁻²⁴ eV</text>
              <text x="155" y="175" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">10⁻¹⁵ eV</text>
              <text x="260" y="175" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">1 eV</text>
              <text x="365" y="175" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">1 keV</text>
              <text x="470" y="175" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">100 GeV</text>

              {chartType === 'posterior' || chartType === 'likelihood' ? (
                <>
                  {/* Shaded 68% Credible Interval Area */}
                  {(() => {
                    const minLog = -24;
                    const maxLog = 12;
                    const logRange = maxLog - minLog;
                    const c68 = inference?.credibleInterval68 || [1e-22, 1e-20];
                    const xStart = 40 + ((Math.log10(c68[0]) - minLog) / logRange) * 440;
                    const xEnd = 40 + ((Math.log10(c68[1]) - minLog) / logRange) * 440;

                    return (
                      <rect
                        x={Math.max(40, xStart)}
                        y="20"
                        width={Math.max(4, xEnd - xStart)}
                        height="135"
                        fill="#1e3a8a"
                        fillOpacity="0.3"
                      />
                    );
                  })()}

                  {/* Prior Curve (Dotted Grey) */}
                  <path
                    d={`M 40 145 L 480 145`}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* Posterior / Likelihood Density Path */}
                  {(() => {
                    const maxVal = Math.max(...curve.map(c => chartType === 'posterior' ? c.density : c.likelihood), 0.001);
                    const points = curve.map((pt, i) => {
                      const x = 40 + (i / (curve.length - 1)) * 440;
                      const val = chartType === 'posterior' ? pt.density : pt.likelihood;
                      const y = 155 - (val / maxVal) * 125;
                      return `${x},${y}`;
                    }).join(' L ');

                    return (
                      <>
                        <path
                          d={`M 40 155 L ${points} L 480 155 Z`}
                          fill="url(#posteriorGradient)"
                          opacity="0.25"
                        />
                        <path
                          d={`M ${points}`}
                          fill="none"
                          stroke={chartType === 'posterior' ? '#3b82f6' : '#06b6d4'}
                          strokeWidth="2"
                        />
                      </>
                    );
                  })()}

                  {/* True Injected Mass Vertical Line (Amber Dotted) */}
                  {params.candidateType !== 'null_hypothesis' && (() => {
                    const minLog = -24;
                    const maxLog = 12;
                    const xPos = 40 + ((trueLogMass - minLog) / (maxLog - minLog)) * 440;
                    return (
                      <g>
                        <line x1={xPos} y1="20" x2={xPos} y2="155" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x={xPos} y="15" fill="#f59e0b" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          True m_d
                        </text>
                      </g>
                    );
                  })()}

                  {/* Maximum A Posteriori (MAP) Peak Indicator */}
                  {params.candidateType !== 'null_hypothesis' && (() => {
                    const minLog = -24;
                    const maxLog = 12;
                    const xPos = 40 + ((inferredLogMass - minLog) / (maxLog - minLog)) * 440;
                    return (
                      <g>
                        <line x1={xPos} y1="20" x2={xPos} y2="155" stroke="#60a5fa" strokeWidth="1.5" />
                        <circle cx={xPos} cy="30" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                        <text x={xPos} y="15" fill="#60a5fa" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                          MAP ̂m_d
                        </text>
                      </g>
                    );
                  })()}
                </>
              ) : (
                /* MCMC Chain Trace Mode */
                <>
                  {(() => {
                    if (mcmc.length < 2) return null;
                    const points = mcmc.map((s, i) => {
                      const x = 40 + (i / (mcmc.length - 1)) * 440;
                      const logVal = Math.log10(Math.max(1e-25, s.mass_eV));
                      const y = 155 - ((logVal - (-24)) / 36) * 125;
                      return `${x},${Math.max(20, Math.min(155, y))}`;
                    }).join(' L ');

                    return (
                      <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        opacity="0.85"
                      />
                    );
                  })()}
                </>
              )}

              {/* Gradient definition */}
              <defs>
                <linearGradient id="posteriorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono uppercase">
            Awaiting write/read observational error data...
          </div>
        )}
      </div>

      {/* Bayesian Metrics & Estimated Parameter Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Inferred Mass (MAP ̂m_d)</span>
          <span className="font-mono text-blue-400 font-bold text-xs sm:text-sm">
            {formatMass(inference?.inferredMass_eV || 0)}
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">68% Credible Interval</span>
          <span className="font-mono text-slate-300 font-semibold text-[11px] truncate block">
            [{formatMass(inference?.credibleInterval68[0] || 0)} , {formatMass(inference?.credibleInterval68[1] || 0)}]
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">Bayes Factor (B₁₀)</span>
          <span className={`font-mono font-bold text-xs ${bayesStatus.color}`}>
            {(inference?.bayesFactorVsNull || 1) > 1000 ? '> 1000' : (inference?.bayesFactorVsNull || 1).toFixed(2)}
          </span>
        </div>

        <div className="p-2.5 rounded bg-[#16161a] border border-white/5">
          <span className="text-[9px] text-slate-500 uppercase font-mono block">SPDE Fitted λ / α / β</span>
          <span className="font-mono text-purple-300 font-semibold text-[11px] block">
            {inference?.bestFitLambda.toFixed(2)} / {inference?.bestFitAlpha.toFixed(2)} / {inference?.bestFitBeta.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bayes evidence interpretation banner */}
      <div className="px-3 py-1.5 rounded bg-[#16161a] border border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300 font-medium text-[11px] uppercase tracking-wide">Bayesian Hypothesis Test:</span>
        </div>
        <span className={`text-[11px] font-mono ${bayesStatus.color}`}>
          {bayesStatus.label}
        </span>
      </div>
    </div>
  );
};
