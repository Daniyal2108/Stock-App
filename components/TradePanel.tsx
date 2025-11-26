import React, { useState } from 'react';
import { MarketData, UserProfile } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

interface TradePanelProps {
  asset: MarketData;
  user: UserProfile;
  onTrade: (symbol: string, qty: number, side: 'buy' | 'sell') => void;
}

const TradePanel: React.FC<TradePanelProps> = ({ asset, user, onTrade }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');

  const totalCost = asset.price * quantity;
  const canAfford = user.balance >= totalCost;

  const handleTrade = () => {
    if (side === 'buy' && !canAfford) return;
    onTrade(asset.symbol, quantity, side);
  };

  return (
    <div className="bg-market-card border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase size={18} className="text-amber-500"/> Trade {asset.symbol}
         </h3>
         <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
            Balance: <span className="text-white font-mono">${user.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
         </div>
      </div>

      <div className="flex bg-slate-900 rounded-lg p-1 mb-6">
         <button 
           onClick={() => setSide('buy')}
           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${side === 'buy' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <TrendingUp size={16}/> Buy
         </button>
         <button 
           onClick={() => setSide('sell')}
           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${side === 'sell' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <TrendingDown size={16}/> Sell
         </button>
      </div>

      <div className="space-y-4">
         <div>
            <label className="text-xs text-slate-400 block mb-1">Quantity</label>
            <input 
               type="number" 
               min="0.0001"
               step="any"
               value={quantity}
               onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value)))}
               className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono focus:ring-1 focus:ring-market-accent outline-none"
            />
         </div>

         <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2">
               <span className="text-slate-400">Price</span>
               <span className="text-white font-mono">${asset.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 border-b border-slate-700 pb-2">
               <span className="text-slate-400">Fees (Est.)</span>
               <span className="text-white font-mono">$0.00</span>
            </div>
            <div className="flex justify-between font-bold">
               <span className="text-slate-300">Total</span>
               <span className={`font-mono ${canAfford || side === 'sell' ? 'text-white' : 'text-red-500'}`}>
                 ${totalCost.toLocaleString(undefined, {maximumFractionDigits: 2})}
               </span>
            </div>
         </div>

         <button 
            onClick={handleTrade}
            disabled={side === 'buy' && !canAfford}
            className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                side === 'buy' 
                  ? (canAfford ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'bg-slate-700 text-slate-500 cursor-not-allowed')
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
         >
            <DollarSign size={18} />
            {side === 'buy' ? (canAfford ? 'Place Buy Order' : 'Insufficient Funds') : 'Place Sell Order'}
         </button>
      </div>
    </div>
  );
};

export default TradePanel;