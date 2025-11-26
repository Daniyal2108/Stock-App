import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, TrendingUp, Bitcoin, DollarSign, Activity, Settings, Search, Menu, Star, Download, BarChart2, BrainCircuit, Bell, User as UserIcon, LogOut, Trash2, Briefcase, Newspaper, ArrowUpRight } from 'lucide-react';
import { ViewState, MarketData, UserProfile, MarketAlert, TimeRange, CandleData, PortfolioItem, NewsItem } from './types';
import { MOCK_STOCKS, MOCK_CRYPTO, MOCK_FOREX, generateChartData, generateOptionsChain } from './constants';
import FinancialChart from './components/FinancialChart';
import OptionsChain from './components/OptionsChain';
import ChatWidget from './components/ChatWidget';
import AssetDetails from './components/AssetDetails';
import ForexConverter from './components/ForexConverter';
import AuthModal from './components/AuthModal';
import AlertManager from './components/AlertManager';
import TradePanel from './components/TradePanel';
import PortfolioSummary from './components/PortfolioSummary';
import { getMarketAnalysis } from './services/geminiService';
import { fetchRealCryptoPrices, fetchRealForexRates, fetchTopCoins, fetchRealStockPrices } from './services/marketDataService';

const App: React.FC = () => {
  // --- STATE ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Market Data State
  const [marketData, setMarketData] = useState<MarketData[]>([...MOCK_STOCKS, ...MOCK_CRYPTO, ...MOCK_FOREX]);
  const [selectedAsset, setSelectedAsset] = useState<MarketData>(MOCK_STOCKS[0]);
  const [chartData, setChartData] = useState<CandleData[]>(generateChartData(selectedAsset.price));
  
  // Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  
  // Features State
  const [chatCount, setChatCount] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Alerts State
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // News State
  const [news, setNews] = useState<NewsItem[]>([
    { id: '1', headline: "Fed signals rate cuts may come sooner than expected", source: "MarketWatch", time: "10m ago", sentiment: "positive"},
    { id: '2', headline: "Tech sector faces volatility amidst earnings week", source: "Bloomberg", time: "25m ago", sentiment: "neutral"},
    { id: '3', headline: "Crypto markets rally as Bitcoin breaks resistance", source: "CoinDesk", time: "1h ago", sentiment: "positive"},
  ]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const initData = async () => {
        // 1. Fetch Top 100 Crypto Coins (Replaces Mock Data)
        const topCoins = await fetchTopCoins();
        
        // 2. Fetch Live Forex
        const forexRates = await fetchRealForexRates();

        // 3. Fetch Live Stocks
        const stockSymbols = MOCK_STOCKS.map(s => s.symbol);
        const realStockPrices = await fetchRealStockPrices(stockSymbols);
        
        setMarketData(prevData => {
            // Update Stocks
            const stocks = prevData.filter(a => a.type === 'stock').map(stock => {
                if (realStockPrices[stock.symbol]) {
                    return {
                        ...stock,
                        price: realStockPrices[stock.symbol]!.price,
                        change: realStockPrices[stock.symbol]!.change,
                        changePercent: realStockPrices[stock.symbol]!.changePercent,
                    };
                }
                return stock;
            });
            
            // If API successful, use topCoins, otherwise fallback to existing crypto mocks
            const cryptos = topCoins.length > 0 ? topCoins : prevData.filter(a => a.type === 'crypto');
            
            // Update Forex
            const forex = prevData.filter(a => a.type === 'forex').map(asset => {
                 if (forexRates[asset.symbol]) {
                    return { ...asset, price: forexRates[asset.symbol]! };
                }
                return asset;
            });

            return [...stocks, ...cryptos, ...forex];
        });
    };
    
    initData();
  }, []);

  // --- LIVE STOCK POLLER (Every 15s) ---
  useEffect(() => {
    const updateStocks = async () => {
        const stockSymbols = MOCK_STOCKS.map(s => s.symbol);
        const realPrices = await fetchRealStockPrices(stockSymbols);
        
        setMarketData(prev => prev.map(a => {
            if (a.type === 'stock' && realPrices[a.symbol]) {
                return {
                    ...a,
                    price: realPrices[a.symbol]!.price,
                    change: realPrices[a.symbol]!.change,
                    changePercent: realPrices[a.symbol]!.changePercent,
                };
            }
            return a;
        }));
    };

    const interval = setInterval(updateStocks, 15000); 
    return () => clearInterval(interval);
  }, []);


  // --- REALTIME ENGINE (Simulation for Crypto/Forex Only) ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Market Data Prices
      setMarketData(prevData => {
        return prevData.map(asset => {
          // CRITICAL FIX: Do not simulate stock prices. Rely on API.
          if (asset.type === 'stock') return asset;

          const volatility = asset.type === 'crypto' ? 0.0002 : 0.00005; 
          const move = (Math.random() - 0.5) * volatility * asset.price;
          const newPrice = asset.price + move;
          
          return {
            ...asset,
            price: newPrice,
            change: asset.change + move,
            changePercent: ((asset.change + move) / (asset.price - asset.change)) * 100
          };
        });
      });

      // 2. Update Charts if active
      setChartData(prev => {
        const lastCandle = prev[prev.length - 1];
        // If selected asset is stock, do not generate fake ticks unless we want to smooth out the API jumps.
        // For now, we will keep chart static for stocks to avoid "fake" movement complaints.
        if (selectedAsset.type === 'stock') return prev;

        const volatility = lastCandle.close * 0.001;
        const move = (Math.random() - 0.5) * volatility;
        const newClose = lastCandle.close + move;
        
        const updatedCandle = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
          volume: lastCandle.volume + Math.floor(Math.random() * 100)
        };
        
        // 5% chance to create a new candle
        if (Math.random() > 0.95) {
             return [...prev.slice(1), updatedCandle, {
               ...updatedCandle, 
               time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               open: newClose
             }];
        }
        
        return [...prev.slice(0, -1), updatedCandle];
      });
      
      // 3. Random News update (Simulated)
      if(Math.random() > 0.995) { // Slightly lower freq
         const sources = ["Reuters", "CNBC", "WSJ", "Bloomberg"];
         const sentiments: ('positive'|'negative'|'neutral')[] = ["positive", "negative", "neutral"];
         const newHeadline = {
             id: Date.now().toString(),
             headline: `Market Alert: ${selectedAsset.symbol} experiencing high volume trading`,
             source: sources[Math.floor(Math.random()*sources.length)],
             time: "Just now",
             sentiment: sentiments[Math.floor(Math.random()*sentiments.length)]
         };
         setNews(prev => [newHeadline, ...prev.slice(0, 4)]);
      }

    }, 1000); // 1 Second tick

    return () => clearInterval(interval);
  }, [selectedAsset.symbol, selectedAsset.type]);

  // --- ALERT CHECKER ---
  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.active) return;
      const asset = marketData.find(m => m.symbol === alert.symbol);
      if (asset) {
        if (alert.condition === 'above' && asset.price >= alert.targetPrice) {
          triggerNotification(`🚀 ${asset.symbol} crossed ABOVE ${alert.targetPrice.toFixed(2)}!`);
          deactivateAlert(alert.id);
        } else if (alert.condition === 'below' && asset.price <= alert.targetPrice) {
          triggerNotification(`🔻 ${asset.symbol} dropped BELOW ${alert.targetPrice.toFixed(2)}!`);
          deactivateAlert(alert.id);
        }
      }
    });
  }, [marketData, alerts]);

  // Sync selected asset
  useEffect(() => {
    const liveAsset = marketData.find(m => m.symbol === selectedAsset.symbol);
    if (liveAsset) {
        setSelectedAsset(liveAsset);
    }
  }, [marketData]);

  // --- ACTIONS ---

  const triggerNotification = (msg: string) => {
    setNotifications(prev => [...prev, msg]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n !== msg)), 5000);
  };

  const deactivateAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  const handleAssetSelect = async (asset: MarketData) => {
    setSelectedAsset(asset);
    setChartData(generateChartData(asset.price)); // Reset chart for new asset
    setMobileMenuOpen(false);
    
    setLoadingAnalysis(true);
    setAiAnalysis('');
    // Pass user profile and portfolio to AI
    const analysis = await getMarketAnalysis(asset, user, portfolio, "User requested live advisory.");
    setAiAnalysis(analysis);
    setLoadingAnalysis(false);
  };

  const handleTimeRangeChange = (range: TimeRange) => {
    let points = 50;
    if (range === '1W') points = 100;
    if (range === '1M') points = 150;
    setChartData(generateChartData(selectedAsset.price, points));
  };

  const handleTrade = (symbol: string, qty: number, side: 'buy' | 'sell') => {
      if (!user) return;
      const asset = marketData.find(m => m.symbol === symbol);
      if (!asset) return;
      
      const tradeValue = asset.price * qty;

      if (side === 'buy') {
          if (user.balance < tradeValue) {
              triggerNotification("❌ Insufficient Funds!");
              return;
          }
          // Update Portfolio
          const existing = portfolio.find(p => p.symbol === symbol);
          if (existing) {
              const totalCost = (existing.avgPrice * existing.quantity) + tradeValue;
              const totalQty = existing.quantity + qty;
              const newPortfolio = portfolio.map(p => p.symbol === symbol ? { ...p, quantity: totalQty, avgPrice: totalCost / totalQty } : p);
              setPortfolio(newPortfolio);
          } else {
              setPortfolio([...portfolio, { symbol, quantity: qty, avgPrice: asset.price, currentPrice: asset.price, type: asset.type }]);
          }
          // Update User Balance
          setUser({ ...user, balance: user.balance - tradeValue });
          triggerNotification(`✅ Bought ${qty} ${symbol}`);
      } else {
          // SELL
          const existing = portfolio.find(p => p.symbol === symbol);
          if (!existing || existing.quantity < qty) {
              triggerNotification("❌ Insufficient Holdings!");
              return;
          }
          if (existing.quantity === qty) {
              setPortfolio(portfolio.filter(p => p.symbol !== symbol));
          } else {
              setPortfolio(portfolio.map(p => p.symbol === symbol ? { ...p, quantity: p.quantity - qty } : p));
          }
          setUser({ ...user, balance: user.balance + tradeValue });
          triggerNotification(`✅ Sold ${qty} ${symbol}`);
      }
  };

  const handleDownloadReport = () => {
      const headers = "Symbol,Type,Price,Change%,Holdings,Value\n";
      const rows = marketData.map(m => {
          const holding = portfolio.find(p => p.symbol === m.symbol);
          return `${m.symbol},${m.type},${m.price.toFixed(2)},${m.changePercent.toFixed(2)}%,${holding ? holding.quantity : 0},${holding ? (holding.quantity * m.price).toFixed(2) : 0}`;
      }).join("\n");
      
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "dk_wealth_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerNotification("📄 Report Downloaded!");
  };

  // --- RENDERING HELPERS ---

  const getFilteredAssets = (type?: 'stock' | 'crypto' | 'forex') => {
    let data = marketData;
    if (type) {
      data = data.filter(a => a.type === type);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    return data;
  };

  const renderNavButton = (view: ViewState, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
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

  const renderAssetList = (data: MarketData[], title: string) => (
    <div className="bg-market-card rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col shadow-xl">
      <div className="p-4 border-b border-slate-700 font-semibold text-slate-300 flex justify-between items-center">
        <span>{title}</span>
        <Search size={16} className="text-slate-500"/>
      </div>
      <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
        {data.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No assets found.</div>
        ) : (
            data.map((asset) => (
            <div 
                key={asset.symbol} 
                onClick={() => handleAssetSelect(asset)}
                className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors flex justify-between items-center group ${selectedAsset.symbol === asset.symbol ? 'bg-slate-800 border-l-2 border-market-accent' : ''}`}
            >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                      {asset.symbol}
                      {portfolio.some(p => p.symbol === asset.symbol) && <Briefcase size={12} className="text-emerald-400"/>}
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">{asset.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono text-sm">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                  <div className={`text-xs font-bold ${asset.changePercent >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                      {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  const renderNewsFeed = () => (
      <div className="bg-market-card border border-slate-700 rounded-xl p-4 h-full flex flex-col">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Newspaper size={18} className="text-market-accent"/> Market News</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {news.map(n => (
                  <div key={n.id} className="border-b border-slate-800 pb-3 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-slate-500">{n.source} • {n.time}</span>
                          {n.sentiment === 'positive' && <TrendingUp size={12} className="text-emerald-500"/>}
                          {n.sentiment === 'negative' && <TrendingUp size={12} className="text-rose-500 rotate-180"/>}
                          {n.sentiment === 'neutral' && <Activity size={12} className="text-amber-500"/>}
                      </div>
                      <p className="text-sm text-slate-300 hover:text-white cursor-pointer transition-colors leading-tight">{n.headline}</p>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderChartSection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-market-card p-6 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">{selectedAsset.symbol}</h1>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700 uppercase tracking-wider">{selectedAsset.type}</span>
              </div>
              <p className="text-slate-400 font-medium">{selectedAsset.name}</p>
          </div>
          <div className="text-right w-full md:w-auto">
              <div className="text-4xl font-mono text-white tracking-tighter transition-all duration-300">${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
              <div className={`text-lg font-bold flex items-center justify-end gap-1 ${selectedAsset.changePercent >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                  {selectedAsset.changePercent > 0 ? <TrendingUp size={20} /> : <Activity size={20} />}
                  {selectedAsset.change.toFixed(2)} ({selectedAsset.changePercent.toFixed(2)}%)
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
           <FinancialChart data={chartData} symbol={selectedAsset.symbol} onRangeChange={handleTimeRangeChange} />
           <AssetDetails asset={selectedAsset} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
           {user ? (
             <TradePanel asset={selectedAsset} user={user} onTrade={handleTrade} />
           ) : (
             <div className="bg-slate-800 p-6 rounded-xl text-center border border-slate-700 shadow-lg">
                <Briefcase size={48} className="mx-auto text-slate-600 mb-4"/>
                <p className="text-slate-300 font-bold mb-2">Ready to Trade?</p>
                <p className="text-slate-500 text-sm mb-4">Login to access {selectedAsset.symbol} markets and manage your portfolio.</p>
                <button onClick={() => setUser(null)} className="text-market-accent font-bold hover:underline">Sign In to Trade</button>
             </div>
           )}
           <AlertManager 
             currentAsset={selectedAsset} 
             alerts={alerts}
             onAddAlert={(a) => { setAlerts(prev => [...prev, a]); triggerNotification("Alert Set! 🔔"); }}
             onRemoveAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
           />
        </div>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group hover:border-market-accent transition-colors shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit size={100} />
          </div>
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 flex items-center gap-2">
            <Star size={18} className="text-amber-400" fill="currentColor" /> DK Advisor Analysis
          </h3>
          {loadingAnalysis ? (
              <div className="animate-pulse space-y-2">
                  <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-700 rounded w-full"></div>
                  <div className="h-2 bg-slate-700 rounded w-5/6"></div>
              </div>
          ) : (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                  {aiAnalysis || "Select an asset to generate a personalized strategy report based on your profile."}
              </div>
          )}
      </div>
    </div>
  );

  // Functional Backtesting Logic
  const runBacktest = () => {
     // Simple SMA Crossover Logic Simulation
     let capital = 10000;
     let shares = 0;
     let initialCapital = 10000;
     const buySignal = [];
     const sellSignal = [];
     
     for(let i = 20; i < chartData.length; i++) {
         const prev = chartData[i-1];
         const curr = chartData[i];
         
         // Buy Signal (SMA20 crosses above EMA50) - Simplified for demo
         if(prev.sma20! < prev.ema50! && curr.sma20! > curr.ema50! && capital > 0) {
             shares = capital / curr.close;
             capital = 0;
             buySignal.push(i);
         }
         // Sell Signal
         else if (prev.sma20! > prev.ema50! && curr.sma20! < curr.ema50! && shares > 0) {
             capital = shares * curr.close;
             shares = 0;
             sellSignal.push(i);
         }
     }
     const finalValue = capital + (shares * chartData[chartData.length-1].close);
     const returnPct = ((finalValue - initialCapital) / initialCapital) * 100;
     return { finalValue, returnPct, buyCount: buySignal.length, sellCount: sellSignal.length };
  };

  return (
    <div className="min-h-screen bg-market-dark flex text-slate-200 font-sans selection:bg-market-accent selection:text-white relative overflow-hidden">
      
      {/* AUTH OVERLAY */}
      {!user && <AuthModal onLogin={setUser} />}

      {/* NOTIFICATIONS */}
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 pointer-events-none">
        {notifications.map((note, i) => (
          <div key={i} className="bg-market-card border border-market-accent text-white px-4 py-3 rounded-lg shadow-xl animate-bounce-in flex items-center gap-2 pointer-events-auto">
            <Bell size={16} className="text-market-accent"/> {note}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">DK Wealth</h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><BrainCircuit size={12}/> GPT-5 Powered</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {renderNavButton('dashboard', 'Dashboard', LayoutDashboard)}
          {renderNavButton('portfolio', 'My Portfolio', Briefcase)}
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
                <button onClick={() => setUser(null)} className="text-slate-400 hover:text-white transition-colors">
                   <LogOut size={18} />
                </button>
             </div>
           ) : (
             <div className="text-center text-xs text-slate-500">Not logged in</div>
           )}
        </div>
      </aside>

      {/* Overlay for Mobile Menu */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden opacity-100 transition-opacity duration-500 relative z-10">
        
        {/* Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu />
          </button>
          
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker (e.g., AAPL, BTC)..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-market-accent outline-none text-white placeholder-slate-500 shadow-inner transition-all hover:bg-slate-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
                onClick={handleDownloadReport}
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

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
          
          <div className="max-w-7xl mx-auto pb-24">
            
            {currentView === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                   {user && <PortfolioSummary portfolio={portfolio} marketData={marketData} cashBalance={user.balance} />}
                   {renderChartSection()}
                </div>
                <div className="lg:col-span-1 space-y-6">
                    {renderAssetList(getFilteredAssets().slice(0, 8), "Market Movers")}
                    {renderNewsFeed()}
                    <div className="h-64">
                        <ForexConverter marketData={marketData} />
                    </div>
                </div>
              </div>
            )}

            {currentView === 'portfolio' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Portfolio</h2>
                    {user && <PortfolioSummary portfolio={portfolio} marketData={marketData} cashBalance={user.balance} />}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <div className="bg-market-card border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-64">
                             <h3 className="font-bold text-white mb-4">Performance History</h3>
                             <div className="text-5xl font-bold text-emerald-500 mb-2">+12.4%</div>
                             <p className="text-slate-400 text-sm">All Time Return vs S&P 500</p>
                             <div className="w-full h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[65%]"></div>
                             </div>
                         </div>
                         <div className="bg-market-card border border-slate-700 rounded-xl p-6 h-64 overflow-hidden">
                            <h3 className="font-bold text-white mb-4">Transaction Log</h3>
                            <div className="text-xs text-slate-500">
                                <p className="py-2 border-b border-slate-800">Bought 10 AAPL @ $175.20 - <span className="text-slate-400">2h ago</span></p>
                                <p className="py-2 border-b border-slate-800">Sold 0.5 BTC @ $64,200 - <span className="text-slate-400">Yesterday</span></p>
                                <p className="py-2">Deposit $100,000 - <span className="text-slate-400">Start</span></p>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {(currentView === 'stocks' || currentView === 'crypto' || currentView === 'forex') && (
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1 h-[600px]">{renderAssetList(getFilteredAssets(currentView === 'forex' ? 'forex' : (currentView === 'crypto' ? 'crypto' : 'stock')), `Top ${currentView}`)}</div>
                  <div className="lg:col-span-3 space-y-6">
                     {renderChartSection()}
                     {currentView === 'forex' && <div className="h-auto"><ForexConverter marketData={marketData} /></div>}
                  </div>
               </div>
            )}

            {currentView === 'options' && (
              <div className="space-y-6">
                 <div className="bg-gradient-to-r from-blue-900/50 to-slate-900 border border-blue-800 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-2">Options Derivatives</h2>
                    <p className="text-slate-400 text-sm">Analyze option chains, Greeks (Delta, Gamma), and implied volatility.</p>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 h-[600px]">{renderAssetList(getFilteredAssets('stock'), "Underlying Assets")}</div>
                    <div className="lg:col-span-2">
                       <OptionsChain chain={generateOptionsChain(selectedAsset.price)} symbol={selectedAsset.symbol} />
                    </div>
                 </div>
              </div>
            )}

            {currentView === 'analytics' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-market-card p-6 rounded-xl border border-slate-700">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><BarChart2 className="text-market-accent"/> Live Backtesting (SMA Strategy)</h3>
                            <div className="flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg p-8">
                                <p className="mb-4 text-sm">Running simulation on {selectedAsset.symbol} (1Y Data)...</p>
                                {(() => {
                                    const { finalValue, returnPct, buyCount, sellCount } = runBacktest();
                                    return (
                                        <div className="text-center">
                                            <div className="text-xs text-slate-400 mb-1">Simulated Return</div>
                                            <div className={`text-4xl font-bold mb-2 ${returnPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {returnPct > 0 ? '+' : ''}{returnPct.toFixed(2)}%
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                                                <div className="bg-slate-800 p-2 rounded">
                                                    <span className="block text-slate-400">Buys</span>
                                                    <span className="font-bold text-white">{buyCount}</span>
                                                </div>
                                                <div className="bg-slate-800 p-2 rounded">
                                                    <span className="block text-slate-400">Sells</span>
                                                    <span className="font-bold text-white">{sellCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                        <div className="bg-market-card p-6 rounded-xl border border-slate-700">
                             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white"><BrainCircuit className="text-purple-500"/> Market Sentiment</h3>
                             <p className="text-slate-400 text-sm mb-4">Real-time aggregation of news sentiment and social signals.</p>
                             
                             <div className="space-y-4">
                                 <div className="flex items-center gap-4">
                                    <span className="text-xs w-12 text-right text-emerald-500">Bullish</span>
                                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full w-[65%] animate-pulse"></div>
                                    </div>
                                    <span className="text-xs w-8 font-bold text-white">65%</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-xs w-12 text-right text-rose-500">Bearish</span>
                                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-rose-500 h-full w-[25%]"></div>
                                    </div>
                                    <span className="text-xs w-8 font-bold text-white">25%</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-xs w-12 text-right text-amber-500">Neutral</span>
                                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full w-[10%]"></div>
                                    </div>
                                    <span className="text-xs w-8 font-bold text-white">10%</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                    {renderChartSection()}
                </div>
            )}

            {currentView === 'alerts' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-800/50 p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Bell className="text-amber-500" /> Alerts Center
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Manage your price targets and notifications.</p>
                        </div>
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                            <span className="text-white font-bold">{alerts.filter(a => a.active).length}</span> <span className="text-slate-500 text-sm">Active Alerts</span>
                        </div>
                    </div>
            
                    <div className="bg-market-card border border-slate-700 rounded-xl overflow-hidden">
                         <div className="p-6">
                            {alerts.length === 0 ? (
                                <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                       <Bell size={24} className="text-slate-600" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-400">No alerts configured</p>
                                    <p className="text-sm">Go to Stocks to set price alerts.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-800">
                                        <tr>
                                            <th className="p-4">Asset</th>
                                            <th className="p-4">Condition</th>
                                            <th className="p-4">Target Price</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {alerts.map(alert => (
                                            <tr key={alert.id} className="hover:bg-slate-800/30">
                                                <td className="p-4 font-bold text-white">{alert.symbol}</td>
                                                <td className="p-4 text-slate-300 flex items-center gap-2">
                                                    {alert.condition === 'above' ? <TrendingUp size={14} className="text-market-up"/> : <TrendingUp size={14} className="text-market-down rotate-180"/>}
                                                    {alert.condition.toUpperCase()}
                                                </td>
                                                <td className="p-4 font-mono text-white">${alert.targetPrice.toFixed(2)}</td>
                                                <td className="p-4">
                                                    {alert.active ? (
                                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/50">Active</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">Triggered</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => deleteAlert(alert.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-slate-800 rounded">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                         </div>
                    </div>
                </div>
            )}

            {/* Global Footer */}
            <footer className="mt-12 text-center border-t border-slate-800 pt-8 pb-8">
              <p className="text-slate-500 font-semibold mb-2">Realtime Stocks, Options, Crypto and Forex by DK</p>
              <p className="text-slate-600 text-xs max-w-2xl mx-auto leading-relaxed">
                DISCLAIMER: This is a simulation. Paper trading only. No real funds are involved. 
                The "DK Advisor" is an AI model and does not constitute professional legal or financial advice.
              </p>
            </footer>
          </div>
        </div>
      </main>

      {/* Persistent Chat */}
      <ChatWidget 
        chatCount={chatCount} 
        incrementChat={() => setChatCount(c => c + 1)} 
        user={user}
        portfolio={portfolio}
      />
    </div>
  );
};

export default App;