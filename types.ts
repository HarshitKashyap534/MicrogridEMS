// Input state for the Simulation
export interface SimulationState {
  vR: number;
  vY: number;
  vB: number;
  iR: number;
  iY: number;
  iB: number;
  vPV1: number;
  iPV1: number;
  vPV2: number;
  iPV2: number;
  vPV3: number;
  iPV3: number;
  vLoad1: number;
  vLoad2: number;
  vLoad3: number;
  enable: number;
}

// Result from the PV Controller logic
export interface SwitchConfig {
  sw: number[]; // Array of 18 switches (0 or 1)
  status: 'NORMAL' | 'BALANCING' | 'OVERLOAD' | 'OFFLINE';
  imbalance: number;
}

export enum Phase {
  R = 'R',
  Y = 'Y',
  B = 'B'
}
