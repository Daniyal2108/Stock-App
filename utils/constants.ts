// Theme Constants
export const THEME = {
  colors: {
    primary: '#3b82f6',
    accent: '#3b82f6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    dark: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      disabled: '#64748b',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
} as const;

// Chart Colors
export const CHART_COLORS = {
  bullish: '#10b981',
  bearish: '#ef4444',
  sma: '#f59e0b',
  ema: '#ec4899',
  volume: '#64748b',
  pie: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'],
} as const;

// Time Ranges
export const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const;

// Asset Types
export const ASSET_TYPES = {
  STOCK: 'stock',
  CRYPTO: 'crypto',
  FOREX: 'forex',
} as const;

// View States
export const VIEW_STATES = {
  DASHBOARD: 'dashboard',
  STOCKS: 'stocks',
  OPTIONS: 'options',
  CRYPTO: 'crypto',
  FOREX: 'forex',
  ANALYTICS: 'analytics',
  ALERTS: 'alerts',
} as const;

// Risk Tolerances
export const RISK_TOLERANCES = {
  CONSERVATIVE: 'Conservative',
  BALANCED: 'Balanced',
  AGGRESSIVE: 'Aggressive',
  SPECULATIVE: 'Speculative',
} as const;

// Alert Conditions
export const ALERT_CONDITIONS = {
  ABOVE: 'above',
  BELOW: 'below',
} as const;

// Notification Durations
export const NOTIFICATION_DURATION = 5000; // 5 seconds

// API Polling Intervals
export const POLLING_INTERVALS = {
  STOCKS: 15000, // 15 seconds
  REALTIME: 1000, // 1 second
} as const;

// Chart Defaults
export const CHART_DEFAULTS = {
  POINTS: 50,
  POINTS_1W: 100,
  POINTS_1M: 150,
  VOLATILITY: 0.005,
} as const;

