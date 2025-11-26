import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { CandleData, TimeRange } from '../types';

interface FinancialChartProps {
  data: CandleData[];
  symbol: string;
  onRangeChange: (range: TimeRange) => void;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ data, symbol, onRangeChange }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
  const [showVol, setShowVol] = useState(true);

  const ranges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y'];

  const handleRangeClick = (r: TimeRange) => {
    setTimeRange(r);
    onRangeChange(r);
  };

  return (
    <div className="h-[500px] w-full bg-market-card rounded-xl border border-slate-700 shadow-lg flex flex-col">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-slate-200 font-bold flex items-center gap-2">
            {symbol} <span className="text-slate-500 font-normal text-sm">Technical Analysis</span>
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => handleRangeClick(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeRange === r 
                  ? 'bg-market-accent text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-slate-800 flex gap-4 text-xs overflow-x-auto bg-slate-900/30">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none transition-colors">
          <input type="checkbox" checked={showSMA} onChange={(e) => setShowSMA(e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-amber-500 focus:ring-0" />
          SMA 20
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none transition-colors">
          <input type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-pink-500 focus:ring-0" />
          EMA 50
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none transition-colors">
          <input type="checkbox" checked={showVol} onChange={(e) => setShowVol(e.target.checked)} className="rounded bg-slate-700 border-slate-600 text-slate-400 focus:ring-0" />
          Volume
        </label>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            
            <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                tick={{fontSize: 10}} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={30}
            />
            
            <YAxis 
                domain={['auto', 'auto']} 
                stroke="#64748b" 
                tick={{fontSize: 10}} 
                tickLine={false} 
                axisLine={false} 
                orientation="right" 
                tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            />
            
            {/* Main Price */}
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorClose)" 
              strokeWidth={2} 
              name="Price" 
              animationDuration={500}
              isAnimationActive={false} // Smoother realtime updates
            />
            
            {/* Indicators */}
            {showSMA && <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1.5} name="SMA 20" animationDuration={500} isAnimationActive={false} />}
            {showEMA && <Line type="monotone" dataKey="ema50" stroke="#ec4899" dot={false} strokeWidth={1.5} name="EMA 50" animationDuration={500} isAnimationActive={false} />}
            
            {/* Volume */}
            {showVol && <Bar dataKey="volume" barSize={4} fill="#475569" opacity={0.3} yAxisId={0} />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;