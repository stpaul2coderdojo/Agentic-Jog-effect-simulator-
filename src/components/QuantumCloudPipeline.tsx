import React from 'react';
import { QuantumCloudFunctionExecution } from '../types';
import { CloudLightning, Server, CheckCircle2, Clock, Cpu, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

interface QuantumCloudPipelineProps {
  executions: QuantumCloudFunctionExecution[];
  activeQpu: string;
  clusterStatus: string;
}

export const QuantumCloudPipeline: React.FC<QuantumCloudPipelineProps> = ({
  executions,
  activeQpu,
  clusterStatus
}) => {
  const functionSteps = [
    { name: 'gcp-qcloud-holographic-write', label: '1. Holographic Write', icon: Cpu, desc: 'Optical phase matrix state encoding' },
    { name: 'gcp-qcloud-storage-buffer', label: '2. SPDE Storage Buffer', icon: Activity, desc: 'Decoherence & DM wave interaction' },
    { name: 'gcp-qcloud-holographic-readback', label: '3. Readout Tomography', icon: ShieldCheck, desc: 'Syndrome check & QBER matrix e(x,t)' },
    { name: 'gcp-qcloud-spde-mle-inference', label: '4. SPDE Parameter Fit', icon: Server, desc: 'MLE optimization for λ, α, β' },
    { name: 'gcp-qcloud-bayesian-mcmc', label: '5. Bayesian MCMC', icon: CloudLightning, desc: 'P(m_d | e) posterior estimation' },
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-[#111114] p-4 flex flex-col gap-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Google Quantum Cloud Functions Pipeline</span>
              <span className="text-[10px] font-mono text-blue-400 font-normal px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-500/30 uppercase">
                {clusterStatus}
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Distributed serverless micro-functions executing quantum holographic storage and Bayesian SPDE loops
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500 uppercase text-[10px]">QPU Backend:</span>
          <span className="px-2 py-0.5 rounded bg-[#0c0c0e] text-blue-400 border border-white/5 text-[11px]">
            {activeQpu}
          </span>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
        {functionSteps.map((step, idx) => {
          const Icon = step.icon;
          const latestExec = executions.find(e => e.functionName === step.name);
          const isHealthy = latestExec?.status !== 'ERROR';

          return (
            <div
              key={step.name}
              className="p-2.5 rounded bg-[#16161a] border border-white/5 flex flex-col justify-between gap-1.5 relative group hover:border-blue-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      {step.label}
                    </span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {step.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-white/5">
                <span className="uppercase">Latency</span>
                <span className="text-blue-400 font-bold">{latestExec?.latency_ms || Math.floor(12 + idx * 4)} ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloud Function Event Log Stream */}
      <div className="rounded bg-[#0c0c0e] border border-white/10 p-2.5 max-h-[140px] overflow-y-auto space-y-1 text-xs font-mono">
        <div className="text-[9px] uppercase text-slate-500 font-semibold tracking-widest mb-1 flex items-center justify-between">
          <span>Recent Quantum Cloud Telemetry Stream</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Ingress
          </span>
        </div>

        {executions.length > 0 ? (
          executions.slice(-6).reverse().map((exec) => (
            <div key={exec.id} className="flex items-center justify-between text-[11px] text-slate-300 py-0.5 border-b border-white/5 last:border-none">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-blue-400 font-semibold">{exec.functionName}</span>
                <span className="text-slate-500 text-[10px]">{exec.payloadSummary}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-shrink-0">
                <span>{exec.latency_ms}ms</span>
                <span className="text-slate-600">{exec.timestamp.split('T')[1]?.substring(0, 8) || ''}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-slate-500 text-center py-2 text-[11px] uppercase">
            Executing Google Quantum Cloud function dispatch...
          </div>
        )}
      </div>
    </div>
  );
};
