import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { ViewState, TimeRange, NewsItem } from "./types";
import { MarketProvider, useMarket } from "./contexts/MarketContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useAlerts } from "./hooks/useAlerts";
import { useMarketData } from "./hooks/useMarketData";
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import AssetList from "./components/Layout/AssetList";
import Notifications from "./components/Layout/Notifications";
import AuthModal from "./components/AuthModal";
import ChatWidget from "./components/ChatWidget";
import { getMarketAnalysis } from "./services/geminiService";
import { generateChartData, generateOptionsChain } from "./constants";
import {
  formatCurrency,
  formatPercentage,
  downloadCSV,
  generateCSV,
  filterAssets,
} from "./utils/helpers";
import { LoadingSpinner, EmptyState } from "./components/UI";

// Lazy load heavy components
const FinancialChart = lazy(() => import("./components/FinancialChart"));
const AssetDetails = lazy(() => import("./components/AssetDetails"));
const OptionsChain = lazy(() => import("./components/OptionsChain"));
const ForexConverter = lazy(() => import("./components/ForexConverter"));
const AlertManager = lazy(() => import("./components/AlertManager"));
const Analytics = lazy(() => import("./components/Analytics"));

// Main App Content (uses contexts)
const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [news] = useState<NewsItem[]>([
    {
      id: "1",
      headline: "Fed signals rate cuts may come sooner than expected",
      source: "MarketWatch",
      time: "10m ago",
      sentiment: "positive",
    },
    {
      id: "2",
      headline: "Tech sector faces volatility amidst earnings week",
      source: "Bloomberg",
      time: "25m ago",
      sentiment: "neutral",
    },
    {
      id: "3",
      headline: "Crypto markets rally as Bitcoin breaks resistance",
      source: "CoinDesk",
      time: "1h ago",
      sentiment: "positive",
    },
  ]);

  const { user, login, logout } = useAuth();
  const {
    marketData,
    selectedAsset,
    chartData,
    setSelectedAsset,
    updateChartData,
    getFilteredAssets,
  } = useMarket();
  const {
    alerts,
    notifications,
    addAlert,
    removeAlert,
    triggerNotification,
    removeNotification,
    loading: alertsLoading,
  } = useAlerts();

  useMarketData();
  useRealtimeUpdates();

  // Listen for auth logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  const handleAssetSelect = useCallback(
    async (asset: typeof selectedAsset) => {
      setSelectedAsset(asset);
      setMobileMenuOpen(false);

      setLoadingAnalysis(true);
      setAiAnalysis("");
      const analysis = await getMarketAnalysis(
        asset,
        user,
        "User requested live advisory."
      );
      setAiAnalysis(analysis);
      setLoadingAnalysis(false);
    },
    [setSelectedAsset, user]
  );

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      let points = 50;
      if (range === "1W") points = 100;
      if (range === "1M") points = 150;
      updateChartData(points);
    },
    [updateChartData]
  );

  const handleDownloadReport = useCallback(() => {
    const headers = ["Symbol", "Type", "Price", "Change%", "Holdings", "Value"];
    const rows = marketData.map((m) => {
      return [
        m.symbol,
        m.type,
        formatCurrency(m.price),
        formatPercentage(m.changePercent, { showSign: false }),
        0,
        0,
      ];
    });

    const csvContent = generateCSV(headers, rows);
    downloadCSV(csvContent, "dk_wealth_report.csv");
    triggerNotification("📄 Report Downloaded!");
  }, [marketData, triggerNotification]);

  const filteredAssets = useMemo(() => {
    const assetType =
      currentView === "stocks"
        ? "stock"
        : currentView === "crypto"
        ? "crypto"
        : currentView === "forex"
        ? "forex"
        : undefined;
    return filterAssets(marketData, assetType, searchQuery);
  }, [currentView, searchQuery, marketData]);

  const renderChartSection = useCallback(
    () => (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-market-card p-4 sm:p-6 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-xl">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {selectedAsset.symbol}
              </h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700 uppercase tracking-wider whitespace-nowrap">
                {selectedAsset.type}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-400 font-medium truncate">
              {selectedAsset.name}
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-3xl sm:text-4xl font-mono text-white tracking-tighter transition-all duration-300">
              $
              {selectedAsset.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </div>
            <div
              className={`text-base sm:text-lg font-bold flex items-center sm:justify-end gap-1 ${
                selectedAsset.changePercent >= 0
                  ? "text-market-up"
                  : "text-market-down"
              }`}
            >
              {selectedAsset.changePercent > 0 ? "↑" : "↓"}
              {selectedAsset.change.toFixed(2)} (
              {selectedAsset.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4 sm:gap-6">
            <Suspense fallback={<LoadingSpinner />}>
              <FinancialChart
                data={chartData}
                symbol={selectedAsset.symbol}
                onRangeChange={handleTimeRangeChange}
              />
              <AssetDetails asset={selectedAsset} />
            </Suspense>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
            <Suspense fallback={<LoadingSpinner />}>
              <AlertManager
                currentAsset={selectedAsset}
                alerts={alerts}
                onAddAlert={addAlert}
                onRemoveAlert={removeAlert}
                loading={alertsLoading}
              />
            </Suspense>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group hover:border-market-accent transition-colors shadow-2xl">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3">
            ⭐ DK Advisor Analysis
          </h3>
          {loadingAnalysis ? (
            <div className="animate-pulse space-y-2">
              <div className="h-2 bg-slate-700 rounded w-3/4"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-700 rounded w-5/6"></div>
            </div>
          ) : (
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {aiAnalysis ||
                "Select an asset to generate a personalized strategy report."}
            </div>
          )}
        </div>
      </div>
    ),
    [
      selectedAsset,
      chartData,
      handleTimeRangeChange,
      alerts,
      addAlert,
      removeAlert,
      loadingAnalysis,
      aiAnalysis,
    ]
  );

  const renderNewsFeed = useCallback(
    () => (
      <div className="bg-market-card border border-slate-700 rounded-xl p-4 h-full flex flex-col">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          📰 Market News
        </h3>
        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
          {news.map((n) => (
            <div
              key={n.id}
              className="border-b border-slate-800 pb-3 last:border-0"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-slate-500">
                  {n.source} • {n.time}
                </span>
                <span
                  className={`text-xs ${
                    n.sentiment === "positive"
                      ? "text-emerald-500"
                      : n.sentiment === "negative"
                      ? "text-rose-500"
                      : "text-amber-500"
                  }`}
                >
                  {n.sentiment === "positive"
                    ? "↑"
                    : n.sentiment === "negative"
                    ? "↓"
                    : "→"}
                </span>
              </div>
              <p className="text-sm text-slate-300 hover:text-white cursor-pointer transition-colors leading-tight">
                {n.headline}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
    [news]
  );

  return (
    <div className="min-h-screen bg-market-dark flex text-slate-200 font-sans selection:bg-market-accent selection:text-white relative overflow-hidden">
      {!user && <AuthModal />}
      <Notifications
        notifications={notifications}
        onRemove={removeNotification}
      />

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden opacity-100 transition-opacity duration-500 relative z-10">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setMobileMenuOpen(true)}
          onDownloadReport={handleDownloadReport}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-24">
            {currentView === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                  {renderChartSection()}
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                  <AssetList
                    data={filteredAssets.slice(0, 8)}
                    title="Market Movers"
                    selectedSymbol={selectedAsset.symbol}
                    onAssetSelect={handleAssetSelect}
                  />
                  {renderNewsFeed()}
                  <div className="h-auto sm:h-64">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ForexConverter marketData={marketData} />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}

            {(currentView === "stocks" ||
              currentView === "crypto" ||
              currentView === "forex") && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="lg:col-span-1 h-auto lg:h-[600px] order-2 lg:order-1">
                  <AssetList
                    data={filteredAssets}
                    title={`Top ${currentView}`}
                    selectedSymbol={selectedAsset.symbol}
                    onAssetSelect={handleAssetSelect}
                  />
                </div>
                <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-1 lg:order-2">
                  {renderChartSection()}
                  {currentView === "forex" && (
                    <Suspense fallback={<LoadingSpinner />}>
                      <ForexConverter marketData={marketData} />
                    </Suspense>
                  )}
                </div>
              </div>
            )}

            {currentView === "options" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-900/50 to-slate-900 border border-blue-800 p-6 rounded-xl">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Options Derivatives
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Analyze option chains, Greeks (Delta, Gamma), and implied
                    volatility.
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 h-[600px]">
                    <AssetList
                      data={getFilteredAssets("stock", searchQuery)}
                      title="Underlying Assets"
                      selectedSymbol={selectedAsset.symbol}
                      onAssetSelect={handleAssetSelect}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Suspense fallback={<LoadingSpinner />}>
                      <OptionsChain
                        chain={generateOptionsChain(selectedAsset.price)}
                        symbol={selectedAsset.symbol}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            )}

            {currentView === "analytics" && (
              <Suspense fallback={<LoadingSpinner />}>
                <Analytics marketData={marketData} />
              </Suspense>
            )}

            {currentView === "alerts" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-800/50 p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      🔔 Alerts Center
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Manage your price targets and notifications.
                    </p>
                  </div>
                  <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-white font-bold">
                      {alerts.filter((a) => a.active).length}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {" "}
                      Active Alerts
                    </span>
                  </div>
                </div>
                <div className="bg-market-card border border-slate-700 rounded-xl overflow-hidden">
                  <div className="p-6">
                    {alerts.length === 0 ? (
                      <div className="text-center py-16 text-slate-500">
                        <p className="text-lg font-medium text-slate-400">
                          No alerts configured
                        </p>
                        <p className="text-sm">
                          Go to Stocks to set price alerts.
                        </p>
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
                          {alerts.map((alert) => (
                            <tr
                              key={alert.id}
                              className="hover:bg-slate-800/30"
                            >
                              <td className="p-4 font-bold text-white">
                                {alert.symbol}
                              </td>
                              <td className="p-4 text-slate-300">
                                {alert.condition.toUpperCase()}
                              </td>
                              <td className="p-4 font-mono text-white">
                                ${alert.targetPrice.toFixed(2)}
                              </td>
                              <td className="p-4">
                                {alert.active ? (
                                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/50">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                                    Triggered
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => removeAlert(alert.id)}
                                  className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-slate-800 rounded"
                                >
                                  🗑️
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
          </div>
        </div>
      </main>

      <ChatWidget
        chatCount={chatCount}
        incrementChat={() => setChatCount((c) => c + 1)}
        user={user}
      />
    </div>
  );
};

// Main App with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <MarketProvider>
        <AppContent />
      </MarketProvider>
    </AuthProvider>
  );
};

export default App;
