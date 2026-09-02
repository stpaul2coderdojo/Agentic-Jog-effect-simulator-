import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  SPDEParameters, 
  HolographicStorageConfig, 
  SPDESimulationState, 
  HolographicReadbackResult, 
  BayesianInferenceResult, 
  QuantumCloudFunctionExecution, 
  AgentResearchLog,
  DarkMatterCandidateType
} from './types';
import { AUTHOR_INFO, DM_CANDIDATES } from './physics/constants';
import { SPDESolver2D } from './physics/spdeEngine';
import { QuantumHolographicStorageSimulator } from './physics/quantumHolographicStorage';
import { BayesianSPDEInferenceEngine } from './physics/bayesianInference';
import { Header } from './components/Header';
import { ModelEquationsPanel } from './components/ModelEquationsPanel';
import { SPDECanvas } from './components/SPDECanvas';
import { HolographicStorageView } from './components/HolographicStorageView';
import { BayesianPosteriorView } from './components/BayesianPosteriorView';
import { ParameterControls } from './components/ParameterControls';
import { QuantumCloudPipeline } from './components/QuantumCloudPipeline';
import { AgenticResearchConsole } from './components/AgenticResearchConsole';
import { ReportModal } from './components/ReportModal';

export default function App() {
  // SPDE Solver & Physics Engine Instances
  const spdeSolverRef = useRef<SPDESolver2D>(new SPDESolver2D(32));
  const holographicStorageRef = useRef<QuantumHolographicStorageSimulator>(new QuantumHolographicStorageSimulator({
    qubitRows: 16,
    qubitCols: 16
  }));
  const bayesianEngineRef = useRef<BayesianSPDEInferenceEngine>(new BayesianSPDEInferenceEngine());

  // Simulation Parameters State
  const [params, setParams] = useState<SPDEParameters>({
    gridSize: 32,
    diffusion_D: 0.018,
    damping_lambda: 0.45,
    coupling_alpha: 0.85,
    noise_beta: 0.18,
    dt: 0.05,
    injectedMass_eV: 1e-21,
    candidateType: 'ultralight_axion',
    interactionPotential: 'harmonic',
    dmVelocity_kms: 220.0,
    dmDensity_GeVcm3: 0.40
  });

  const [storageConfig, setStorageConfig] = useState<HolographicStorageConfig>({
    qubitRows: 16,
    qubitCols: 16,
    opticalWavelength_nm: 780.24,
    hologramDepth_layers: 4,
    storageDuration_us: 120.0,
    decoherenceT1_us: 450.0,
    dephasingT2_us: 180.0,
    temperature_mK: 15.0,
    readoutEfficiency: 0.985,
    errorCorrectionCode: 'surface_code_17'
  });

  // Real-time Visual Simulation State
  const [spdeState, setSpdeState] = useState<SPDESimulationState | null>(null);
  const [latestReadback, setLatestReadback] = useState<HolographicReadbackResult | null>(null);
  const [readbackHistory, setReadbackHistory] = useState<HolographicReadbackResult[]>([]);
  const [inferenceResult, setInferenceResult] = useState<BayesianInferenceResult | null>(null);

  // Cloud Functions Telemetry
  const [cloudExecutions, setCloudExecutions] = useState<QuantumCloudFunctionExecution[]>([]);

  // Simulation loop controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(false);
  const loopCountRef = useRef<number>(0);

  // Agent State
  const [agentLogs, setAgentLogs] = useState<AgentResearchLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      sender: 'system',
      content: `Google Quantum Cloud Functions initialized. Connected to QPU Cluster Sycamore-Holo-72.
Framework: Dr. Bheemaiah Anil Kumar's SPDE Dark Matter Inference Engine (Synergy Robotics Seattle).`
    },
    {
      id: 'init-2',
      timestamp: new Date().toISOString(),
      sender: 'agent',
      agentRole: 'Hypothesis Theorist',
      content: `Greetings Dr. Bheemaiah. I have mounted the continuous 2D SPDE solver ∂_t u = D∇²u - λu + α(m_d)Φ_DM + βẆ. 
We are currently simulating an Ultralight Axion candidate (m_d = 10⁻²¹ eV) coupled to our 16×16 quantum holographic optical lattice memory.
Click 'Run SPDE Loops' or 'Auto-Investigate' to begin recording write/readback error syndromes e(x,t).`
    }
  ]);
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [latexPaper, setLatexPaper] = useState<string>('');
  const [isGeneratingPaper, setIsGeneratingPaper] = useState<boolean>(false);

  // Format mass string helper
  const getFormattedMass = (eV: number): string => {
    if (params.candidateType === 'null_hypothesis' || eV <= 0) return '0 eV (Null)';
    if (eV < 1e-15) return `${(eV * 1e21).toFixed(2)} × 10⁻²¹ eV`;
    if (eV < 1e-6) return `${(eV * 1e12).toFixed(2)} × 10⁻¹² eV`;
    if (eV < 1e3) return `${eV.toFixed(2)} eV`;
    if (eV < 1e6) return `${(eV / 1e3).toFixed(2)} keV`;
    if (eV < 1e9) return `${(eV / 1e6).toFixed(2)} MeV`;
    return `${(eV / 1e9).toFixed(2)} GeV`;
  };

  // Perform a single complete Quantum Holographic Write -> Store -> Readback Loop
  const executeHolographicLoop = useCallback(() => {
    const solver = spdeSolverRef.current;
    const storage = holographicStorageRef.current;
    const bayes = bayesianEngineRef.current;

    // Step SPDE several sub-steps to simulate continuous time evolution
    for (let i = 0; i < 4; i++) {
      solver.step(params);
    }

    const state = solver.getStateSnapshot();
    setSpdeState(state);

    // Compute observable error rate field e(x,t) = g(u(x,t), m_d)
    const errorGrid = solver.computeObservableErrorRate(params);

    // Generate holographic pattern and execute quantum memory readback
    const writtenPattern = storage.generateHolographicPattern('superposition_random');
    const result = storage.executeLoop(writtenPattern, errorGrid, params);

    setLatestReadback(result);
    setReadbackHistory((prev) => {
      const updated = [...prev.slice(-49), result];
      // Trigger Bayesian Parameter Update
      const infer = bayes.inferDarkMatterMass(updated, params);
      setInferenceResult(infer);
      return updated;
    });

    loopCountRef.current++;

    // Record simulated Google Quantum Cloud Function executions
    const newExecutions: QuantumCloudFunctionExecution[] = [
      {
        id: `exec-w-${Date.now()}`,
        functionName: 'gcp-qcloud-holographic-write',
        region: 'us-west1',
        status: 'SUCCESS',
        latency_ms: Math.floor(11 + Math.random() * 6),
        timestamp: new Date().toISOString(),
        payloadSummary: `Wrote ${storageConfig.qubitRows * storageConfig.qubitCols} qubits (Optical λ=${storageConfig.opticalWavelength_nm}nm)`,
        metrics: { qpuUtilization: 0.88, qubitActiveCount: 256, decoherenceMitigationRate: 0.94 }
      },
      {
        id: `exec-s-${Date.now()}`,
        functionName: 'gcp-qcloud-storage-buffer',
        region: 'us-west1',
        status: 'SUCCESS',
        latency_ms: Math.floor(15 + Math.random() * 8),
        timestamp: new Date().toISOString(),
        payloadSummary: `Stored for ${storageConfig.storageDuration_us}µs @ ${storageConfig.temperature_mK}mK`,
        metrics: { qpuUtilization: 0.92, qubitActiveCount: 256, decoherenceMitigationRate: 0.91 }
      },
      {
        id: `exec-r-${Date.now()}`,
        functionName: 'gcp-qcloud-holographic-readback',
        region: 'us-west1',
        status: 'SUCCESS',
        latency_ms: Math.floor(13 + Math.random() * 7),
        timestamp: new Date().toISOString(),
        payloadSummary: `Tomography complete. QBER=${((result.meanErrorRate) * 100).toFixed(2)}%, Fidelity=${((result.quantumFidelity) * 100).toFixed(2)}%`,
        metrics: { qpuUtilization: 0.95, qubitActiveCount: 256, decoherenceMitigationRate: 0.96 }
      }
    ];

    setCloudExecutions((prev) => [...prev.slice(-15), ...newExecutions]);
  }, [params, storageConfig]);

  // Main animation frame loop
  useEffect(() => {
    let animFrameId: number;
    let lastLoopTime = 0;

    const animate = (currentTime: number) => {
      if (isRunning) {
        // Step SPDE for continuous fluid visualization
        spdeSolverRef.current.step(params);
        setSpdeState(spdeSolverRef.current.getStateSnapshot());

        // Trigger holographic write/read loop every ~600ms
        if (currentTime - lastLoopTime > 650) {
          lastLoopTime = currentTime;
          executeHolographicLoop();
        }
      }
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [isRunning, executeHolographicLoop, params]);

  // Initial boot simulation state
  useEffect(() => {
    spdeSolverRef.current.initializeState();
    setSpdeState(spdeSolverRef.current.getStateSnapshot());
    executeHolographicLoop();
  }, []);

  // Update SPDE parameters callback
  const handleUpdateParams = (newParams: Partial<SPDEParameters>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      return updated;
    });
  };

  // Update storage hardware configuration callback
  const handleUpdateStorageConfig = (newConfig: Partial<HolographicStorageConfig>) => {
    setStorageConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      holographicStorageRef.current.updateConfig(updated);
      return updated;
    });
  };

  // Dark matter candidate selector
  const handleSelectCandidate = (candidateType: DarkMatterCandidateType) => {
    const cand = DM_CANDIDATES.find(c => c.id === candidateType);
    if (!cand) return;

    setParams((prev) => ({
      ...prev,
      candidateType,
      injectedMass_eV: cand.nominalMass_eV,
      coupling_alpha: cand.predictedAlpha
    }));

    setAgentLogs((prev) => [
      ...prev,
      {
        id: `cand-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        agentRole: 'Hypothesis Theorist',
        content: `Target Dark Matter candidate calibrated to: ${cand.name} (${cand.massRangeDisplay}).
Nominal mass: ${cand.nominalMass_eV.toExponential(2)} eV. Coupling α = ${cand.predictedAlpha}.
SPDE field potential modulated for ${cand.couplingType}. Resetting Bayesian prior baseline.`
      }
    ]);
  };

  // Reset simulation
  const handleReset = () => {
    spdeSolverRef.current.initializeState();
    setSpdeState(spdeSolverRef.current.getStateSnapshot());
    setReadbackHistory([]);
    setLatestReadback(null);
    setInferenceResult(null);
    setCloudExecutions([]);
    loopCountRef.current = 0;

    setAgentLogs((prev) => [
      ...prev,
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: 'system',
        content: `SPDE state field u(x,t) and holographic observation history reset to ground state.`
      }
    ]);
  };

  // Agent Chat handler
  const handleSendAgentMessage = async (msg: string) => {
    const userLog: AgentResearchLog = {
      id: `user-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: 'user',
      content: msg
    };

    setAgentLogs((prev) => [...prev, userLog]);
    setIsAgentThinking(true);

    try {
      const cand = DM_CANDIDATES.find(c => c.id === params.candidateType);
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          context: {
            candidateName: cand?.name,
            injectedMassDisplay: getFormattedMass(params.injectedMass_eV),
            inferredMassDisplay: getFormattedMass(inferenceResult?.inferredMass_eV || 0),
            diffusion_D: params.diffusion_D,
            damping_lambda: params.damping_lambda,
            coupling_alpha: params.coupling_alpha,
            noise_beta: params.noise_beta,
            meanErrorRate: latestReadback?.meanErrorRate,
            quantumFidelity: latestReadback?.quantumFidelity,
            bayesFactor: (inferenceResult?.bayesFactorVsNull || 1).toFixed(2)
          }
        })
      });

      const data = await res.json();
      const agentReply: AgentResearchLog = {
        id: `agent-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: 'agent',
        agentRole: 'SPDE Numerical Analyst',
        content: data.reply || 'Analysis completed.'
      };
      setAgentLogs((prev) => [...prev, agentReply]);
    } catch (err: any) {
      setAgentLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sender: 'agent',
          content: `SPDE Diagnostic: Under Dr. Bheemaiah Anil Kumar's model, the observed error rate e(x,t) indicates non-linear coupling to the state variable u(x,t). Recommended next step: run an automated 10-loop tomography sweep.`
        }
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Autonomous Auto-Investigate trigger
  const handleAutoInvestigate = async () => {
    setIsAgentThinking(true);
    try {
      const cand = DM_CANDIDATES.find(c => c.id === params.candidateType);
      const res = await fetch('/api/agent/auto-investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            candidateName: cand?.name,
            injectedMassDisplay: getFormattedMass(params.injectedMass_eV),
            inferredMassDisplay: getFormattedMass(inferenceResult?.inferredMass_eV || 0),
            diffusion_D: params.diffusion_D,
            damping_lambda: params.damping_lambda,
            coupling_alpha: params.coupling_alpha,
            noise_beta: params.noise_beta,
            meanErrorRate: latestReadback?.meanErrorRate,
            quantumFidelity: latestReadback?.quantumFidelity,
            bayesFactor: (inferenceResult?.bayesFactorVsNull || 1).toFixed(2)
          }
        })
      });

      const data = await res.json();
      setAgentLogs((prev) => [
        ...prev,
        {
          id: `auto-${Date.now()}`,
          timestamp: new Date().toISOString(),
          sender: 'agent',
          agentRole: 'Bayesian Statistician',
          content: data.analysis || 'Autonomous investigation concluded.'
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Generate Academic LaTeX paper
  const handleGenerateReport = async () => {
    setIsGeneratingPaper(true);
    try {
      const cand = DM_CANDIDATES.find(c => c.id === params.candidateType);
      const res = await fetch('/api/agent/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            candidateName: cand?.name,
            injectedMassDisplay: getFormattedMass(params.injectedMass_eV),
            inferredMassDisplay: getFormattedMass(inferenceResult?.inferredMass_eV || 0),
            diffusion_D: params.diffusion_D,
            damping_lambda: params.damping_lambda,
            coupling_alpha: params.coupling_alpha,
            noise_beta: params.noise_beta,
            meanErrorRate: latestReadback?.meanErrorRate,
            quantumFidelity: latestReadback?.quantumFidelity,
            bayesFactor: (inferenceResult?.bayesFactorVsNull || 1).toFixed(2)
          }
        })
      });

      const data = await res.json();
      setLatexPaper(data.latex || '');
      setIsReportOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#e2e8f0] flex flex-col selection:bg-blue-600/30 selection:text-blue-200 font-sans">
      {/* Top Header */}
      <Header
        isRunning={isRunning}
        isAutoPilot={isAutoPilot}
        onToggleRun={() => setIsRunning(!isRunning)}
        onToggleAutoPilot={() => setIsAutoPilot(!isAutoPilot)}
        onReset={handleReset}
        onSingleStep={executeHolographicLoop}
        onOpenReport={handleGenerateReport}
        totalLoops={readbackHistory.length}
        averageFidelity={latestReadback?.quantumFidelity || 0.99}
        bayesFactor={inferenceResult?.bayesFactorVsNull || 1.0}
      />

      {/* Main Scientific Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* SPDE Formalism & Equation Navigator Panel */}
        <ModelEquationsPanel
          params={params}
          inferredMassDisplay={getFormattedMass(inferenceResult?.inferredMass_eV || 0)}
        />

        {/* Core Twin Visualizers: SPDE State Field & Holographic Storage Array */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Continuous SPDE Field Dynamics */}
          <SPDECanvas
            state={spdeState}
            params={params}
          />

          {/* Right: Quantum Holographic Storage Array & Error Map */}
          <HolographicStorageView
            latestResult={latestReadback}
            config={storageConfig}
            onUpdateConfig={handleUpdateStorageConfig}
            onTriggerWriteReadLoop={executeHolographicLoop}
            isRunning={isRunning}
          />
        </div>

        {/* Bayesian Posterior Distribution & Dark Matter Mass Inference Curve */}
        <BayesianPosteriorView
          inference={inferenceResult}
          params={params}
          totalLoops={readbackHistory.length}
        />

        {/* Simulation Parameter Controls & Dark Matter Candidate Selector */}
        <ParameterControls
          params={params}
          storageConfig={storageConfig}
          onUpdateParams={handleUpdateParams}
          onUpdateStorageConfig={handleUpdateStorageConfig}
          onSelectCandidate={handleSelectCandidate}
        />

        {/* Google Quantum Cloud Functions Execution Pipeline & Telemetry */}
        <QuantumCloudPipeline
          executions={cloudExecutions}
          activeQpu="Sycamore-Holo-72 (Google Quantum West)"
          clusterStatus="ONLINE & SYNCHRONIZED"
        />

        {/* Antigravity AI Research Copilot & Agentic Thought Stream */}
        <AgenticResearchConsole
          logs={agentLogs}
          onSendMessage={handleSendAgentMessage}
          onTriggerAutoInvestigate={handleAutoInvestigate}
          isAgentThinking={isAgentThinking}
          params={params}
          inference={inferenceResult}
          latestReadback={latestReadback}
        />
      </main>

      {/* Footer Attribution Banner */}
      <footer className="border-t border-white/10 bg-[#0c0c0e] py-6 px-4 sm:px-6 text-center text-xs text-slate-500 space-y-1 mt-8">
        <p className="font-semibold text-slate-300 uppercase tracking-wide">
          {AUTHOR_INFO.researchTitle}
        </p>
        <p className="text-slate-400">
          Developed by <span className="text-blue-400 font-medium">{AUTHOR_INFO.name}</span> • <span className="text-slate-300 font-medium">{AUTHOR_INFO.affiliation}</span>
        </p>
        <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          Powered by Antigravity Agent & Google Quantum Cloud Functions Emulator • Gemini 3.7 Flash Backend
        </p>
      </footer>

      {/* Academic Paper Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        latexContent={latexPaper}
        isGenerating={isGeneratingPaper}
        onGenerateReport={handleGenerateReport}
        params={params}
        inference={inferenceResult}
        latestReadback={latestReadback}
      />
    </div>
  );
}
