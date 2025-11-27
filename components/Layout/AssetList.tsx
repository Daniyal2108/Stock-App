import React, { memo, useMemo } from 'react';
import { Search, Briefcase } from 'lucide-react';
import { MarketData } from '../../types';

interface AssetListProps {
  data: MarketData[];
  title: string;
  selectedSymbol: string;
  onAssetSelect: (asset: MarketData) => void;
}

const AssetList: React.FC<AssetListProps> = memo(({ data, title, selectedSymbol, onAssetSelect }) => {

  if (data.length === 0) {
    return (
      <div className="bg-market-card rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col shadow-xl">
        <div className="p-4 border-b border-slate-700 font-semibold text-slate-300 flex justify-between items-center">
          <span>{title}</span>
          <Search size={16} className="text-slate-500"/>
        </div>
        <div className="p-4 text-center text-slate-500 text-sm">No assets found.</div>
      </div>
    );
  }

  return (
    <div className="bg-market-card rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col shadow-xl">
      <div className="p-4 border-b border-slate-700 font-semibold text-slate-300 flex justify-between items-center">
        <span>{title}</span>
        <Search size={16} className="text-slate-500"/>
      </div>
      <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
        {data.map((asset) => (
          <div 
            key={asset.symbol} 
            onClick={() => onAssetSelect(asset)}
            className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors flex justify-between items-center group ${
              selectedSymbol === asset.symbol ? 'bg-slate-800 border-l-2 border-market-accent' : ''
            }`}
          >
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                {asset.symbol}
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">{asset.name}</div>
            </div>
            <div className="text-right">
              <div className="text-white font-mono text-sm">
                ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              <div className={`text-xs font-bold ${asset.changePercent >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AssetList.displayName = 'AssetList';

export default AssetList;

