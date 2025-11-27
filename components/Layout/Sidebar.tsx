import React, { memo } from 'react';
import { LayoutDashboard, TrendingUp, Bitcoin, DollarSign, Activity, BarChart2, Bell, BrainCircuit, LogOut } from 'lucide-react';
import { ViewState } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onMobileMenuClose: () => void;
  mobileMenuOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = memo(({ currentView, onViewChange, onMobileMenuClose, mobileMenuOpen }) => {
  const { user, logout } = useAuth();

  const renderNavButton = (view: ViewState, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => { onViewChange(view); onMobileMenuClose(); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all ${
        currentView === view 
          ? 'bg-market-accent text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">DK Wealth</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><BrainCircuit size={12}/> GPT-5 Powered</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {renderNavButton('dashboard', 'Dashboard', LayoutDashboard)}
          {renderNavButton('stocks', 'Stocks', TrendingUp)}
          {renderNavButton('options', 'Options', Activity)}
          {renderNavButton('crypto', 'Crypto', Bitcoin)}
          {renderNavButton('forex', 'Forex', DollarSign)}
          {renderNavButton('analytics', 'Analytics', BarChart2)}
          {renderNavButton('alerts', 'Alerts', Bell)}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border border-slate-600">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold truncate text-white">{user.name}</div>
                <div className="text-xs text-emerald-400">${user.balance.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
              </div>
              <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-500">Not logged in</div>
          )}
        </div>
      </aside>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileMenuClose}></div>}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;

