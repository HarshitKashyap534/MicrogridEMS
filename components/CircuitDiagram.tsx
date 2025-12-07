import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface Props {
  switches: number[]; // 0-17
  inputs: any;
}

const CircuitDiagram: React.FC<Props> = ({ switches, inputs }) => {
  // --- HELPERS ---
  const isClosed = (idx: number) => switches[idx] === 1;

  // Zoom and Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Colors
  const C_R = '#ff3333';
  const C_Y = '#eedd00';
  const C_B = '#0066ff';
  const C_OFF = '#333333';
  const C_GRID = '#444444';

  // SVG Dimensions
  const W = 800;
  const H = 500;
  
  // Coordinates
  const gridY = 50;
  const busY = { R: 100, Y: 120, B: 140 };
  const loadY = 400;
  
  // X positions for Grid inputs
  const gridX = { R: 100, Y: 120, B: 140 };

  // X positions for Loads (Distributed evenly)
  const loadX = { L1: 200, L2: 400, L3: 600 };
  
  // Handlers
  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 5));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.5));
  const handleReset = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setIsDragging(false);

  // Switch Symbol Component
  const SwitchSymbol = ({ x, y, open, color, label }: any) => (
    <g transform={`translate(${x}, ${y})`}>
       {/* Label */}
       {label && <text x={15} y={-5} fill="#666" fontSize="10" fontFamily="monospace">{label}</text>}
       {/* Box background */}
       <rect x={-8} y={-8} width={16} height={16} fill="black" stroke={color} strokeWidth={1} />
       {/* Contact */}
       {open ? (
         <line x1={-4} y1={4} x2={4} y2={-4} stroke={color} strokeWidth={2} /> 
       ) : (
         <rect x={-4} y={-4} width={8} height={8} fill={color} />
       )}
    </g>
  );

  // Line Component
  const Wire = ({ x1, y1, x2, y2, color, active, dashed }: any) => (
    <line 
      x1={x1} y1={y1} x2={x2} y2={y2} 
      stroke={active ? color : C_OFF} 
      strokeWidth={active ? 2 : 1}
      strokeDasharray={dashed ? "4 4" : ""}
    />
  );

  // Determine effective color of load lines based on active switches
  // Load 1 is fed by SW6(R), SW7(Y), SW8(B)
  const load1Color = isClosed(5) ? C_R : isClosed(6) ? C_Y : isClosed(7) ? C_B : C_OFF;
  const load2Color = isClosed(8) ? C_R : isClosed(9) ? C_Y : isClosed(10) ? C_B : C_OFF;
  // Load 3 fed by SW12(R) or SW17(B... or Y depending on logic, mostly B in code)
  const load3Color = isClosed(11) ? C_R : isClosed(16) ? C_B : C_OFF; 

  return (
    <div className="w-full h-full schematic-bg relative overflow-hidden flex flex-col bg-[#080808]">
      {/* Title & Controls */}
      <div className="absolute top-2 left-2 text-xs font-mono text-[#666] pointer-events-none z-10">
        DIAGRAM: SINGLE LINE REPRESENTATION
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        <button onClick={handleZoomIn} className="p-1.5 bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#333] hover:text-white transition-colors rounded-sm" title="Zoom In">
          <ZoomIn size={16}/>
        </button>
        <button onClick={handleZoomOut} className="p-1.5 bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#333] hover:text-white transition-colors rounded-sm" title="Zoom Out">
          <ZoomOut size={16}/>
        </button>
        <button onClick={handleReset} className="p-1.5 bg-[#1a1a1a] border border-[#333] text-gray-300 hover:bg-[#333] hover:text-white transition-colors rounded-sm" title="Reset View">
          <Maximize size={16}/>
        </button>
        <div className="h-2"></div>
         <div className="p-1.5 bg-[#1a1a1a] border border-[#333] text-[#666] flex justify-center rounded-sm" title="Pan Mode Active">
          <Move size={16}/>
        </div>
      </div>

      {/* SVG Container */}
      <div 
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: 'center', width: '100%', height: '100%', transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            
            {/* --- GRID SOURCE (Top) --- */}
            <text x={50} y={30} fill="#888" fontSize="12" fontWeight="bold">GRID SOURCE (3Φ)</text>
            
            {/* Source Feeder Lines */}
            <Wire x1={gridX.R} y1={gridY} x2={gridX.R} y2={busY.R} color={C_R} active={true} />
            <Wire x1={gridX.Y} y1={gridY} x2={gridX.Y} y2={busY.Y} color={C_Y} active={true} />
            <Wire x1={gridX.B} y1={gridY} x2={gridX.B} y2={busY.B} color={C_B} active={true} />

            {/* Source Switches (S1, S2, S3) - Indices 0, 1, 2 */}
            <SwitchSymbol x={gridX.R} y={(gridY+busY.R)/2} open={!isClosed(0)} color={C_R} label="S1" />
            <SwitchSymbol x={gridX.Y} y={(gridY+busY.Y)/2} open={!isClosed(1)} color={C_Y} label="S2" />
            <SwitchSymbol x={gridX.B} y={(gridY+busY.B)/2} open={!isClosed(2)} color={C_B} label="S3" />

            {/* --- MAIN BUSBARS (Horizontal) --- */}
            <Wire x1={50} y1={busY.R} x2={750} y2={busY.R} color={C_R} active={isClosed(0)} />
            <Wire x1={50} y1={busY.Y} x2={750} y2={busY.Y} color={C_Y} active={isClosed(1)} />
            <Wire x1={50} y1={busY.B} x2={750} y2={busY.B} color={C_B} active={isClosed(2)} />
            
            <text x={760} y={busY.R+4} fill={C_R} fontSize="10" fontFamily="monospace">PHASE R ({inputs.vR}V)</text>
            <text x={760} y={busY.Y+4} fill={C_Y} fontSize="10" fontFamily="monospace">PHASE Y ({inputs.vY}V)</text>
            <text x={760} y={busY.B+4} fill={C_B} fontSize="10" fontFamily="monospace">PHASE B ({inputs.vB}V)</text>


            {/* --- LOAD 1 CONNECTION (Left) --- */}
            {/* Drops from Bus to Switches */}
            <Wire x1={loadX.L1-20} y1={busY.R} x2={loadX.L1-20} y2={250} color={C_R} active={isClosed(0)} />
            <Wire x1={loadX.L1}    y1={busY.Y} x2={loadX.L1}    y2={250} color={C_Y} active={isClosed(1)} />
            <Wire x1={loadX.L1+20} y1={busY.B} x2={loadX.L1+20} y2={250} color={C_B} active={isClosed(2)} />

            {/* Switches S6, S7, S8 (Indices 5, 6, 7) */}
            <SwitchSymbol x={loadX.L1-20} y={250} open={!isClosed(5)} color={C_R} label="S6" />
            <SwitchSymbol x={loadX.L1}    y={250} open={!isClosed(6)} color={C_Y} label="S7" />
            <SwitchSymbol x={loadX.L1+20} y={250} open={!isClosed(7)} color={C_B} label="S8" />

            {/* Output to Load 1 */}
            {/* Join wires */}
            <Wire x1={loadX.L1-20} y1={258} x2={loadX.L1} y2={280} color={load1Color} active={isClosed(5)} />
            <Wire x1={loadX.L1}    y1={258} x2={loadX.L1} y2={280} color={load1Color} active={isClosed(6)} />
            <Wire x1={loadX.L1+20} y1={258} x2={loadX.L1} y2={280} color={load1Color} active={isClosed(7)} />
            <Wire x1={loadX.L1}    y1={280} x2={loadX.L1} y2={loadY} color={load1Color} active={load1Color !== C_OFF} />


            {/* --- LOAD 2 CONNECTION (Center) --- */}
            <Wire x1={loadX.L2-20} y1={busY.R} x2={loadX.L2-20} y2={250} color={C_R} active={isClosed(0)} />
            <Wire x1={loadX.L2}    y1={busY.Y} x2={loadX.L2}    y2={250} color={C_Y} active={isClosed(1)} />
            <Wire x1={loadX.L2+20} y1={busY.B} x2={loadX.L2+20} y2={250} color={C_B} active={isClosed(2)} />

            {/* Switches S9, S10, S11 (Indices 8, 9, 10) */}
            <SwitchSymbol x={loadX.L2-20} y={250} open={!isClosed(8)} color={C_R} label="S9" />
            <SwitchSymbol x={loadX.L2}    y={250} open={!isClosed(9)} color={C_Y} label="S10" />
            <SwitchSymbol x={loadX.L2+20} y={250} open={!isClosed(10)} color={C_B} label="S11" />

            {/* Output to Load 2 */}
            <Wire x1={loadX.L2-20} y1={258} x2={loadX.L2} y2={280} color={load2Color} active={isClosed(8)} />
            <Wire x1={loadX.L2}    y1={258} x2={loadX.L2} y2={280} color={load2Color} active={isClosed(9)} />
            <Wire x1={loadX.L2+20} y1={258} x2={loadX.L2} y2={280} color={load2Color} active={isClosed(10)} />
            <Wire x1={loadX.L2}    y1={280} x2={loadX.L2} y2={loadY} color={load2Color} active={load2Color !== C_OFF} />


            {/* --- LOAD 3 CONNECTION (Right) --- */}
            <Wire x1={loadX.L3-20} y1={busY.R} x2={loadX.L3-20} y2={250} color={C_R} active={isClosed(0)} />
            {/* No Y connection for Load 3 usually, or mapped differently. Based on code S17 is alt */}
            <Wire x1={loadX.L3+20} y1={busY.B} x2={loadX.L3+20} y2={250} color={C_B} active={isClosed(2)} />

            {/* Switches S12, S17 (Indices 11, 16) */}
            <SwitchSymbol x={loadX.L3-20} y={250} open={!isClosed(11)} color={C_R} label="S12" />
            <SwitchSymbol x={loadX.L3+20} y={250} open={!isClosed(16)} color={C_B} label="S17" />

            {/* Output to Load 3 */}
            <Wire x1={loadX.L3-20} y1={258} x2={loadX.L3} y2={280} color={load3Color} active={isClosed(11)} />
            <Wire x1={loadX.L3+20} y1={258} x2={loadX.L3} y2={280} color={load3Color} active={isClosed(16)} />
            <Wire x1={loadX.L3}    y1={280} x2={loadX.L3} y2={loadY} color={load3Color} active={load3Color !== C_OFF} />


            {/* --- LOAD SYMBOLS (Bottom) --- */}
            {[0, 1, 2].map(i => {
              const x = i === 0 ? loadX.L1 : i === 1 ? loadX.L2 : loadX.L3;
              const v = i === 0 ? inputs.vLoad1 : i === 1 ? inputs.vLoad2 : inputs.vLoad3;
              const col = i === 0 ? load1Color : i === 1 ? load2Color : load3Color;
              return (
                <g key={i} transform={`translate(${x}, ${loadY})`}>
                    <circle r="20" fill="black" stroke={col === C_OFF ? '#555' : col} strokeWidth="2" />
                    <text x="0" y="5" textAnchor="middle" fill="#ddd" fontSize="10" fontWeight="bold">LOAD {i+1}</text>
                    <text x="0" y="35" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">{v}V</text>
                </g>
              )
            })}

            {/* --- PV INJECTION (Feeding back up) --- */}
            {/* PV1 Lines */}
            <Wire x1={loadX.L1-20} y1={200} x2={loadX.L1-40} y2={200} color={C_R} dashed active={isClosed(3)} /> {/* S4 */}
            <Wire x1={loadX.L1}    y1={210} x2={loadX.L1-40} y2={210} color={C_Y} dashed active={isClosed(4)} /> {/* S5 */}
            <Wire x1={loadX.L1+20} y1={220} x2={loadX.L1-40} y2={220} color={C_B} dashed active={isClosed(13)} /> {/* S14 */}
            
            <SwitchSymbol x={loadX.L1-30} y={200} open={!isClosed(3)} color={C_R} label="S4" />
            <SwitchSymbol x={loadX.L1-30} y={210} open={!isClosed(4)} color={C_Y} label="S5" />
            <SwitchSymbol x={loadX.L1-30} y={220} open={!isClosed(13)} color={C_B} label="S14" />
            
            <text x={loadX.L1-60} y={215} fill="orange" fontSize="10" fontWeight="bold" textAnchor="end">PV1</text>
            
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CircuitDiagram;