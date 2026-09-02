import { DarkMatterCandidate } from '../types';

export const H_BAR_EV_S = 6.582119569e-16; // eV * s
export const SPEED_OF_LIGHT_M_S = 299792458; // m/s
export const PLANCK_H_JS = 6.62607015e-34; // J * s
export const EV_TO_JOULE = 1.602176634e-19; // J / eV

export const AUTHOR_INFO = {
  name: "Dr. Bheemaiah Anil Kumar",
  affiliation: "Synergy Robotics Seattle",
  title: "Principal Quantum AI Scientist & SPDE Theorist",
  contact: "bheemaiah@alumni.iitm.ac.in",
  researchTitle: "Stochastic Partial Differential Equation (SPDE) Framework for Dark Matter Mass Inference via Quantum Holographic Storage Error Signatures",
  version: "v3.8.4-QuantumCloud"
};

export const DM_CANDIDATES: DarkMatterCandidate[] = [
  {
    id: 'ultralight_axion',
    name: 'Ultralight Axion (Fuzzy DM)',
    massRangeDisplay: '10⁻²² to 10⁻¹⁹ eV',
    nominalMass_eV: 1e-21,
    description: 'Extremely light bosonic scalar field with galactic-scale de Broglie wavelength. Produces macroscopic coherent wave interference in quantum holographic registers.',
    couplingType: 'Coupled to quantum phase drift via topological axion-photon interaction term',
    comptonFrequency_Hz: (1e-21) / H_BAR_EV_S, // ~1.5e-6 Hz to kHz
    deBroglie_m: 1e18, // ~0.1 to 1 kpc macroscopic wave
    predictedAlpha: 0.85
  },
  {
    id: 'fuzzy_dark_matter',
    name: 'Wave Dark Matter (Axion-Like Particle)',
    massRangeDisplay: '10⁻¹⁵ to 10⁻⁹ eV',
    nominalMass_eV: 1e-12,
    description: 'High-frequency oscillating scalar DM producing coherent modulation of atomic & optical lattice transition frequencies in holographic memory.',
    couplingType: 'Dilaton / scalar interaction oscillating at Compton frequency',
    comptonFrequency_Hz: (1e-12) / H_BAR_EV_S, // ~1.5 kHz
    deBroglie_m: 1.6e3,
    predictedAlpha: 0.72
  },
  {
    id: 'sterile_neutrino',
    name: 'Sterile Neutrino (Warm DM)',
    massRangeDisplay: '1 to 50 keV',
    nominalMass_eV: 7000, // 7 keV
    description: 'Fermionic warm dark matter candidate exhibiting radiative decay signatures and spatial scattering stochasticity in solid-state quantum memory.',
    couplingType: 'Weak Yukawa-type momentum transfer & localized spin-flip depolarization',
    comptonFrequency_Hz: 7000 / H_BAR_EV_S,
    deBroglie_m: 0.23,
    predictedAlpha: 0.45
  },
  {
    id: 'wimp',
    name: 'WIMP (Weakly Interacting Massive Particle)',
    massRangeDisplay: '10 to 500 GeV',
    nominalMass_eV: 100e9, // 100 GeV
    description: 'Heavy particle dark matter inducing nuclear recoils and localized thermal phonon bursts within cryogenic holographic storage substrates.',
    couplingType: 'Elastic nuclear scattering & localized phonon shockwave diffusion',
    comptonFrequency_Hz: 100e9 / H_BAR_EV_S,
    deBroglie_m: 1.6e-17,
    predictedAlpha: 0.35
  },
  {
    id: 'scalar_defect',
    name: 'Topological Domain Wall / Scalar Defect',
    massRangeDisplay: 'Transient / Solitonic Wake',
    nominalMass_eV: 5e-18,
    description: 'Passing topological domain wall causing transient gradient jumps in the SPDE state u(x,t) across the holographic array.',
    couplingType: 'Non-linear spatial gradient step function',
    comptonFrequency_Hz: 5e-18 / H_BAR_EV_S,
    deBroglie_m: 3.2e8,
    predictedAlpha: 0.95
  },
  {
    id: 'null_hypothesis',
    name: 'Null Hypothesis (Pure Decoherence)',
    massRangeDisplay: 'm_d = 0 (Standard Noise)',
    nominalMass_eV: 0,
    description: 'Zero dark matter interaction. Observable errors stem exclusively from standard thermal Johnson-Nyquist noise, two-level system (TLS) defects, and standard dephasing.',
    couplingType: 'None (alpha = 0)',
    comptonFrequency_Hz: 0,
    deBroglie_m: Infinity,
    predictedAlpha: 0.0
  }
];
