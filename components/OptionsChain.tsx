import React from 'react';
import { OptionContract } from '../types';

interface OptionsChainProps {
  chain: OptionContract[];
  symbol: string;
}

const OptionsChain: React.FC<OptionsChainProps> = ({ chain, symbol }) => {
  return (
    <div className="bg-market-card rounded-xl border border-slate-700 overflow-hidden shadow-lg mt-6">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">{symbol} Option Chain (Exp: 2024-06-21)</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Real-time Greeks</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm text-left text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase font-medium">
            <tr>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700">Calls Last</th>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700 hidden md:table-cell">Delta</th>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700 hidden sm:table-cell">IV</th>
              <th scope="col" className="px-3 py-3 text-center bg-slate-800 border-b border-slate-700 text-white font-bold">Strike</th>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700">Puts Last</th>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700 hidden md:table-cell">Delta</th>
              <th scope="col" className="px-3 py-3 text-center border-b border-slate-700 hidden sm:table-cell">IV</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((row) => (
              <tr key={row.strike} className="hover:bg-slate-800/50 border-b border-slate-800 transition-colors">
                {/* CALLS */}
                <td className={`px-3 py-2 text-center font-mono ${row.call.last > row.call.bid ? 'text-market-up' : 'text-market-down'}`}>
                  {row.call.last.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center text-slate-500 hidden md:table-cell">{row.call.delta}</td>
                <td className="px-3 py-2 text-center text-amber-500 hidden sm:table-cell">{(row.call.iv * 100).toFixed(0)}%</td>
                
                {/* STRIKE */}
                <td className="px-3 py-2 text-center bg-slate-800/30 font-bold text-white border-x border-slate-800">
                  {row.strike}
                </td>

                {/* PUTS */}
                <td className={`px-3 py-2 text-center font-mono ${row.put.last > row.put.bid ? 'text-market-up' : 'text-market-down'}`}>
                  {row.put.last.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center text-slate-500 hidden md:table-cell">{row.put.delta}</td>
                <td className="px-3 py-2 text-center text-amber-500 hidden sm:table-cell">{(row.put.iv * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionsChain;