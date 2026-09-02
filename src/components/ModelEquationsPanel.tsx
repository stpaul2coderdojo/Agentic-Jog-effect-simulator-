import React, { useState } from 'react';
import { SPDEParameters } from '../types';
import { AUTHOR_INFO } from '../physics/constants';
import { BookOpen, ChevronDown, ChevronUp, Layers, Activity, Variable, Target, Calculator, CheckCircle, ExternalLink } from 'lucide-react';

interface ModelEquationsPanelProps {
  params: SPDEParameters;
  inferredMassDisplay: string;
}

export const ModelEquationsPanel: React.FC<ModelEquationsPanelProps> = ({
  params,
  inferredMassDisplay
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(6); // Default highlight example SPDE step

  const steps = [
    {
      stepNumber: 1,
      title: "Observable Parameters & State Variables",
      icon: Variable,
      formula: "u(x,t) \\quad \\text{and} \\quad e(x,t)",
      description: "Let u(x,t) represent the state variable (physical field/quantum holographic register excitation) at position x and time t. The observable parameter e(x,t) represents the spatial error rate during holographic data storage.",
      highlight: "u(x,t) = \\text{Quantum spatial phase excitation}, \\quad e(x,t) = \\text{Bit/Phase error rate}"
    },
    {
      stepNumber: 2,
      title: "Stochastic Dynamics of the System",
      icon: Activity,
      formula: "\\frac{\\partial u(x,t)}{\\partial t} = \\mathcal{L} u(x,t) + \\mathcal{F}(u(x,t)) + \\sigma(u(x,t)) \\dot{W}(x,t)",
      description: "General form of the Stochastic Partial Differential Equation (SPDE) governing the system's quantum state evolution under deterministic interactions and space-time white noise.",
      highlight: "\\mathcal{L} = D \\nabla^2 \\text{ (Laplacian diffusion)}, \\quad \\dot{W}(x,t) = \\text{Space-time Gaussian white noise}"
    },
    {
      stepNumber: 3,
      title: "Incorporating Dark Matter Effects",
      icon: Layers,
      formula: "\\frac{\\partial u(x,t)}{\\partial t} = \\mathcal{L} u(x,t) + \\mathcal{F}(u(x,t), m_d) + \\sigma(u(x,t)) \\dot{W}(x,t)",
      description: "Dark matter of mass m_d couples to the quantum holographic substrate, introducing a characteristic perturbing term α(x,t, m_d) or effective potential V_eff(x,t; m_d).",
      highlight: "\\alpha(m_d) = " + params.coupling_alpha + ", \\quad m_d = " + params.injectedMass_eV.toExponential(2) + " \\text{ eV}"
    },
    {
      stepNumber: 4,
      title: "Observable Error Rate Function",
      icon: Target,
      formula: "e(x,t) = g(u(x,t), m_d) + \\eta(x,t)",
      description: "Function g maps the underlying continuous SPDE state u(x,t) and dark matter mass m_d to the discrete bit/phase error rates measured across the holographic memory cells during optical readout.",
      highlight: "g(u, m_d) = \\gamma_0 + \\kappa_1 |u(x,t)|^2 + \\kappa_2 \\Phi_{\\text{DM}}(x,t; m_d)"
    },
    {
      stepNumber: 5,
      title: "Inferring Dark Matter Mass via Bayesian Updating",
      icon: Calculator,
      formula: "P(m_d \\mid e(x,t)) \\propto P(e(x,t) \\mid m_d) \\cdot P(m_d)",
      description: "Bayesian likelihood P(e(x,t) | m_d) evaluates how well the observed holographic error map fits the predicted SPDE dynamics. The posterior distribution updates in real-time as write/read loops accumulate.",
      highlight: "P(m_d) = \\text{Log-Uniform prior}, \\quad \\mathcal{L}(m_d) = \\prod_{x,t} \\mathcal{N}\\left(e(x,t) \\mid g(u, m_d), \\sigma_\\eta^2\\right)"
    },
    {
      stepNumber: 6,
      title: "Active SPDE Model Implementation",
      icon: Activity,
      formula: "\\frac{\\partial u}{\\partial t} = D \\nabla^2 u - \\lambda u + \\alpha(m_d) \\cdot V_{\\text{eff}}(x,t) + \\beta \\dot{W}(x,t)",
      description: "Specific parameterized SPDE implemented in the simulator: D is the spatial diffusion constant, λ is the damping coefficient, α is the dark matter coupling, and β is stochastic noise intensity.",
      highlight: `D = ${params.diffusion_D}, \\quad \\lambda = ${params.damping_lambda}, \\quad \\alpha = ${params.coupling_alpha}, \\quad \\beta = ${params.noise_beta}`
    },
    {
      stepNumber: 7,
      title: "Full 4-Stage Estimation Process",
      icon: CheckCircle,
      formula: "\\text{Data Collection} \\to \\text{Model Fitting (MLE)} \\to \\text{Parameter Estimation} \\to \\text{Posterior Analysis}",
      description: "1. Collect space-time errors e(x,t) from Google Quantum Cloud write/read loops. 2. Fit SPDE parameters via MLE/MCMC. 3. Estimate λ, α, β and m_d. 4. Extract 68% and 95% Bayesian credible intervals.",
      highlight: `Inferred \\hat{m}_d = ${inferredMassDisplay}`
    }
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] overflow-hidden shadow-sm">
      <div 
        className="px-4 py-3 bg-[#16161a] border-b border-white/10 flex items-center justify-between cursor-pointer select-none hover:bg-[#1c1c22] transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide uppercase">
            SPDE Mathematical Formalism (7-Step Formulation)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30 uppercase">
            du/dt = D∇²u - λu + αV_eff + βẆ
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-[#111114]">
          {/* Step selection tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1 bg-[#0c0c0e] rounded-md border border-white/5">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = activeStep === s.stepNumber;
              return (
                <button
                  key={s.stepNumber}
                  onClick={() => setActiveStep(s.stepNumber)}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium transition flex flex-col items-center text-center gap-1 ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className={`w-3 h-3 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="font-mono uppercase text-[10px]">Step {s.stepNumber}</span>
                  </div>
                  <span className="text-[9px] leading-tight text-slate-400 line-clamp-1 uppercase">
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active step display */}
          {(() => {
            const current = steps.find(s => s.stepNumber === activeStep) || steps[5];
            return (
              <div className="p-4 rounded-md bg-[#16161a] border border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-mono text-[10px] font-bold border border-blue-800/60 uppercase">
                      Stage {current.stepNumber} of 7
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                      {current.title}
                    </h3>
                  </div>
                </div>

                {/* Primary Equation Box */}
                <div className="p-3 rounded bg-[#0c0c0e] border border-blue-500/30 font-mono text-center text-blue-300 text-xs sm:text-sm tracking-wide overflow-x-auto shadow-inner">
                  {current.formula}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {current.description}
                </p>

                {/* Live parameters binding */}
                <div className="px-3 py-2 rounded bg-[#0c0c0e] border border-white/5 flex items-center justify-between text-xs font-mono text-slate-300 flex-wrap gap-2">
                  <span className="text-slate-500 text-[10px] uppercase font-mono">Live Simulation Parameters:</span>
                  <span className="text-blue-400 font-semibold">{current.highlight}</span>
                </div>

                {/* Foundational Preprint Citation Card */}
                <div className="p-3 rounded bg-[#0c0c0e] border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                      Theoretical Foundation & Preprint
                    </span>
                    <p className="text-[11px] text-slate-300 font-serif leading-snug">
                      {AUTHOR_INFO.primaryPreprint.citation}
                    </p>
                  </div>
                  <a
                    href={AUTHOR_INFO.primaryPreprint.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-[10px] font-mono uppercase rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/40 transition flex items-center gap-1 flex-shrink-0 self-start sm:self-center"
                  >
                    <span>View on Zenodo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
