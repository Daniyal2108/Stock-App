import React from 'react';
import { MarketData } from '../types';
import { Building2, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface AssetDetailsProps {
  asset: MarketData;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Activity size={14} />
          <span>Market Cap</span>
        </div>
        <div className="text-white font-mono font-semibold">{asset.marketCap || 'N/A'}</div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <TrendingUp size={14} />
          <span>52W Range</span>
        </div>
        <div className="text-white font-mono font-semibold text-xs">
          {asset.low52Week ? `${asset.low52Week} - ${asset.high52Week}` : 'N/A'}
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <Building2 size={14} />
          <span>Sector</span>
        </div>
        <div className="text-white font-medium">{asset.sector || 'N/A'}</div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          <DollarSign size={14} />
          <span>P/E Ratio</span>
        </div>
        <div className="text-white font-mono font-semibold">{asset.peRatio || 'N/A'}</div>
      </div>
    </div>
  );
};

export default AssetDetails;