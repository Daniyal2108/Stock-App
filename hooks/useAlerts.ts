import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { MarketAlert } from '../types';
import { useMarket } from '../contexts/MarketContext';
import { AuthContext } from '../contexts/AuthContext';
import { alertService, Alert } from '../services/alertService';
import { formatCurrency } from '../utils/helpers';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { marketData } = useMarket();
  const notificationTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Safely get user from auth context
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;

  // Fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const backendAlerts = await alertService.getAlerts();
      // Convert backend alerts to frontend format
      const formattedAlerts: MarketAlert[] = backendAlerts.map(alert => ({
        id: alert._id || alert.id || '',
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        active: alert.active,
      }));
      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Continue with empty alerts if API fails
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load alerts on mount and when user changes
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const addAlert = useCallback(async (alert: MarketAlert) => {
    if (!user) {
      // Fallback to local storage if not authenticated
      setAlerts(prev => [...prev, alert]);
      return;
    }

    try {
      const createdAlert = await alertService.createAlert({
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
      });
      
      setAlerts(prev => [...prev, {
        id: createdAlert._id || createdAlert.id || alert.id,
        symbol: createdAlert.symbol,
        targetPrice: createdAlert.targetPrice,
        condition: createdAlert.condition,
        active: createdAlert.active,
      }]);
    } catch (error: any) {
      console.error('Error creating alert:', error);
      // Fallback to local storage
      setAlerts(prev => [...prev, alert]);
    }
  }, [user]);

  const removeAlert = useCallback(async (id: string) => {
    if (!user) {
      // Fallback to local storage if not authenticated
      setAlerts(prev => prev.filter(a => a.id !== id));
      return;
    }

    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
      // Fallback to local storage
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  }, [user]);

  const deactivateAlert = useCallback(async (id: string) => {
    if (!user) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
      return;
    }

    try {
      await alertService.updateAlert(id, { active: false });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
    } catch (error) {
      console.error('Error deactivating alert:', error);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a));
    }
  }, [user]);

  const triggerNotification = useCallback((msg: string) => {
    // Clear existing timeout for this message if any
    const existingTimeout = notificationTimeoutsRef.current.get(msg);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    setNotifications(prev => [...prev, msg]);
    
    // Auto-remove notification after 5 seconds with cleanup
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== msg));
      notificationTimeoutsRef.current.delete(msg);
    }, 5000);
    
    notificationTimeoutsRef.current.set(msg, timeoutId);
    
    // Browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Price Alert', {
          body: msg,
          icon: '/favicon.ico',
        });
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  }, []);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      notificationTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      notificationTimeoutsRef.current.clear();
    };
  }, []);

  const removeNotification = useCallback((notification: string) => {
    setNotifications(prev => prev.filter(n => n !== notification));
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Check alerts against current market data
  useEffect(() => {
    alerts.forEach(alert => {
      if (!alert.active) return;
      
      const asset = marketData.find(m => m.symbol === alert.symbol);
      if (!asset) return;

      let triggered = false;
      
      if (alert.condition === 'above' && asset.price >= alert.targetPrice) {
        triggerNotification(
          `🚀 ${asset.symbol} crossed ABOVE ${formatCurrency(alert.targetPrice)}! Current: ${formatCurrency(asset.price)}`
        );
        triggered = true;
      } else if (alert.condition === 'below' && asset.price <= alert.targetPrice) {
        triggerNotification(
          `🔻 ${asset.symbol} dropped BELOW ${formatCurrency(alert.targetPrice)}! Current: ${formatCurrency(asset.price)}`
        );
        triggered = true;
      }

      if (triggered) {
        deactivateAlert(alert.id);
      }
    });
  }, [marketData, alerts, triggerNotification, deactivateAlert]);

  return {
    alerts,
    notifications,
    loading,
    addAlert,
    removeAlert,
    deactivateAlert,
    triggerNotification,
    removeNotification,
    refreshAlerts: fetchAlerts,
  };
};
