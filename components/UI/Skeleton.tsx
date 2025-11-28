import React from "react";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}) => {
  const baseStyles = "bg-slate-700/50 rounded";
  
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-pulse",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton components
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? "75%" : "100%"}
        className="h-4"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
}> = ({
  className = "",
  showHeader = true,
  showContent = true,
  showFooter = false,
}) => (
  <div className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700 ${className}`}>
    {showHeader && (
      <div className="mb-4">
        <Skeleton variant="text" width="60%" height={20} className="mb-2" />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    )}
    {showContent && (
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
      </div>
    )}
    {showFooter && (
      <div className="mt-4 pt-4 border-t border-slate-700">
        <Skeleton variant="text" width="50%" height={16} />
      </div>
    )}
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`bg-slate-800/50 rounded-lg p-6 border border-slate-700 ${className}`}>
    <div className="mb-4">
      <Skeleton variant="text" width="40%" height={24} className="mb-2" />
      <Skeleton variant="text" width="60%" height={16} />
    </div>
    <div className="h-64 bg-slate-900/50 rounded flex items-end justify-around gap-1 p-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          width="4%"
          height={`${Math.random() * 60 + 20}%`}
          className="rounded-t"
        />
      ))}
    </div>
  </div>
);

export const SkeletonStatCard: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700 ${className}`}>
    <div className="flex items-center justify-between mb-2">
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
    <Skeleton variant="text" width="60%" height={20} className="mb-1" />
    <Skeleton variant="text" width="80%" height={16} />
  </div>
);

export const SkeletonListItem: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`flex items-center gap-4 p-3 border-b border-slate-700/50 ${className}`}>
    <Skeleton variant="circular" width={40} height={40} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="30%" height={16} />
      <Skeleton variant="text" width="50%" height={14} />
    </div>
    <div className="text-right space-y-2">
      <Skeleton variant="text" width={80} height={18} />
      <Skeleton variant="text" width={60} height={14} />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = "" }) => (
  <div className={`bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
    {/* Header */}
    <div className="grid gap-4 p-4 border-b border-slate-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width="80%" height={16} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4 p-4 border-b border-slate-700/50 last:border-b-0"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={colIndex === 0 ? "60%" : "80%"}
            height={16}
          />
        ))}
      </div>
    ))}
  </div>
);

