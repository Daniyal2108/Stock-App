import React from 'react';
import { TimeRange } from '../../types';
import { TIME_RANGES } from '../../utils/constants';

export interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onRangeChange(range)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            selectedRange === range
              ? 'bg-market-accent text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

