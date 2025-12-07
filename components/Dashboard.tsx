import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        // Simulate industrial noise and small fluctuations
        const newPoint = {
          time,
          vR: 230 + (Math.random() - 0.5) * 2,
          vY: 230 + (Math.random() - 0.5) * 3,
          vB: 230 + (Math.random() - 0.5) * 1.5,
          load: 45 + (Math.random() - 0.5) * 5,
        };
        const newData = [...prev, newPoint];
        if (newData.length > 30) newData.shift();
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const StatBox = ({ label, val, unit, color }: any) => (
    <div className="industrial-panel p-2 flex flex-col justify-between h-20">
       <span className="text-[10px] font-bold text-[#666] uppercase">{label}</span>
       <div className={`text-2xl font-mono font-bold ${color}`}>
         {typeof val === 'number' ? val.toFixed(2) : val} <span className="text-sm text-[#888]">{unit}</span>
       </div>
    </div>
  );

  return (
    <div className="p-2 h-full flex flex-col gap-2 overflow-y-auto">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Grid Frequency" val={50.02} unit="Hz" color="text-white" />
        <StatBox label="Total Load (kW)" val={142.5} unit="kW" color="text-scada-phaseR" />
        <StatBox label="Power Factor" val={0.98} unit="pf" color="text-green-500" />
        <StatBox label="Reactive Power" val={12.4} unit="kVAR" color="text-blue-400" />
      </div>

      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
         {/* Main Chart: Voltage Profile */}
         <div className="col-span-2 industrial-panel flex flex-col">
            <div className="industrial-header flex justify-between">
               <span>Real-Time Phase Voltages</span>
               <span className="text-green-500 text-[10px]">LIVE</span>
            </div>
            <div className="flex-1 p-2 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                    <CartesianGrid stroke="#333" strokeDasharray="0" vertical={true} />
                    <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={5} />
                    <YAxis domain={['auto', 'auto']} stroke="#666" fontSize={10} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #444', color: '#fff' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Line type="stepAfter" dataKey="vR" stroke="#ff3333" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Phase R (V)" />
                    <Line type="stepAfter" dataKey="vY" stroke="#eedd00" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Phase Y (V)" />
                    <Line type="stepAfter" dataKey="vB" stroke="#0066ff" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Phase B (V)" />
                 </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Secondary Data: Table */}
         <div className="industrial-panel flex flex-col">
            <div className="industrial-header">Feeder Data Points</div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-[#111] text-[#888] text-[10px] uppercase sticky top-0">
                     <tr>
                        <th className="p-2 border-b border-[#333]">Parameter</th>
                        <th className="p-2 border-b border-[#333]">Value</th>
                        <th className="p-2 border-b border-[#333]">Status</th>
                     </tr>
                  </thead>
                  <tbody className="font-mono text-xs text-gray-300">
                     {[
                       { p: 'Voltage R-N', v: '230.4 V', s: 'OK' },
                       { p: 'Voltage Y-N', v: '229.8 V', s: 'OK' },
                       { p: 'Voltage B-N', v: '231.1 V', s: 'OK' },
                       { p: 'Current R', v: '45.2 A', s: 'HIGH' },
                       { p: 'Current Y', v: '32.1 A', s: 'OK' },
                       { p: 'Current B', v: '38.5 A', s: 'OK' },
                       { p: 'Neutral Curr', v: '4.2 A', s: 'WARN' },
                       { p: 'THD Voltage', v: '1.2 %', s: 'OK' },
                       { p: 'THD Current', v: '3.5 %', s: 'OK' },
                     ].map((row, i) => (
                        <tr key={i} className="hover:bg-[#1a1a1a]">
                           <td className="p-2 border-b border-[#222]">{row.p}</td>
                           <td className="p-2 border-b border-[#222] text-white">{row.v}</td>
                           <td className={`p-2 border-b border-[#222] ${row.s === 'OK' ? 'text-green-500' : row.s === 'HIGH' ? 'text-red-500' : 'text-orange-500'}`}>{row.s}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
      
      {/* Alarms / Logs Section */}
      <div className="h-40 industrial-panel flex flex-col">
         <div className="industrial-header bg-red-900/20 text-red-200 border-red-900/50">Active Alarms & Events</div>
         <div className="flex-1 overflow-auto bg-[#050505] p-1 font-mono text-xs">
            <div className="flex text-[#666] border-b border-[#222] px-2 py-1">
               <span className="w-32">TIMESTAMP</span>
               <span className="w-32">SOURCE</span>
               <span className="w-24">CODE</span>
               <span className="flex-1">MESSAGE</span>
            </div>
            <div className="flex text-red-400 px-2 py-1 hover:bg-[#111]">
               <span className="w-32">14:22:10.552</span>
               <span className="w-32">FEEDER_01</span>
               <span className="w-24">OV_TRIP</span>
               <span className="flex-1">Instantaneous Overcurrent Phase R Detected {'>'} 120%</span>
            </div>
            <div className="flex text-yellow-500 px-2 py-1 hover:bg-[#111]">
               <span className="w-32">14:21:45.102</span>
               <span className="w-32">PV_INV_02</span>
               <span className="w-24">SYNC_LOSS</span>
               <span className="flex-1">Grid synchronization lost. Anti-islanding active.</span>
            </div>
             <div className="flex text-gray-400 px-2 py-1 hover:bg-[#111]">
               <span className="w-32">14:20:00.000</span>
               <span className="w-32">SYS_SCHED</span>
               <span className="w-24">INFO</span>
               <span className="flex-1">Periodic data log exported to database.</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;