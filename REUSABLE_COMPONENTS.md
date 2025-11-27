# Reusable Components & Utilities Documentation

## 📦 Reusable UI Components (`components/UI/`)

### 1. **Button** (`Button.tsx`)
- Variants: `primary`, `secondary`, `danger`, `success`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Features: Loading state, full width option, disabled state
- Usage: `<Button variant="primary" size="md">Click Me</Button>`

### 2. **Card** (`Card.tsx`)
- Variants: `default`, `elevated`, `outlined`
- Padding: `none`, `sm`, `md`, `lg`
- Usage: `<Card variant="elevated" padding="md">Content</Card>`

### 3. **Badge** (`Badge.tsx`)
- Variants: `default`, `success`, `danger`, `warning`, `info`
- Sizes: `sm`, `md`
- Usage: `<Badge variant="success">Active</Badge>`

### 4. **StatCard** (`StatCard.tsx`)
- Displays statistics with icon, label, value, and optional trend
- Usage: `<StatCard label="Total Equity" value="$100,000" icon={<Icon />} />`

### 5. **PriceDisplay** (`PriceDisplay.tsx`)
- Formats and displays price with change percentage
- Sizes: `sm`, `md`, `lg`, `xl`
- Usage: `<PriceDisplay price={100} change={5} changePercent={5.2} />`

### 6. **LoadingSpinner** (`LoadingSpinner.tsx`)
- Reusable loading indicator
- Sizes: `sm`, `md`, `lg`
- Usage: `<LoadingSpinner size="md" />`

### 7. **EmptyState** (`EmptyState.tsx`)
- Displays empty state with icon, title, description, and optional action
- Usage: `<EmptyState icon={<Icon />} title="No data" description="..." />`

### 8. **TimeRangeSelector** (`TimeRangeSelector.tsx`)
- Reusable time range selector component
- Usage: `<TimeRangeSelector selectedRange="1D" onRangeChange={handleChange} />`

## 🛠️ Utility Helpers (`utils/helpers.ts`)

### Formatting Functions
- `formatCurrency(value, options)` - Format numbers as currency
- `formatPercentage(value, options)` - Format numbers as percentage
- `formatLargeNumber(value)` - Format large numbers (K, M, B, T)

### Calculation Functions
- `calculatePnL(currentPrice, avgPrice, quantity)` - Calculate profit/loss
- `calculatePortfolioValue(portfolio, marketData)` - Calculate total portfolio value
- `calculateTotalReturn(portfolio, marketData)` - Calculate total return
- `calculatePriceDomain(data)` - Calculate price domain for charts
- `calculateVolumeDomain(data)` - Calculate volume domain for charts

### Utility Functions
- `getPriceChangeColor(changePercent)` - Get color class for price changes
- `getPriceChangeIcon(changePercent)` - Get icon for price changes
- `isBullish(open, close)` - Check if candle is bullish
- `filterAssets(assets, type, searchQuery)` - Filter assets by type and search
- `generateCSV(headers, rows)` - Generate CSV content
- `downloadCSV(content, filename)` - Download CSV file
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `getSentimentColor(sentiment)` - Get color for sentiment
- `getSentimentIcon(sentiment)` - Get icon for sentiment

## 📋 Constants (`utils/constants.ts`)

### Theme Constants
- `THEME.colors` - Color palette
- `THEME.spacing` - Spacing scale
- `THEME.borderRadius` - Border radius values
- `THEME.shadows` - Shadow definitions

### Chart Constants
- `CHART_COLORS` - Chart color palette (bullish, bearish, SMA, EMA, volume, pie)

### Application Constants
- `TIME_RANGES` - Available time ranges
- `ASSET_TYPES` - Asset type definitions
- `VIEW_STATES` - View state definitions
- `RISK_TOLERANCES` - Risk tolerance levels
- `ALERT_CONDITIONS` - Alert condition types
- `NOTIFICATION_DURATION` - Notification display duration
- `POLLING_INTERVALS` - API polling intervals
- `CHART_DEFAULTS` - Default chart settings

## 🎣 Reusable Hooks (`hooks/`)

### 1. **useDebounce** (`useDebounce.ts`)
- Debounce a value
- Usage: `const debouncedValue = useDebounce(value, 500);`

### 2. **useLocalStorage** (`useLocalStorage.ts`)
- Sync state with localStorage
- Usage: `const [value, setValue] = useLocalStorage('key', initialValue);`

### 3. **useClickOutside** (`useClickOutside.ts`)
- Detect clicks outside an element
- Usage: `useClickOutside(ref, handleClickOutside);`

### 4. **useMediaQuery** (`useMediaQuery.ts`)
- React to media query changes
- Usage: `const isMobile = useMediaQuery('(max-width: 768px)');`

### 5. **useInterval** (`useInterval.ts`)
- Run a function at intervals
- Usage: `useInterval(() => fetchData(), 1000);`

### 6. **useAlerts** (`useAlerts.ts`)
- Manage alerts and notifications
- Usage: `const { alerts, addAlert, removeAlert, triggerNotification } = useAlerts();`

### 7. **useMarketData** (`useMarketData.ts`)
- Fetch and manage market data
- Usage: `useMarketData();`

### 8. **useRealtimeUpdates** (`useRealtimeUpdates.ts`)
- Handle real-time price updates
- Usage: `useRealtimeUpdates();`

## 📦 Barrel Exports

### Components
```typescript
import { Button, Card, Badge, StatCard, PriceDisplay, LoadingSpinner, EmptyState, TimeRangeSelector } from './components/UI';
```

### Hooks
```typescript
import { useDebounce, useLocalStorage, useClickOutside, useMediaQuery, useInterval } from './hooks';
```

### Utils
```typescript
import { formatCurrency, formatPercentage, calculatePnL, filterAssets, THEME, CHART_COLORS } from './utils';
```

## ✅ Refactored Components

The following components have been refactored to use reusable utilities:

1. **AssetDetails** - Now uses `StatCard` component
2. **PortfolioSummary** - Uses `StatCard`, `EmptyState`, helper functions
3. **FinancialChart** - Uses `TimeRangeSelector`, `CHART_COLORS`, helper functions
4. **App.tsx** - Uses helper functions for formatting and filtering

## 🎯 Benefits

1. **Consistency** - All components follow the same design system
2. **Maintainability** - Changes in one place affect all usages
3. **Reusability** - Components can be used anywhere in the app
4. **Type Safety** - Full TypeScript support
5. **Performance** - Optimized with memoization where needed
6. **Developer Experience** - Easy to use with clear APIs

## 📝 Usage Examples

### Example 1: Using Button Component
```tsx
<Button 
  variant="primary" 
  size="lg" 
  fullWidth 
  isLoading={loading}
  onClick={handleClick}
>
  Submit
</Button>
```

### Example 2: Using Helper Functions
```tsx
import { formatCurrency, calculatePnL } from './utils/helpers';

const { pnl, pnlPercent } = calculatePnL(currentPrice, avgPrice, quantity);
const formattedPrice = formatCurrency(price, { showSign: true });
```

### Example 3: Using Constants
```tsx
import { CHART_COLORS, TIME_RANGES } from './utils/constants';

const color = isBullish ? CHART_COLORS.bullish : CHART_COLORS.bearish;
```

### Example 4: Using Hooks
```tsx
import { useDebounce, useLocalStorage } from './hooks';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);
const [theme, setTheme] = useLocalStorage('theme', 'dark');
```

---

**All components, helpers, constants, and hooks are fully typed and ready to use!**

