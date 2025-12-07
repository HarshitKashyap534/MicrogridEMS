import { SimulationState, SwitchConfig } from '../types';

/**
 * TypeScript port of the Python PVController class.
 * Logic is identical to the provided algorithm.
 */
export class PVController {
  // Controller parameters
  private V_GRID_MIN = 11.0;
  private V_GRID_MAX = 13.5;
  private V_PV_MIN = 12.5;
  private I_PHASE_MAX = 3.5;
  private IMBALANCE_THRESHOLD = 0.8;
  private POWER_MIN = 2.0;

  public run(inputs: SimulationState): SwitchConfig {
    const {
      vR, vY, vB,
      iR, iY, iB,
      vPV1, iPV1,
      vPV2, iPV2,
      vPV3, iPV3,
      vLoad1, vLoad2, vLoad3,
      enable
    } = inputs;

    // 0-indexed array, but logic uses 1-18. We will return 0-17 index to UI.
    // Creating size 19 to match python 1-based indexing logic internally
    const sw = new Array(19).fill(0);

    if (enable < 0.5) {
        return { sw: sw.slice(1), status: 'OFFLINE', imbalance: 0 };
    }

    // --- MEASUREMENTS ---
    const iR_abs = Math.abs(iR);
    const iY_abs = Math.abs(iY);
    const iB_abs = Math.abs(iB);

    // PV Power
    const pPV1 = vPV1 * Math.abs(iPV1);
    const pPV2 = vPV2 * Math.abs(iPV2);
    const pPV3 = vPV3 * Math.abs(iPV3);

    // --- VOLTAGE VALIDATION ---
    const grid_voltage_ok = (
      (vR > this.V_GRID_MIN && vR < this.V_GRID_MAX) &&
      (vY > this.V_GRID_MIN && vY < this.V_GRID_MAX) &&
      (vB > this.V_GRID_MIN && vB < this.V_GRID_MAX)
    );

    const pv1_ready = (vPV1 > this.V_PV_MIN) && (pPV1 > this.POWER_MIN);
    const pv2_ready = (vPV2 > this.V_PV_MIN) && (pPV2 > this.POWER_MIN);
    const pv3_ready = (vPV3 > this.V_PV_MIN) && (pPV3 > this.POWER_MIN);

    if (!grid_voltage_ok) {
        return { sw: sw.slice(1), status: 'OFFLINE', imbalance: 0 };
    }

    // --- OVERCURRENT PROTECTION ---
    const phase_overload = [
      iR_abs > this.I_PHASE_MAX,
      iY_abs > this.I_PHASE_MAX,
      iB_abs > this.I_PHASE_MAX
    ];

    // --- LOAD ANALYSIS ---
    const phase_currents = [iR_abs, iY_abs, iB_abs];
    const i_max = Math.max(...phase_currents);
    const i_min = Math.min(...phase_currents);
    const current_imbalance = i_max - i_min;
    const needs_balancing = (current_imbalance > this.IMBALANCE_THRESHOLD);

    // Sort indices ascending
    const phase_sorted_idx = phase_currents
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => a.val - b.val)
      .map(item => item.idx);
    
    // --- GRID TO LOAD BASE CONNECTION ---
    sw[1] = 1; // R enable
    sw[2] = 1; // Y enable
    sw[3] = 1; // B enable

    if (!needs_balancing) {
        // NORMAL MODE
        sw[6] = 1; sw[7] = 0; sw[8] = 0;   // Load 1 -> R
        sw[9] = 0; sw[10] = 1; sw[11] = 0; // Load 2 -> Y
        sw[12] = 1; sw[17] = 0;            // Load 3 -> B (Logic: 12=1 is Normal/B for Load3 in normal mode map?) 
        // NOTE: In python code: sw[12]=1, sw[17]=0 is used for Load3->Phase B in Normal mode.
        // Wait, Python says: sw12/sw17 => Load3 R/B_or_Y.
        // Python Normal: sw[12]=1, sw[17]=0. 
    } else {
        // BALANCING MODE
        
        // Load 1 -> Least Loaded
        const least = phase_sorted_idx[0];
        if (least === 0) { sw[6]=1; sw[7]=0; sw[8]=0; }
        else if (least === 1) { sw[6]=0; sw[7]=1; sw[8]=0; }
        else { sw[6]=0; sw[7]=0; sw[8]=1; }

        // Load 2 -> Second Least
        const second = phase_sorted_idx[1];
        if (second === 0) { sw[9]=1; sw[10]=0; sw[11]=0; }
        else if (second === 1) { sw[9]=0; sw[10]=1; sw[11]=0; }
        else { sw[9]=0; sw[10]=0; sw[11]=1; }

        // Load 3 -> Most Loaded
        const most = phase_sorted_idx[2];
        if (most === 0) { sw[12]=1; sw[17]=0; } // Phase R
        else { sw[12]=0; sw[17]=1; } // Phase B/Y
    }

    // --- PV INJECTION CONTROL ---
    if (!needs_balancing) {
        // Normal Mode: Inject to same phase
        if (pv1_ready && sw[6] === 1 && !phase_overload[0]) sw[4] = 1;
        if (pv2_ready && sw[10] === 1 && !phase_overload[1]) sw[5] = 1;
        if (pv3_ready && sw[12] === 1 && !phase_overload[2]) sw[14] = 1;
    } else {
        // Balancing Mode
        const pv_powers = [pPV1, pPV2, pPV3];
        const pv_ready_flags = [pv1_ready, pv2_ready, pv3_ready];
        
        // Sort PVs by power descending
        const pv_sorted_idx = pv_powers
          .map((val, idx) => ({ val, idx }))
          .sort((a, b) => b.val - a.val)
          .map(item => item.idx);

        for (let i = 0; i < 3; i++) {
            const pv_idx = pv_sorted_idx[i];
            const phase_idx = phase_sorted_idx[2 - i]; // Reverse order mapping

            if (pv_ready_flags[pv_idx] && !phase_overload[phase_idx]) {
                if (pv_idx === 0) { // PV1
                    if (phase_idx === 0) sw[4] = 1;
                    else if (phase_idx === 1) sw[5] = 1;
                    else sw[14] = 1;
                } else if (pv_idx === 1) { // PV2
                    if (phase_idx === 0) sw[4] = 1;
                    else if (phase_idx === 1) sw[5] = 1;
                    else sw[14] = 1;
                } else if (pv_idx === 2) { // PV3
                    if (phase_idx === 0) sw[15] = 1;
                    else if (phase_idx === 1) sw[16] = 1;
                    else sw[14] = 1;
                }
            }
        }
    }

    // --- AUX & EMERGENCY ---
    sw[13] = 1;
    sw[18] = 1;

    if (phase_overload[0]) { sw[4] = 0; sw[15] = 0; }
    if (phase_overload[1]) { sw[5] = 0; sw[16] = 0; }
    if (phase_overload[2]) { sw[14] = 0; }

    let status: SwitchConfig['status'] = needs_balancing ? 'BALANCING' : 'NORMAL';
    if (phase_overload.some(o => o)) status = 'OVERLOAD';

    return {
        sw: sw.slice(1), // Return 0-17 index (sw1..sw18)
        status,
        imbalance: current_imbalance
    };
  }
}

export const pvController = new PVController();