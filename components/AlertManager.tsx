import React, { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import { MarketAlert, MarketData } from '../types';

interface AlertManagerProps {
  currentAsset: MarketData;
  alerts: MarketAlert[];
  onAddAlert: (alert: MarketAlert) => void;
  onRemoveAlert: (id: string) => void;
}

const AlertManager: React.FC<AlertManagerProps> = ({ currentAsset, alerts, onAddAlert, onRemoveAlert }) => {
  const [targetPrice, setTargetPrice] = useState<string>(currentAsset.price.toString());
  const [condition, setCondition] = useState<'above'|'below'>('above');

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price)) return;

    const newAlert: MarketAlert = {
      id: Date.now().toString(),
      symbol: currentAsset.symbol,
      targetPrice: price,
      condition,
      active: true
    };
    onAddAlert(newAlert);
  };

  const assetAlerts = alerts.filter(a => a.symbol === currentAsset.symbol);

  return (
    <div className="bg-market-card border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 text-white font-semibold">
        <Bell size={18} className="text-amber-500" />
        <h3>Price Alerts</h3>
      </div>

      {/* Input Form */}
      <div className="flex gap-2 mb-4">
        <select 
          value={condition}
          onChange={(e) => setCondition(e.target.value as 'above'|'below')}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 outline-none"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input 
          type="number" 
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 outline-none"
          placeholder="Price..."
        />
        <button 
          onClick={handleAdd}
          className="bg-market-accent hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {assetAlerts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-2">No active alerts for {currentAsset.symbol}</p>
        ) : (
          assetAlerts.map(alert => (
            <div key={alert.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-300">
                {alert.condition === 'above' ? '≥' : '≤'} <span className="font-mono font-bold text-white">{alert.targetPrice}</span>
              </span>
              <button onClick={() => onRemoveAlert(alert.id)} className="text-slate-500 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertManager;