import React, { memo } from 'react';
import { Search, Download, Menu } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuClick: () => void;
  onDownloadReport: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ searchQuery, onSearchChange, onMenuClick, onDownloadReport }) => {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <button className="md:hidden text-slate-400 hover:text-white" onClick={onMenuClick}>
        <Menu />
      </button>
      
      <div className="relative max-w-md w-full hidden md:block">
        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ticker (e.g., AAPL, BTC)..." 
          className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-market-accent outline-none text-white placeholder-slate-500 shadow-inner transition-all hover:bg-slate-700"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onDownloadReport}
          className="p-2 text-slate-400 hover:text-white flex items-center gap-2 hover:bg-slate-800 rounded-lg transition-colors" 
          title="Export CSV Report"
        >
          <Download size={20} /> <span className="text-xs hidden sm:inline font-medium">Report</span>
        </button>
        <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;

