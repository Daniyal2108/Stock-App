import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MarketData } from '../types';
import { StatCard, Card, Badge, SkeletonStatCard, SkeletonCard, SkeletonChart, SkeletonTable } from './UI';
import { formatCurrency, formatPercentage, formatLargeNumber } from '../utils/helpers';
import { CHART_COLORS } from '../utils/constants';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface AnalyticsProps {
  marketData: MarketData[];
  loading?: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ marketData, loading = false }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Calculate market statistics
  const stats = useMemo(() => {
    const stocks = marketData.filter(m => m.type === 'stock');
    const cryptos = marketData.filter(m => m.type === 'crypto');
    const forex = marketData.filter(m => m.type === 'forex');

    const totalAssets = marketData.length;
    const gainers = marketData.filter(m => m.changePercent > 0).length;
    const losers = marketData.filter(m => m.changePercent < 0).length;
    const avgChange = marketData.reduce((sum, m) => sum + m.changePercent, 0) / totalAssets;
    
    const totalVolume = marketData.reduce((sum, m) => {
      const vol = parseFloat(m.volume.replace(/[^0-9.]/g, '')) || 0;
      return sum + vol;
    }, 0);

    return {
      totalAssets,
      gainers,
      losers,
      avgChange,
      totalVolume,
      stocks: stocks.length,
      cryptos: cryptos.length,
      forex: forex.length,
    };
  }, [marketData]);

  // Top gainers and losers
  const topGainers = useMemo(() => {
    return [...marketData]
      .filter(m => m.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
  }, [marketData]);

  const topLosers = useMemo(() => {
    return [...marketData]
      .filter(m => m.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
  }, [marketData]);

  // Sector performance (for stocks)
  const sectorPerformance = useMemo(() => {
    const stocks = marketData.filter(m => m.type === 'stock' && m.sector);
    const sectorMap = new Map<string, { count: number; avgChange: number; total: number }>();

    stocks.forEach(stock => {
      if (stock.sector) {
        const existing = sectorMap.get(stock.sector) || { count: 0, avgChange: 0, total: 0 };
        existing.count++;
        existing.total += stock.changePercent;
        existing.avgChange = existing.total / existing.count;
        sectorMap.set(stock.sector, existing);
      }
    });

    return Array.from(sectorMap.entries())
      .map(([sector, data]) => ({
        sector,
        avgChange: data.avgChange,
        count: data.count,
      }))
      .sort((a, b) => b.avgChange - a.avgChange)
      .slice(0, 8);
  }, [marketData]);

  // Asset type distribution
  const assetDistribution = useMemo(() => {
    const stocks = marketData.filter(m => m.type === 'stock').length;
    const cryptos = marketData.filter(m => m.type === 'crypto').length;
    const forex = marketData.filter(m => m.type === 'forex').length;

    return [
      { name: 'Stocks', value: stocks, color: CHART_COLORS.bullish },
      { name: 'Crypto', value: cryptos, color: CHART_COLORS.volume },
      { name: 'Forex', value: forex, color: CHART_COLORS.ema },
    ];
  }, [marketData]);

  // Price range distribution
  const priceDistribution = useMemo(() => {
    const ranges = [
      { range: '$0-$50', count: 0, label: '0-50' },
      { range: '$50-$100', count: 0, label: '50-100' },
      { range: '$100-$200', count: 0, label: '100-200' },
      { range: '$200-$500', count: 0, label: '200-500' },
      { range: '$500+', count: 0, label: '500+' },
    ];

    marketData.forEach(asset => {
      if (asset.price < 50) ranges[0].count++;
      else if (asset.price < 100) ranges[1].count++;
      else if (asset.price < 200) ranges[2].count++;
      else if (asset.price < 500) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [marketData]);

  // Volume analysis data
  const volumeData = useMemo(() => {
    return marketData
      .slice(0, 10)
      .map(asset => ({
        symbol: asset.symbol,
        volume: parseFloat(asset.volume.replace(/[^0-9.]/g, '')) || 0,
        change: asset.changePercent,
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [marketData]);

  // Performance trend (simulated data based on time range)
  const performanceTrend = useMemo(() => {
    const days = selectedTimeRange === '1D' ? 24 : selectedTimeRange === '1W' ? 7 : selectedTimeRange === '1M' ? 30 : selectedTimeRange === '3M' ? 90 : 365;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: 100 + (Math.random() * 20 - 10) + (i * 0.1),
        volume: Math.random() * 1000000,
      };
    });
  }, [selectedTimeRange]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-800/50 p-4 sm:p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 mb-2">
              <BarChart3 className="text-purple-400" size={isMobile ? 24 : 28} />
              Market Analytics
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Comprehensive market insights and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  selectedTimeRange === range
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Assets"
          value={stats.totalAssets.toString()}
          icon={<Activity size={isMobile ? 18 : 20} />}
          trend={stats.avgChange >= 0 ? 'up' : 'down'}
          trendValue={formatPercentage(stats.avgChange)}
        />
        <StatCard
          label="Gainers"
          value={stats.gainers.toString()}
          icon={<TrendingUp size={isMobile ? 18 : 20} />}
          variant="success"
        />
        <StatCard
          label="Losers"
          value={stats.losers.toString()}
          icon={<TrendingDown size={isMobile ? 18 : 20} />}
          variant="danger"
        />
        <StatCard
          label="Total Volume"
          value={formatLargeNumber(stats.totalVolume)}
          icon={<DollarSign size={isMobile ? 18 : 20} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Trend */}
        <Card variant="elevated" padding="md" className="h-[300px] sm:h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Market Performance
            </h3>
            <Badge variant="info">{selectedTimeRange}</Badge>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceTrend}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.bullish} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.bullish} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS.bullish} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Asset Distribution */}
        <Card variant="elevated" padding="md" className="h-[300px] sm:h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-400" />
              Asset Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isMobile ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Gainers */}
        <Card variant="elevated" padding="md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpRight size={18} className="text-emerald-400" />
            Top Gainers
          </h3>
          <div className="space-y-2">
            {topGainers.map((asset, index) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{asset.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                    {formatCurrency(asset.price)}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold">
                    +{formatPercentage(asset.changePercent, { showSign: false })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Losers */}
        <Card variant="elevated" padding="md">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowDownRight size={18} className="text-rose-400" />
            Top Losers
          </h3>
          <div className="space-y-2">
            {topLosers.map((asset, index) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{asset.symbol}</div>
                    <div className="text-xs text-slate-400 truncate">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="font-mono font-bold text-rose-400 text-sm sm:text-base">
                    {formatCurrency(asset.price)}
                  </div>
                  <div className="text-xs text-rose-400 font-semibold">
                    {formatPercentage(asset.changePercent, { showSign: false })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sector Performance & Volume Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Sector Performance */}
        {sectorPerformance.length > 0 && (
          <Card variant="elevated" padding="md" className="h-[300px] sm:h-[350px]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              Sector Performance
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  type="number"
                  stroke="#94a3b8"
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  dataKey="sector" 
                  type="category"
                  stroke="#94a3b8"
                  fontSize={isMobile ? 10 : 12}
                  tick={{ fill: '#94a3b8' }}
                  width={isMobile ? 80 : 100}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => formatPercentage(value)}
                />
                <Bar dataKey="avgChange" fill={CHART_COLORS.bullish} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Volume Analysis */}
        <Card variant="elevated" padding="md" className="h-[300px] sm:h-[350px]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" />
            Volume Leaders
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="symbol" 
                stroke="#94a3b8"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={isMobile ? 10 : 12}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => formatLargeNumber(value)}
              />
              <Bar dataKey="volume" fill={CHART_COLORS.volume} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Price Distribution */}
      <Card variant="elevated" padding="md">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-amber-400" />
          Price Distribution
        </h3>
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <BarChart data={priceDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="label" 
              stroke="#94a3b8"
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #334155', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="count" fill={CHART_COLORS.ema} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Analytics;

