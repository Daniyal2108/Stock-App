import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, DollarSign, RefreshCcw } from 'lucide-react';
import { MarketData } from '../types';

interface ForexConverterProps {
  marketData: MarketData[];
}

const ForexConverter: React.FC<ForexConverterProps> = ({ marketData }) => {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');
  const [rate, setRate] = useState(1);

  // Currencies available based on data + Base currencies
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'BTC', 'ETH'];

  useEffect(() => {
    // Calculate Rate logic based on Cross Rates from marketData
    // This is a simplified logic assuming marketData contains pairs like 'EUR/USD'
    
    const getPriceInUSD = (currency: string): number => {
        if (currency === 'USD') return 1;
        
        // Check Crypto
        const cryptoPair = marketData.find(m => m.symbol === `${currency}/USD`);
        if (cryptoPair) return cryptoPair.price;

        // Check Forex Direct (e.g., EUR/USD means 1 EUR = x USD)
        const directForex = marketData.find(m => m.symbol === `${currency}/USD`);
        if (directForex) return directForex.price;

        // Check Forex Inverse (e.g., USD/JPY means 1 USD = x JPY -> 1 JPY = 1/x USD)
        const inverseForex = marketData.find(m => m.symbol === `USD/${currency}`);
        if (inverseForex) return 1 / inverseForex.price;

        // Fallbacks for demo if pair missing
        if (currency === 'EUR') return 1.08;
        if (currency === 'GBP') return 1.26;
        if (currency === 'JPY') return 0.0067;
        if (currency === 'CAD') return 0.74;
        
        return 1;
    };

    const fromPrice = getPriceInUSD(fromCurr);
    const toPrice = getPriceInUSD(toCurr);
    
    setRate(fromPrice / toPrice);

  }, [fromCurr, toCurr, marketData]);

  const converted = (amount * rate).toFixed(2);

  return (
    <div className="bg-market-card rounded-xl border border-slate-700 p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 text-market-accent">
        <div className="flex items-center gap-2">
            <DollarSign size={20} />
            <h3 className="font-bold text-white">Live Converter</h3>
        </div>
        <RefreshCcw size={14} className="animate-spin-slow text-slate-500" />
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="text-xs text-slate-400 block mb-2">Amount</label>
          <div className="relative">
             <span className="absolute left-3 top-3 text-slate-500 font-mono">$</span>
             <input 
                type="number" 
                min="0"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-market-accent font-mono text-lg"
             />
          </div>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
          <div>
            <label className="text-xs text-slate-400 block mb-1">From</label>
            <select 
              value={fromCurr} 
              onChange={(e) => setFromCurr(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white appearance-none cursor-pointer font-bold hover:bg-slate-700 transition-colors"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="flex justify-center pt-5 text-market-accent">
            <button onClick={() => { setFromCurr(toCurr); setToCurr(fromCurr); }} className="hover:scale-110 transition-transform p-2 bg-slate-800 rounded-full border border-slate-700">
                <ArrowRightLeft size={18} />
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">To</label>
            <select 
              value={toCurr} 
              onChange={(e) => setToCurr(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white appearance-none cursor-pointer font-bold hover:bg-slate-700 transition-colors"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-center border border-slate-700 shadow-inner relative overflow-hidden">
          <div className="relative z-10">
             <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Exchange Rate: 1 {fromCurr} = {rate.toFixed(4)} {toCurr}</div>
             <div className="text-4xl font-bold text-white font-mono tracking-tight">
               {Number(converted).toLocaleString()} <span className="text-lg text-market-accent font-sans">{toCurr}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForexConverter;