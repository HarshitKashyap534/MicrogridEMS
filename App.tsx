import React, { useState } from 'react';
import { Activity, Settings, Database, Monitor } from 'lucide-react';
import SimulationPanel from './components/SimulationPanel';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState<'dashboard' | 'simulation'>('simulation');

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] font-sans overflow-hidden">
      
      {/* Top SCADA Toolbar */}
      <header className="h-12 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4 select-none shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-4 h-4 bg-scada-phaseR rounded-sm"></div>
             <div className="w-4 h-4 bg-scada-phaseY rounded-sm"></div>
             <div className="w-4 h-4 bg-scada-phaseB rounded-sm"></div>
             <span className="font-bold text-lg tracking-tight text-gray-200 ml-2">POWER<span className="text-gray-500">SCADA</span> <span className="text-xs text-[#666]">v2.4.1</span></span>
          </div>

          <div className="hidden md:block h-6 w-px bg-[#333]"></div>

          <nav className="flex gap-1">
            <button 
              onClick={() => setView('simulation')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-transparent hover:bg-[#333] transition-colors ${view === 'simulation' ? 'bg-[#2a2a2a] border-[#444] text-white' : 'text-gray-500'}`}
            >
              Simulation Control
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-transparent hover:bg-[#333] transition-colors ${view === 'dashboard' ? 'bg-[#2a2a2a] border-[#444] text-white' : 'text-gray-500'}`}
            >
              Real-Time Monitor
            </button>
          </nav>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
           <div className="flex items-center gap-2 px-3 py-1 bg-black border border-[#333]">
              <span className="text-[#666]">CONTROLLER STATUS:</span>
              <span className="text-scada-on font-bold animate-pulse">ONLINE</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[#666]">{new Date().toLocaleDateString()}</span>
              <span className="text-white font-bold">{new Date().toLocaleTimeString()}</span>
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden relative bg-[#0a0a0a] min-h-0 flex flex-col">
         {view === 'dashboard' ? <Dashboard /> : <SimulationPanel />}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-[#111] border-t border-[#333] flex items-center px-2 text-xxs font-mono text-[#555] justify-between select-none shrink-0 z-10">
         <div className="flex gap-4">
            <span>COMMS: <span className="text-green-600">OK</span></span>
            <span>LATENCY: 12ms</span>
            <span>DRIVER: STM32_V4</span>
         </div>
         <div className="hidden sm:flex gap-4">
             <span>USER: ADMIN</span>
             <span>ACCESS: LEVEL 5</span>
         </div>
      </footer>
    </div>
  );
}

export default App;