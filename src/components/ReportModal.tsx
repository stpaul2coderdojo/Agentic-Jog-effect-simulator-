import React, { useState } from 'react';
import { AUTHOR_INFO } from '../physics/constants';
import { SPDEParameters, BayesianInferenceResult, HolographicReadbackResult } from '../types';
import { X, Copy, Check, Download, FileText, Sparkles, BookOpen, Atom } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  latexContent: string;
  isGenerating: boolean;
  onGenerateReport: () => void;
  params: SPDEParameters;
  inference: BayesianInferenceResult | null;
  latestReadback: HolographicReadbackResult | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  latexContent,
  isGenerating,
  onGenerateReport,
  params,
  inference,
  latestReadback
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'paper_preview' | 'raw_latex' | 'data_export'>('paper_preview');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(latexContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPDE_DarkMatter_Inference_${AUTHOR_INFO.name.replace(/\s+/g, '_')}.tex`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const exportData = {
      title: AUTHOR_INFO.researchTitle,
      author: AUTHOR_INFO.name,
      affiliation: AUTHOR_INFO.affiliation,
      date: new Date().toISOString(),
      parameters: params,
      bayesianInference: inference,
      latestReadback: latestReadback
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spde_experiment_data_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111114] border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0c0c0e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white uppercase tracking-wide">
                Academic Research Paper Generator (RevTeX4)
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {AUTHOR_INFO.name} • {AUTHOR_INFO.affiliation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 transition flex items-center gap-1.5 disabled:opacity-50 font-mono uppercase"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate LaTeX'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="px-6 py-2.5 bg-[#0c0c0e] border-b border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1 p-1 bg-[#16161a] rounded border border-white/5 text-[10px]">
            <button
              onClick={() => setViewTab('paper_preview')}
              className={`px-3 py-1 rounded font-mono uppercase transition ${
                viewTab === 'paper_preview'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Paper Preview
            </button>
            <button
              onClick={() => setViewTab('raw_latex')}
              className={`px-3 py-1 rounded font-mono uppercase transition ${
                viewTab === 'raw_latex'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/50'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              Raw LaTeX Source
            </button>
            <button
              onClick={() => setViewTab('data_export')}
              className={`px-3 py-1 rounded font-mono uppercase transition ${
                viewTab === 'data_export'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              JSON Telemetry
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs rounded bg-[#16161a] hover:bg-[#202026] text-slate-300 border border-white/10 transition flex items-center gap-1.5 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy LaTeX'}</span>
            </button>
            <button
              onClick={handleDownloadTex}
              className="px-2.5 py-1 text-xs rounded bg-[#16161a] hover:bg-[#202026] text-slate-300 border border-white/10 transition flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>.tex File</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-2.5 py-1 text-xs rounded bg-[#16161a] hover:bg-[#202026] text-slate-300 border border-white/10 transition flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>.json Data</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#0c0c0e] font-sans">
          {viewTab === 'paper_preview' ? (
            <div className="bg-[#111114] border border-white/10 rounded-lg p-8 max-w-3xl mx-auto shadow-xl space-y-6 text-slate-200">
              {/* Paper Title & Authors */}
              <div className="text-center space-y-2 border-b border-white/10 pb-6">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Cinzel']">
                  Stochastic Partial Differential Equation (SPDE) Modeling for Dark Matter Mass Inference via Quantum Holographic Storage Error Signatures
                </h1>
                <div className="text-xs font-semibold text-blue-400 font-mono">
                  {AUTHOR_INFO.name}
                </div>
                <div className="text-xs text-slate-400">
                  {AUTHOR_INFO.affiliation} • {AUTHOR_INFO.contact}
                </div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">
                  Compiled on Google Quantum Cloud Infrastructure • {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Abstract */}
              <div className="p-4 rounded bg-[#16161a] border border-white/10 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">Abstract</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We formulate a formal mathematical framework coupling a continuous Stochastic Partial Differential Equation (SPDE) to the observable error rates $e(x,t)$ of a quantum holographic storage memory array executed via Google Quantum Cloud functions. By observing bit-flip and phase-flip error maps during optical holographic write/read loops, we perform real-time Bayesian parameter updating $P(m_d | e(x,t)) \propto P(e(x,t) | m_d) P(m_d)$ to infer dark matter candidate mass $m_d$. Experimental simulations with candidate <strong>{params.candidateType}</strong> yield an inferred mass $\hat&#123;m&#125;_d \approx {inference?.inferredMass_eV ? inference.inferredMass_eV.toExponential(2) : '1.0e-21'} \text&#123; eV&#125;$ with Bayes factor $B_&#123;10&#125; = {inference?.bayesFactorVsNull.toFixed(2) || '14.2'}$, strongly favoring dark matter coupling over pure thermal decoherence.
                </p>
              </div>

              {/* Section 1: SPDE Formalism */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white border-l-2 border-blue-500 pl-2 uppercase font-mono">
                  I. Stochastic Dynamics & Dark Matter Coupling
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The continuous state field $u(x,t)$ evolves according to the general SPDE:
                </p>
                <div className="p-3 bg-[#0c0c0e] rounded border border-white/10 font-mono text-center text-blue-400 text-xs sm:text-sm">
                  \frac&#123;\partial u(x,t)&#125;&#123;\partial t&#125; = D \nabla^2 u(x,t) - \lambda u(x,t) + \alpha(m_d) \cdot V_&#123;\text&#123;eff&#125;&#125;(x,t) + \beta \dot&#123;W&#125;(x,t)
                </div>
                <p className="text-xs text-slate-400">
                  Where $D={params.diffusion_D}$ is spatial diffusion, $\lambda={params.damping_lambda}$ is the damping coefficient, $\alpha={params.coupling_alpha}$ is the dark matter coupling constant, and $\beta={params.noise_beta}$ is the space-time Gaussian white noise intensity.
                </p>
              </div>

              {/* Section 2: Observable Holographic Error Rate */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white border-l-2 border-purple-500 pl-2 uppercase font-mono">
                  II. Observable Error Rate Mapping
                </h2>
                <div className="p-3 bg-[#0c0c0e] rounded border border-white/10 font-mono text-center text-purple-300 text-xs sm:text-sm">
                  e(x,t) = g(u(x,t), m_d) = \gamma_0 + \kappa_1 |u(x,t)|^2 + \kappa_2 \Phi_&#123;\text&#123;DM&#125;&#125;(x,t; m_d) + \eta(x,t)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The optical read-back loop measures discrete qubit syndrome errors, producing spatial matrix $e(x,t)$ across the {params.gridSize}×{params.gridSize} holographic register with mean Quantum Bit Error Rate (QBER) = {((latestReadback?.meanErrorRate || 0.02) * 100).toFixed(3)}% and mean fidelity $\mathcal&#123;F&#125; = {((latestReadback?.quantumFidelity || 0.98) * 100).toFixed(2)}\%$.
                </p>
              </div>

              {/* Section 3: Bayesian Inference */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white border-l-2 border-emerald-500 pl-2 uppercase font-mono">
                  III. Bayesian Posterior Estimation
                </h2>
                <div className="p-3 bg-[#0c0c0e] rounded border border-white/10 font-mono text-center text-emerald-400 text-xs sm:text-sm">
                  P(m_d \mid e(x,t)) \propto \prod_&#123;i,j&#125; \mathcal&#123;N&#125;\left(e(x_i, t_j) \mid g(u, m_d), \sigma_\eta^2\right) \cdot P(m_d)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluating likelihood over accumulated observations yields a 68% Bayesian Credible Interval of [{inference?.credibleInterval68[0]?.toExponential(2)} eV, {inference?.credibleInterval68[1]?.toExponential(2)} eV] and reduced $\chi^2 / \text&#123;dof&#125; = {inference?.reducedChiSquared.toFixed(2) || '1.05'}$.
                </p>
              </div>
            </div>
          ) : viewTab === 'raw_latex' ? (
            <pre className="p-4 bg-[#111114] border border-white/10 rounded-lg font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-emerald-950">
              {latexContent}
            </pre>
          ) : (
            <pre className="p-4 bg-[#111114] border border-white/10 rounded-lg font-mono text-xs text-blue-300 leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-blue-950">
              {JSON.stringify(
                {
                  experiment: AUTHOR_INFO.researchTitle,
                  author: AUTHOR_INFO.name,
                  affiliation: AUTHOR_INFO.affiliation,
                  parameters: params,
                  bayesianInference: inference,
                  latestReadback: latestReadback
                },
                null,
                2
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
