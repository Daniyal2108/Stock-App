import React from 'react';
import { MarketData } from '../types';
import { Building2, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { StatCard, SkeletonStatCard } from './UI';

interface AssetDetailsProps {
  asset: MarketData;
  loading?: boolean;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Market Cap"
        value={asset.marketCap || 'N/A'}
        icon={<Activity size={14} />}
      />
      <StatCard
        label="52W Range"
        value={
          asset.low52Week
            ? `${asset.low52Week} - ${asset.high52Week}`
            : 'N/A'
        }
        icon={<TrendingUp size={14} />}
        className="text-xs"
      />
      <StatCard
        label="Sector"
        value={asset.sector || 'N/A'}
        icon={<Building2 size={14} />}
      />
      <StatCard
        label="P/E Ratio"
        value={asset.peRatio || 'N/A'}
        icon={<DollarSign size={14} />}
      />
    </div>
  );
};

export default AssetDetails;