import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CandleData, TimeRange } from '../types';
import { TimeRangeSelector, LoadingSpinner } from './UI';
import { TIME_RANGES, CHART_COLORS } from '../utils/constants';
import { formatCurrency, formatPercentage, calculatePriceDomain, calculateVolumeDomain } from '../utils/helpers';

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
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  const handleRangeClick = (r: TimeRange) => {
    setTimeRange(r);
    onRangeChange(r);
  };

  // Calculate price domain with padding
  const priceDomain = useMemo(() => calculatePriceDomain(data), [data]);

  // Calculate volume domain
  const volumeDomain = useMemo(() => calculateVolumeDomain(data), [data]);

  // Update chart dimensions for SVG overlay
  useEffect(() => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      setChartDimensions({
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
      });
    }
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const candleData = payload[0].payload;
      const isBullish = candleData.close >= candleData.open;
      
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl min-w-[180px] z-50">
          <p className="text-slate-400 text-xs mb-2 font-semibold">{candleData.time}</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Open:</span>
              <span className="text-white font-mono font-semibold">{formatCurrency(candleData.open)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">High:</span>
              <span className="text-emerald-400 font-mono font-semibold">{formatCurrency(candleData.high)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Low:</span>
              <span className="text-rose-400 font-mono font-semibold">{formatCurrency(candleData.low)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-700 pt-1.5 mt-1.5">
              <span className="text-slate-400">Close:</span>
              <span className={`font-mono font-bold ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(candleData.close)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Change:</span>
              <span className={`font-mono ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatPercentage(((candleData.close - candleData.open) / candleData.open) * 100)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-700 pt-1.5 mt-1.5">
              <span className="text-slate-400">Volume:</span>
              <span className="text-slate-300 font-mono">{candleData.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data
  const chartData = useMemo(() => {
    return data.map((candle) => ({
      ...candle,
      bodyTop: Math.max(candle.open, candle.close),
      bodyBottom: Math.min(candle.open, candle.close),
      bodyHeight: Math.abs(candle.close - candle.open),
      isBullish: candle.close >= candle.open,
    }));
  }, [data]);

  // Calculate candlestick positions for SVG overlay
  const candlestickPaths = useMemo(() => {
    if (data.length === 0 || chartDimensions.width === 0) return [];
    
    const chartWidth = chartDimensions.width - 110; // Account for margins
    const chartHeight = chartDimensions.height - 100;
    const candleWidth = (chartWidth / data.length) * 0.7;
    const spacing = chartWidth / data.length;
    
    return data.map((candle, index) => {
      const isBullish = candle.close >= candle.open;
      const bodyTop = Math.max(candle.open, candle.close);
      const bodyBottom = Math.min(candle.open, candle.close);
      
      const x = (index * spacing) + (spacing - candleWidth) / 2 + 50;
      const centerX = (index * spacing) + spacing / 2 + 50;
      
      const scaleY = (price: number) => {
        return chartHeight - ((price - priceDomain[0]) / (priceDomain[1] - priceDomain[0])) * chartHeight + 20;
      };
      
      const wickTopY = scaleY(candle.high);
      const wickBottomY = scaleY(candle.low);
      const bodyTopY = scaleY(bodyTop);
      const bodyBottomY = scaleY(bodyBottom);
      const bodyHeight = Math.max(Math.abs(bodyTopY - bodyBottomY), 2);
      
      return {
        x,
        centerX,
        candleWidth,
        wickTopY,
        wickBottomY,
        bodyTopY,
        bodyBottomY,
        bodyHeight,
        color: isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish,
      };
    });
  }, [data, chartDimensions, priceDomain]);

  return (
    <div className="h-[500px] w-full bg-market-card rounded-xl border border-slate-700 shadow-lg flex flex-col relative">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-slate-200 font-bold flex items-center gap-2">
            {symbol} <span className="text-slate-500 font-normal text-sm">Candlestick Chart</span>
          </h3>
        </div>
        
        <TimeRangeSelector
          selectedRange={timeRange}
          onRangeChange={handleRangeClick}
        />
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
        <div className="ml-auto flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span className="text-xs">Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500"></div>
            <span className="text-xs">Bearish</span>
          </div>
        </div>
      </div>

      {/* Chart Area with SVG Overlay */}
      <div className="flex-1 p-4 relative" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 50, bottom: 60 }}
          >
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#64748b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
            
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={20}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              yAxisId="price"
              domain={priceDomain}
              stroke="#64748b" 
              tick={{fontSize: 10, fill: '#94a3b8'}} 
              tickLine={false} 
              axisLine={false} 
              orientation="right" 
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              width={80}
            />
            
            <YAxis 
              yAxisId="volume"
              orientation="left"
              domain={volumeDomain}
              hide={true}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Indicators */}
            {showSMA && (
              <Line 
                type="monotone" 
                dataKey="sma20" 
                yAxisId="price"
                stroke={CHART_COLORS.sma} 
                dot={false} 
                strokeWidth={1.5} 
                name="SMA 20" 
                animationDuration={300}
                isAnimationActive={false}
              />
            )}
            {showEMA && (
              <Line 
                type="monotone" 
                dataKey="ema50" 
                yAxisId="price"
                stroke={CHART_COLORS.ema} 
                dot={false} 
                strokeWidth={1.5} 
                name="EMA 50" 
                animationDuration={300}
                isAnimationActive={false}
              />
            )}
            
            {/* Volume */}
            {showVol && (
              <Bar 
                dataKey="volume" 
                yAxisId="volume"
                barSize={4} 
                fill="url(#volumeGradient)" 
                opacity={0.4}
                radius={[1, 1, 0, 0]}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* SVG Overlay for Candlesticks */}
        <svg 
          className="absolute top-0 left-0 pointer-events-none" 
          width={chartDimensions.width || '100%'} 
          height={chartDimensions.height || '100%'}
          style={{ zIndex: 10 }}
        >
          {candlestickPaths.map((candle, index) => (
            <g key={index}>
              {/* Wick (High-Low line) */}
              <line
                x1={candle.centerX}
                y1={candle.wickTopY}
                x2={candle.centerX}
                y2={candle.wickBottomY}
                stroke={candle.color}
                strokeWidth={1.5}
              />
              {/* Body (Open-Close rectangle) */}
              <rect
                x={candle.x}
                y={candle.bodyTopY}
                width={candle.candleWidth}
                height={candle.bodyHeight}
                fill={candle.color}
                stroke={candle.color}
                strokeWidth={1}
                rx={1}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default FinancialChart;
