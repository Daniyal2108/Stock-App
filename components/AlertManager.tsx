import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, X, Sparkles, Target, Zap } from 'lucide-react';
import { MarketAlert, MarketData } from '../types';
import { Button, Badge } from './UI';
import { formatCurrency } from '../utils/helpers';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface AlertManagerProps {
  currentAsset: MarketData;
  alerts: MarketAlert[];
  onAddAlert: (alert: MarketAlert) => void;
  onRemoveAlert: (id: string) => void;
  loading?: boolean;
}

const AlertManager: React.FC<AlertManagerProps> = ({ 
  currentAsset, 
  alerts, 
  onAddAlert, 
  onRemoveAlert,
  loading = false
}) => {
  const [targetPrice, setTargetPrice] = useState<string>(currentAsset.price.toFixed(2));
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Update target price when asset changes
  useEffect(() => {
    setTargetPrice(currentAsset.price.toFixed(2));
  }, [currentAsset.price]);

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    setIsAnimating(true);
    const newAlert: MarketAlert = {
      id: Date.now().toString(),
      symbol: currentAsset.symbol,
      targetPrice: price,
      condition,
      active: true
    };
    onAddAlert(newAlert);
    setShowForm(false);
    setShowModal(false);
    setTargetPrice(currentAsset.price.toFixed(2));
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const assetAlerts = alerts.filter(a => a.symbol === currentAsset.symbol);
  const activeAlerts = assetAlerts.filter(a => a.active);
  const triggeredAlerts = assetAlerts.filter(a => !a.active);

  const priceDifference = Math.abs(parseFloat(targetPrice) - currentAsset.price);
  const pricePercent = ((priceDifference / currentAsset.price) * 100).toFixed(1);

  // Alert Form Component (Reusable)
  const AlertForm = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={`${isModal ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-800/90 to-slate-900/90'} ${isModal ? 'p-6' : 'p-4 sm:p-5'} border-2 border-market-accent/30 rounded-xl ${isModal ? '' : 'mb-4 sm:mb-5'} animate-in slide-in-from-top duration-300 shadow-xl shadow-blue-500/10`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-market-accent/20 rounded-lg">
            <Target size={isMobile ? 16 : 18} className="text-market-accent" />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-white">Create Alert</span>
            <p className="text-xs text-slate-400">for {currentAsset.symbol}</p>
          </div>
      </div>
        <button 
          onClick={() => {
            setShowForm(false);
            setShowModal(false);
          }}
          className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
        >
          <X size={isMobile ? 16 : 18} />
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Condition Selector */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => setCondition('above')}
            className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
              condition === 'above'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <TrendingUp size={isMobile ? 16 : 18} />
            <span className="font-semibold">Above</span>
          </button>
          <button
            onClick={() => setCondition('below')}
            className={`flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
              condition === 'below'
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <TrendingDown size={isMobile ? 16 : 18} />
            <span className="font-semibold">Below</span>
          </button>
        </div>

        {/* Price Input */}
        <div className="relative">
          <label className="block text-xs sm:text-sm text-slate-400 mb-2">Target Price</label>
          <div className="relative">
            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg font-bold">$</span>
            <input 
              type="number" 
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-slate-900/50 border-2 border-slate-700 text-white text-base sm:text-lg font-bold rounded-xl pl-8 sm:pl-10 pr-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-market-accent focus:border-market-accent transition-all"
              placeholder="0.00"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
              <Sparkles size={isMobile ? 14 : 16} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap size={isMobile ? 12 : 14} className="text-amber-400" />
              <span className="text-xs sm:text-sm text-slate-400">Current:</span>
              <span className="text-sm sm:text-base font-bold text-white">{formatCurrency(currentAsset.price)}</span>
            </div>
            {priceDifference > 0 && (
              <span className="text-xs sm:text-sm text-slate-500">
                {condition === 'above' ? '↑' : '↓'} {pricePercent}% away
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            variant="primary"
            size={isMobile ? "sm" : "md"}
            onClick={handleAdd}
            fullWidth
            isLoading={loading}
            className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
          >
            <Sparkles size={isMobile ? 14 : 16} className="mr-2" />
            Create Alert
          </Button>
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "md"}
            onClick={() => {
              setShowForm(false);
              setShowModal(false);
            }}
            className="sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-market-card border border-slate-700 rounded-xl p-3 sm:p-4 md:p-5 w-full h-full flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <Bell size={isMobile ? 16 : 18} className="text-amber-500" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              )}
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">Price Alerts</h3>
            {activeAlerts.length > 0 && (
              <Badge variant="info" size="sm" className="flex-shrink-0">
                {activeAlerts.length}
              </Badge>
            )}
          </div>
          {!showForm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (isMobile || isTablet) {
                  setShowModal(true);
                } else {
                  setShowForm(true);
                }
              }}
              className="flex-shrink-0 text-xs sm:text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105"
            >
              <Plus size={isMobile ? 12 : 14} className="mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>

        {/* Inline Form - Desktop Only */}
        {showForm && !isMobile && !isTablet && (
          <div className="mb-4">
            <AlertForm />
          </div>
        )}

        {/* Active Alerts List - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
          {activeAlerts.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold sticky top-0 bg-market-card pb-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Active ({activeAlerts.length})
              </div>
              <div className="space-y-2">
                {activeAlerts.map((alert, index) => (
                  <div 
                    key={alert.id} 
                    className={`flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 p-2.5 sm:p-3 rounded-lg hover:border-emerald-500/50 transition-all ${
                      isAnimating && index === activeAlerts.length - 1 ? 'animate-in slide-in-from-right' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        alert.condition === 'above' 
                          ? 'bg-emerald-500/20' 
                          : 'bg-rose-500/20'
                      }`}>
                        {alert.condition === 'above' ? (
                          <TrendingUp size={isMobile ? 12 : 14} className="text-emerald-400" />
                        ) : (
                          <TrendingDown size={isMobile ? 12 : 14} className="text-rose-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-300 truncate">
                          {alert.condition === 'above' ? 'Above' : 'Below'}
                        </div>
                        <div className="font-mono font-bold text-white text-xs sm:text-sm truncate">
                          {alert.condition === 'above' ? '≥' : '≤'} {formatCurrency(alert.targetPrice)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemoveAlert(alert.id)} 
                      className="text-slate-500 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0 ml-2"
                      title="Delete alert"
                    >
                      <Trash2 size={isMobile ? 12 : 14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Triggered Alerts */}
          {triggeredAlerts.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mt-3 pt-3 border-t border-slate-700">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
                Triggered ({triggeredAlerts.length})
              </div>
              <div className="space-y-2">
                {triggeredAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className="flex justify-between items-center bg-slate-800/30 border border-slate-700 p-2.5 sm:p-3 rounded-lg opacity-70"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-700/50 flex-shrink-0">
                        {alert.condition === 'above' ? (
                          <TrendingUp size={isMobile ? 12 : 14} className="text-slate-500" />
                        ) : (
                          <TrendingDown size={isMobile ? 12 : 14} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 truncate">
                          {alert.condition === 'above' ? 'Above' : 'Below'}
                        </div>
                        <div className="font-mono text-slate-500 text-xs sm:text-sm truncate">
                          {alert.condition === 'above' ? '≥' : '≤'} {formatCurrency(alert.targetPrice)}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemoveAlert(alert.id)} 
                      className="text-slate-600 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0 ml-2"
                      title="Delete alert"
                    >
                      <Trash2 size={isMobile ? 12 : 14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {assetAlerts.length === 0 && !showForm && (
            <div className="text-center py-4 sm:py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-800/50 mb-3">
                <Bell size={isMobile ? 20 : 24} className="text-slate-600" />
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mb-1 font-medium">
                No alerts for {currentAsset.symbol}
              </p>
              <p className="text-xs text-slate-600">
                Get notified instantly
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Mobile/Tablet */}
      {showModal && (isMobile || isTablet) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AlertForm isModal={true} />
      </div>
    </div>
      )}
    </>
  );
};

export default AlertManager;
