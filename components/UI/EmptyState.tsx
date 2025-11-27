import React, { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-16 text-slate-500 flex flex-col items-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="text-lg font-medium text-slate-400">{title}</p>
      {description && <p className="text-sm mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

