export type DarkMatterCandidateType = 
  | 'ultralight_axion' 
  | 'sterile_neutrino' 
  | 'wimp' 
  | 'fuzzy_dark_matter' 
  | 'scalar_defect'
  | 'null_hypothesis';

export interface DarkMatterCandidate {
  id: DarkMatterCandidateType;
  name: string;
  massRangeDisplay: string;
  nominalMass_eV: number;
  description: string;
  couplingType: string;
  comptonFrequency_Hz: number;
  deBroglie_m: number;
  predictedAlpha: number;
}

export interface SPDEParameters {
  gridSize: number; // e.g., 32x32 or 48x48
  diffusion_D: number; // D \nabla^2 u
  damping_lambda: number; // \lambda u
  coupling_alpha: number; // \alpha(m_d)
  noise_beta: number; // \beta \dot{W}
  dt: number; // time step
  injectedMass_eV: number; // True injected dark matter mass
  candidateType: DarkMatterCandidateType;
  interactionPotential: 'harmonic' | 'yukawa' | 'wave_packet' | 'topological';
  dmVelocity_kms: number; // Virial halo speed (typ ~220 km/s)
  dmDensity_GeVcm3: number; // Local DM density (typ ~0.4 GeV/cm^3)
}

export interface HolographicStorageConfig {
  qubitRows: number;
  qubitCols: number;
  opticalWavelength_nm: number; // e.g. 780nm
  hologramDepth_layers: number;
  storageDuration_us: number; // in microseconds
  decoherenceT1_us: number;
  dephasingT2_us: number;
  temperature_mK: number; // milliKelvin
  readoutEfficiency: number;
  errorCorrectionCode: 'surface_code_17' | 'holographic_color_code' | 'bosonic_cat' | 'none';
}

export interface SPDESimulationState {
  time: number;
  step: number;
  uGrid: number[][]; // u(x,t) state field
  gradientNormGrid: number[][];
  stochasticNoiseGrid: number[][];
  dmFieldGrid: number[][];
  meanU: number;
  rmsFluctuation: number;
  spatialEntropy: number;
}

export interface HolographicReadbackResult {
  timestamp: number;
  iteration: number;
  writtenBits: number[][];
  readBits: number[][];
  errorMap: number[][]; // e(x,t) = g(u(x,t), m_d)
  meanErrorRate: number;
  maxErrorRate: number;
  quantumFidelity: number; // \mathcal{F} in [0, 1]
  syndromeViolations: number;
  detectedPhaseDrift_rad: number;
  executionTime_ms: number;
  cloudFunctionId: string;
}

export interface BayesianInferenceResult {
  timestamp: number;
  inferredMass_eV: number;
  inferredMass_log10eV: number;
  credibleInterval68: [number, number]; // [lower, upper] in eV
  credibleInterval95: [number, number]; // [lower, upper] in eV
  bestFitLambda: number;
  bestFitAlpha: number;
  bestFitBeta: number;
  logLikelihood: number;
  reducedChiSquared: number;
  bayesFactorVsNull: number; // B_{10} evidence for DM presence
  pValue: number;
  posteriorCurve: { mass_eV: number; log10Mass: number; density: number; prior: number; likelihood: number }[];
  mcmcSamples?: { step: number; mass_eV: number; logLikelihood: number }[];
  status: 'converged' | 'sampling' | 'unconstrained';
}

export interface QuantumCloudFunctionExecution {
  id: string;
  functionName: 'gcp-qcloud-holographic-write' | 'gcp-qcloud-storage-buffer' | 'gcp-qcloud-holographic-readback' | 'gcp-qcloud-spde-mle-inference' | 'gcp-qcloud-bayesian-mcmc';
  region: string;
  status: 'SUCCESS' | 'RUNNING' | 'QUEUED' | 'ERROR';
  latency_ms: number;
  timestamp: string;
  payloadSummary: string;
  metrics: {
    qpuUtilization: number;
    qubitActiveCount: number;
    decoherenceMitigationRate: number;
  };
}

export interface AgentResearchLog {
  id: string;
  timestamp: string;
  sender: 'system' | 'agent' | 'user';
  agentRole?: 'Hypothesis Theorist' | 'Cloud Orchestrator' | 'Bayesian Statistician' | 'SPDE Numerical Analyst';
  content: string;
  suggestedAction?: {
    label: string;
    actionType: 'run_mcmc' | 'sweep_frequencies' | 'optimize_storage' | 'inject_axion_burst' | 'generate_latex_paper';
    parameters?: Record<string, unknown>;
  };
  metricsHighlight?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  };
}

export interface LoopRunnerState {
  isRunning: boolean;
  isAutoPilotAgent: boolean;
  totalLoopsExecuted: number;
  targetLoops: number;
  loopIntervalMs: number;
  history: HolographicReadbackResult[];
}
