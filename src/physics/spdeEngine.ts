import { SPDEParameters, SPDESimulationState } from '../types';

export class SPDESolver2D {
  private size: number;
  private u: Float64Array; // Current state u(x,t)
  private uNext: Float64Array;
  private noiseField: Float64Array;
  private dmField: Float64Array;
  private gradientNorm: Float64Array;
  private time: number = 0;
  private stepCount: number = 0;

  constructor(size: number = 32) {
    this.size = size;
    const totalCells = size * size;
    this.u = new Float64Array(totalCells);
    this.uNext = new Float64Array(totalCells);
    this.noiseField = new Float64Array(totalCells);
    this.dmField = new Float64Array(totalCells);
    this.gradientNorm = new Float64Array(totalCells);

    this.initializeState();
  }

  public resize(newSize: number) {
    if (this.size === newSize) return;
    this.size = newSize;
    const totalCells = newSize * newSize;
    this.u = new Float64Array(totalCells);
    this.uNext = new Float64Array(totalCells);
    this.noiseField = new Float64Array(totalCells);
    this.dmField = new Float64Array(totalCells);
    this.gradientNorm = new Float64Array(totalCells);
    this.initializeState();
  }

  public initializeState() {
    this.time = 0;
    this.stepCount = 0;
    const N = this.size;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const idx = y * N + x;
        // Subtle initial ground-state quantum fluctuation
        const r2 = Math.pow(x - N / 2, 2) + Math.pow(y - N / 2, 2);
        this.u[idx] = 0.1 * Math.exp(-r2 / (2 * Math.pow(N / 4, 2))) + 0.05 * (Math.random() - 0.5);
        this.dmField[idx] = 0;
        this.noiseField[idx] = 0;
        this.gradientNorm[idx] = 0;
      }
    }
  }

  // Gaussian random sample generator (Box-Muller)
  private gaussianRandom(): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Integrates one time step dt using Euler-Maruyama with 5-point discrete Laplacian
  public step(params: SPDEParameters): void {
    const N = this.size;
    const dt = params.dt;
    const sqrtDt = Math.sqrt(dt);
    const D = params.diffusion_D;
    const lambda = params.damping_lambda;
    const alpha = params.candidateType === 'null_hypothesis' ? 0 : params.coupling_alpha;
    const beta = params.noise_beta;
    const dx = 1.0 / N;
    const dx2 = dx * dx;

    const t = this.time;
    // Compute dark matter effective potential field V_eff(x, y, t) based on candidate
    const kx = 2 * Math.PI * 1.5;
    const ky = 2 * Math.PI * 2.0;
    const omega = params.candidateType === 'null_hypothesis' 
      ? 0 
      : (Math.log10(Math.max(1e-25, params.injectedMass_eV)) + 25) * 0.8 + 1.2;

    for (let y = 0; y < N; y++) {
      const yNorm = y / N;
      for (let x = 0; x < N; x++) {
        const xNorm = x / N;
        const idx = y * N + x;

        // Space-time white noise: dW ~ N(0, dt) => dW / dt = gaussianRandom() / sqrt(dt)
        const dW = this.gaussianRandom();
        this.noiseField[idx] = dW;

        // Dark Matter Potential term \Phi_DM(x,t)
        let vDM = 0;
        if (params.candidateType === 'ultralight_axion' || params.candidateType === 'fuzzy_dark_matter') {
          // Coherent wave interference pattern
          vDM = Math.cos(kx * xNorm + ky * yNorm - omega * t) * (1.0 + 0.3 * Math.sin(0.5 * omega * t));
        } else if (params.candidateType === 'sterile_neutrino') {
          // Localized scattering packets
          const phase = (xNorm * 4.0 - omega * t * 0.5) % 1.0;
          vDM = Math.exp(-Math.pow(phase - 0.5, 2) / 0.05) * Math.sin(ky * yNorm * 3);
        } else if (params.candidateType === 'wimp') {
          // High-momentum stochastic impulse bursts
          const burstProb = 0.03;
          vDM = (Math.random() < burstProb ? (Math.random() - 0.5) * 3.0 : 0.0);
        } else if (params.candidateType === 'scalar_defect') {
          // Domain wall moving across grid
          const wallPos = (0.2 * t) % 1.2;
          vDM = Math.tanh((xNorm - wallPos) / 0.08);
        } else {
          vDM = 0;
        }

        this.dmField[idx] = vDM;

        // Discrete Laplacian \nabla^2 u with periodic boundary conditions
        const left = this.u[y * N + ((x - 1 + N) % N)];
        const right = this.u[y * N + ((x + 1) % N)];
        const up = this.u[((y - 1 + N) % N) * N + x];
        const down = this.u[((y + 1) % N) * N + x];
        const center = this.u[idx];

        const laplacian = (left + right + up + down - 4 * center) / dx2;

        // Discrete gradient norm for diagnostics
        const gradX = (right - left) / (2 * dx);
        const gradY = (down - up) / (2 * dx);
        this.gradientNorm[idx] = Math.sqrt(gradX * gradX + gradY * gradY);

        // SPDE Update: du/dt = D \nabla^2 u - \lambda u + \alpha \Phi_DM + \beta \dot{W}
        const drift = D * laplacian - lambda * center + alpha * vDM;
        const diffusionStochastic = beta * (dW / sqrtDt);

        // Euler-Maruyama step
        this.uNext[idx] = center + drift * dt + beta * dW * sqrtDt;

        // Numerical stability clamp
        if (isNaN(this.uNext[idx]) || !isFinite(this.uNext[idx])) {
          this.uNext[idx] = 0;
        } else if (Math.abs(this.uNext[idx]) > 10.0) {
          this.uNext[idx] = Math.sign(this.uNext[idx]) * 10.0;
        }
      }
    }

    // Swap buffers
    const temp = this.u;
    this.u = this.uNext;
    this.uNext = temp;

    this.time += dt;
    this.stepCount++;
  }

  // Returns current 2D grid matrix state snapshot
  public getStateSnapshot(): SPDESimulationState {
    const N = this.size;
    const uGrid: number[][] = [];
    const gradientNormGrid: number[][] = [];
    const stochasticNoiseGrid: number[][] = [];
    const dmFieldGrid: number[][] = [];

    let sumU = 0;
    let sumU2 = 0;

    for (let y = 0; y < N; y++) {
      const uRow: number[] = [];
      const gradRow: number[] = [];
      const noiseRow: number[] = [];
      const dmRow: number[] = [];

      for (let x = 0; x < N; x++) {
        const idx = y * N + x;
        const val = this.u[idx];
        uRow.push(val);
        gradRow.push(this.gradientNorm[idx]);
        noiseRow.push(this.noiseField[idx]);
        dmRow.push(this.dmField[idx]);

        sumU += val;
        sumU2 += val * val;
      }
      uGrid.push(uRow);
      gradientNormGrid.push(gradRow);
      stochasticNoiseGrid.push(noiseRow);
      dmFieldGrid.push(dmRow);
    }

    const total = N * N;
    const meanU = sumU / total;
    const variance = Math.max(0, sumU2 / total - meanU * meanU);
    const rmsFluctuation = Math.sqrt(variance);

    // Compute spatial Shannon entropy of the normalized energy density
    let entropy = 0;
    for (let i = 0; i < total; i++) {
      const p = (Math.pow(this.u[i], 2) + 1e-12) / (sumU2 + 1e-12 * total);
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    return {
      time: this.time,
      step: this.stepCount,
      uGrid,
      gradientNormGrid,
      stochasticNoiseGrid,
      dmFieldGrid,
      meanU,
      rmsFluctuation,
      spatialEntropy: entropy / Math.log2(total) // normalized [0, 1]
    };
  }

  // Computes the observable error rate matrix e(x,t) = g(u(x,t), m_d)
  public computeObservableErrorRate(
    params: SPDEParameters, 
    intrinsicBaseError: number = 0.012
  ): number[][] {
    const N = this.size;
    const errorGrid: number[][] = [];

    const massLog = params.candidateType === 'null_hypothesis' ? 0 : Math.log10(Math.max(1e-25, params.injectedMass_eV));
    const massFactor = params.candidateType === 'null_hypothesis' ? 0 : (0.02 + 0.005 * Math.abs(massLog % 5));

    for (let y = 0; y < N; y++) {
      const row: number[] = [];
      for (let x = 0; x < N; x++) {
        const idx = y * N + x;
        const uVal = this.u[idx];
        const dmVal = this.dmField[idx];

        // Theoretical g(u(x,t), m_d): non-linear coupling to state energy + dark matter perturbation + thermal floor
        // e(x,t) = e_0 + kappa_u * u^2 + kappa_dm * alpha * |Phi_DM| + noise
        const uPerturbation = 0.035 * (uVal * uVal);
        const dmPerturbation = params.candidateType === 'null_hypothesis' 
          ? 0 
          : params.coupling_alpha * massFactor * Math.abs(dmVal);
        
        const stochasticReadoutNoise = 0.003 * Math.abs(this.noiseField[idx]);

        const totalError = intrinsicBaseError + uPerturbation + dmPerturbation + stochasticReadoutNoise;
        row.push(Math.min(0.99, Math.max(0.0001, totalError)));
      }
      errorGrid.push(row);
    }
    return errorGrid;
  }
}
