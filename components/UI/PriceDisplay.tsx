import React from 'react';
import { formatCurrency, getPriceChangeColor, getPriceChangeIcon } from '../../utils/helpers';

export interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showChange?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  change,
  changePercent,
  size = 'md',
  showChange = true,
  className = '',
}) => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const changeSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={`${className}`}>
      <div className={`${sizes[size]} font-mono text-white tracking-tighter transition-all duration-300`}>
        ${formatCurrency(price)}
      </div>
      {showChange && (
        <div
          className={`${changeSizes[size]} font-bold flex items-center gap-1 ${getPriceChangeColor(changePercent)}`}
        >
          {getPriceChangeIcon(changePercent)}
          {formatCurrency(change, { showSign: true })} ({formatPercentage(changePercent)})
        </div>
      )}
    </div>
  );
};

