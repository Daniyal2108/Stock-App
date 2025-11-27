import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';

interface NotificationsProps {
  notifications: string[];
  onRemove: (notification: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-2 sm:right-4 z-50 space-y-2 w-[calc(100vw-1rem)] sm:max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={`${notification}-${index}`}
          className="bg-market-card border border-slate-700 rounded-lg p-4 shadow-2xl animate-in slide-in-from-right duration-300 flex items-start gap-3"
        >
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <Bell size={16} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">{notification}</p>
          </div>
          <button
            onClick={() => onRemove(notification)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
