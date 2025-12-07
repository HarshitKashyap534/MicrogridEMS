import React, { useState, useEffect } from 'react';
import { SimulationState, SwitchConfig } from '../types';
import { pvController } from '../services/pvController';
import CircuitDiagram from './CircuitDiagram';
import { RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

const SimulationPanel: React.FC = () => {
  // Initial Mock Data
  const [inputs, setInputs] = useState<SimulationState>({
    vR: 12.0, vY: 12.0, vB: 12.0,
    iR: 1.5, iY: 1.5, iB: 1.5,
    vPV1: 13.0, iPV1: 1.0,
    vPV2: 13.0, iPV2: 0.5,
    vPV3: 13.0, iPV3: 0.0,
    vLoad1: 12.0, vLoad2: 12.0, vLoad3: 12.0,
    enable: 1
  });

  const [result, setResult] = useState<SwitchConfig>({ sw: [], status: 'NORMAL', imbalance: 0 });
  const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false);

  useEffect(() => {
    // Run Logic whenever inputs change
    const res = pvController.run(inputs);
    setResult(res);
  }, [inputs]);

  const handleChange = (key: keyof SimulationState, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setInputs(prev => ({ ...prev, [key]: num }));
    }
  };

  const InputRow = ({ label, id, val, unit, color = "text-gray-300" }: any) => (
    <div className="flex items-center justify-between py-1 border-b border-[#222]">
      <label className={`text-xs font-mono ${color} truncate mr-2`}>{label}</label>
      <div className="flex items-center shrink-0">
        <input 
          type="number" 
          value={val}
          onChange={(e) => handleChange(id, e.target.value)}
          step="0.1"
          className="bg-[#000] border border-[#333] text-right text-white font-mono text-xs w-14 px-1 focus:border-blue-500 outline-none"
        />
        <span className="text-[10px] text-gray-500 w-5 text-center">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden">
      {/* LEFT: Parameters Panel */}
      <div className="w-full lg:w-80 bg-[#111] border-r border-[#333] flex flex-col h-[40%] lg:h-full shrink-0 border-b lg:border-b-0 overflow-hidden">
        <div className="industrial-header flex justify-between items-center shrink-0">
           <span>Signal Injection</span>
           <div className="flex gap-1">
             <button className="p-1 hover:bg-[#333] text-gray-400" title="Reset"><RotateCcw size={12}/></button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
            
            {/* GRID SECTION */}
            <div className="industrial-panel p-2">
                <div className="text-[10px] uppercase text-[#666] font-bold mb-2 border-b border-[#333] pb-1">Grid Source (3Φ)</div>
                <InputRow label="PHASE R VOLT" id="vR" val={inputs.vR} unit="V" color="text-scada-phaseR" />
                <InputRow label="PHASE R CURR" id="iR" val={inputs.iR} unit="A" color="text-scada-phaseR" />
                <InputRow label="PHASE Y VOLT" id="vY" val={inputs.vY} unit="V" color="text-scada-phaseY" />
                <InputRow label="PHASE Y CURR" id="iY" val={inputs.iY} unit="A" color="text-scada-phaseY" />
                <InputRow label="PHASE B VOLT" id="vB" val={inputs.vB} unit="V" color="text-scada-phaseB" />
                <InputRow label="PHASE B CURR" id="iB" val={inputs.iB} unit="A" color="text-scada-phaseB" />
            </div>

            {/* PV SECTION */}
            <div className="industrial-panel p-2">
                <div className="text-[10px] uppercase text-[#666] font-bold mb-2 border-b border-[#333] pb-1">Renewable Injection (PV)</div>
                <InputRow label="PV1 OUTPUT V" id="vPV1" val={inputs.vPV1} unit="V" color="text-yellow-500" />
                <InputRow label="PV1 CURRENT" id="iPV1" val={inputs.iPV1} unit="A" color="text-yellow-500" />
                <div className="h-2"></div>
                <InputRow label="PV2 OUTPUT V" id="vPV2" val={inputs.vPV2} unit="V" color="text-yellow-500" />
                <InputRow label="PV2 CURRENT" id="iPV2" val={inputs.iPV2} unit="A" color="text-yellow-500" />
                <div className="h-2"></div>
                <InputRow label="PV3 OUTPUT V" id="vPV3" val={inputs.vPV3} unit="V" color="text-yellow-500" />
                <InputRow label="PV3 CURRENT" id="iPV3" val={inputs.iPV3} unit="A" color="text-yellow-500" />
            </div>

            {/* LOAD SECTION */}
            <div className="industrial-panel p-2">
                <div className="text-[10px] uppercase text-[#666] font-bold mb-2 border-b border-[#333] pb-1">Load Demand</div>
                <InputRow label="LOAD 1 REQ" id="vLoad1" val={inputs.vLoad1} unit="V" />
                <InputRow label="LOAD 2 REQ" id="vLoad2" val={inputs.vLoad2} unit="V" />
                <InputRow label="LOAD 3 REQ" id="vLoad3" val={inputs.vLoad3} unit="V" />
            </div>
            
             <div className="industrial-panel p-2">
                <div className="text-[10px] uppercase text-[#666] font-bold mb-2 border-b border-[#333] pb-1">System Control</div>
                <div className="flex items-center justify-between py-2">
                   <span className="text-xs text-gray-400">MAIN BREAKER ENABLE</span>
                   <button 
                     onClick={() => setInputs(p => ({...p, enable: p.enable ? 0 : 1}))}
                     className={`w-8 h-4 ${inputs.enable ? 'bg-green-600' : 'bg-red-900'} rounded-sm border border-black`}
                   ></button>
                </div>
            </div>

        </div>
      </div>

      {/* RIGHT: Visualizer & Data */}
      {/* min-h-0 is CRITICAL for nested flex scrolling */}
      <div className="flex-1 flex flex-col bg-[#050505] min-h-0 min-w-0">
        
        {/* Controller Output Display */}
        <div className="h-12 border-b border-[#333] bg-[#111] flex items-center px-4 justify-between shrink-0">
           <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
              <div className="flex flex-col shrink-0">
                 <span className="text-[9px] lg:text-[10px] text-[#666]">MODE</span>
                 <span className={`text-xs lg:text-sm font-bold font-mono ${
                     result.status === 'NORMAL' ? 'text-green-500' : 
                     result.status === 'BALANCING' ? 'text-blue-400' : 'text-red-500'
                 }`}>
                    {result.status}
                 </span>
              </div>
              <div className="w-px h-8 bg-[#333] shrink-0"></div>
              <div className="flex flex-col shrink-0">
                 <span className="text-[9px] lg:text-[10px] text-[#666]">IMBALANCE</span>
                 <span className="text-xs lg:text-sm font-bold font-mono text-white">{result.imbalance.toFixed(4)}</span>
              </div>
              <div className="w-px h-8 bg-[#333] shrink-0"></div>
              <div className="flex flex-col shrink-0">
                 <span className="text-[9px] lg:text-[10px] text-[#666]">RELAYS</span>
                 <span className="text-xs lg:text-sm font-bold font-mono text-white">{result.sw.filter(x=>x).length}/18</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2 shrink-0">
              <button className="px-2 py-1 bg-[#222] border border-[#444] text-[10px] hover:bg-[#333] text-gray-300 whitespace-nowrap">EXPORT LOGS</button>
           </div>
        </div>

        {/* Diagram Area - Takes remaining space */}
        <div className="flex-1 relative min-h-0 overflow-hidden bg-[#050505]">
           <CircuitDiagram switches={result.sw} inputs={inputs} />
        </div>

        {/* Bottom Data Grid (Switch States) - Collapsible */}
        <div className={`border-t border-[#333] bg-[#0a0a0a] flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isMatrixCollapsed ? 'h-7' : 'h-40 lg:h-48'}`}>
           <div 
             className="industrial-header shrink-0 flex justify-between items-center cursor-pointer hover:bg-[#222] select-none"
             onClick={() => setIsMatrixCollapsed(!isMatrixCollapsed)}
           >
              <span>Relay State Matrix</span>
              {isMatrixCollapsed ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
           </div>
           
           {!isMatrixCollapsed && (
             <div className="flex-1 overflow-x-auto p-2">
                <div className="grid grid-cols-9 gap-1 h-full min-w-[500px]">
                   {result.sw.map((s, idx) => (
                      <div key={idx} className={`border ${s ? 'border-green-800 bg-green-900/20' : 'border-[#333] bg-[#111]'} flex flex-col items-center justify-center p-1 rounded-sm`}>
                         <span className="text-[8px] text-[#666] mb-0.5">SW {idx+1}</span>
                         <div className={`w-2 h-2 lg:w-3 lg:h-3 ${s ? 'bg-green-500 shadow-[0_0_5px_rgba(0,255,0,0.5)]' : 'bg-[#222]'} rounded-full`}></div>
                         <span className="text-[9px] font-mono mt-0.5 text-gray-400">{s ? '1' : '0'}</span>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default SimulationPanel;