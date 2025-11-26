import React from 'react';
import { PortfolioItem, MarketData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PortfolioSummaryProps {
  portfolio: PortfolioItem[];
  marketData: MarketData[];
  cashBalance: number;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio, marketData, cashBalance }) => {
  // Calculate current values
  const holdings = portfolio.map(item => {
    const currentPrice = marketData.find(m => m.symbol === item.symbol)?.price || item.avgPrice;
    const value = currentPrice * item.quantity;
    const cost = item.avgPrice * item.quantity;
    const pnl = value - cost;
    const pnlPercent = (pnl / cost) * 100;
    
    return { ...item, currentPrice, value, pnl, pnlPercent };
  });

  const totalInvested = holdings.reduce((sum, item) => sum + item.value, 0);
  const totalEquity = totalInvested + cashBalance;
  const totalPnL = holdings.reduce((sum, item) => sum + item.pnl, 0);

  const data = [
    ...holdings.map(h => ({ name: h.symbol, value: h.value })),
    { name: 'Cash', value: cashBalance }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Stats Card */}
       <div className="bg-market-card border border-slate-700 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Portfolio Overview</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Total Equity</div>
                <div className="text-2xl font-bold text-white font-mono">${totalEquity.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
             </div>
             <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Available Cash</div>
                <div className="text-2xl font-bold text-slate-300 font-mono">${cashBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
             </div>
             <div className="bg-slate-800 p-4 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Total P&L</div>
                <div className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                   {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-900 text-slate-400">
                  <tr>
                     <th className="p-3 rounded-l-lg">Asset</th>
                     <th className="p-3">Avg Price</th>
                     <th className="p-3">Current</th>
                     <th className="p-3 text-right">Value</th>
                     <th className="p-3 text-right rounded-r-lg">P&L</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {holdings.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-500">No active positions. Start trading!</td></tr>
                  ) : (
                    holdings.map(h => (
                        <tr key={h.symbol} className="hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-white">{h.symbol} <span className="text-xs text-slate-500 font-normal">x{h.quantity}</span></td>
                            <td className="p-3 font-mono text-slate-400">${h.avgPrice.toFixed(2)}</td>
                            <td className="p-3 font-mono text-white">${h.currentPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono text-white">${h.value.toLocaleString()}</td>
                            <td className={`p-3 text-right font-mono font-bold ${h.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {h.pnlPercent > 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                            </td>
                        </tr>
                    ))
                  )}
               </tbody>
            </table>
          </div>
       </div>

       {/* Allocation Chart */}
       <div className="bg-market-card border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-400 mb-4 w-full text-left">Asset Allocation</h3>
          <div className="w-full h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                   <Pie 
                     data={data} 
                     innerRadius={60} 
                     outerRadius={80} 
                     paddingAngle={5} 
                     dataKey="value"
                   >
                      {data.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                   </Pie>
                   <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                   />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
             {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1 text-xs text-slate-400">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                   {d.name}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default PortfolioSummary;