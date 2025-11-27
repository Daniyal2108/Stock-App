# API Integration Documentation

## 🚀 Complete API Integration with Axios Interceptors

### Architecture Overview

The application uses a centralized API client with axios interceptors for all backend communication. This ensures:
- ✅ Consistent error handling
- ✅ Automatic token management
- ✅ Request/response logging
- ✅ Reusable service layer
- ✅ Type-safe API calls

---

## 📁 Service Structure

```
services/
├── apiClient.ts          # Axios instance with interceptors
├── authService.ts        # Authentication APIs
├── alertService.ts       # Alert management APIs
├── marketService.ts      # Market data APIs
├── geminiService.ts      # AI analysis service
└── index.ts             # Centralized exports
```

---

## 🔧 API Client (`apiClient.ts`)

### Features
- **Request Interceptor**: Automatically adds JWT token to headers
- **Response Interceptor**: Handles errors and logs responses
- **Token Management**: Auto-handles 401 errors and logout
- **Error Formatting**: Consistent error messages
- **Development Logging**: Request/response logging in dev mode

### Usage
```typescript
import { apiRequest } from './services/apiClient';

// GET request
const data = await apiRequest.get('/endpoint');

// POST request
const result = await apiRequest.post('/endpoint', { data });

// PATCH request
const updated = await apiRequest.patch('/endpoint/id', { data });

// DELETE request
await apiRequest.delete('/endpoint/id');
```

---

## 🔐 Auth Service (`authService.ts`)

### Methods

#### `login(email, password)`
- Logs in user
- Stores JWT token automatically
- Returns user data

#### `signup(data)`
- Creates new user account
- Stores JWT token automatically
- Returns user data

#### `getCurrentUser()`
- Fetches current authenticated user
- Requires valid JWT token

#### `updateProfile(data)`
- Updates user profile information

#### `updatePassword(current, new, confirm)`
- Updates user password

#### `logout()`
- Clears token from localStorage
- Clears cookies

#### `getToken()`
- Returns stored JWT token

#### `isAuthenticated()`
- Checks if user is authenticated

### Example
```typescript
import { authService } from './services/authService';

// Login
const response = await authService.login('user@example.com', 'password');
console.log(response.data.user);

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

---

## 🔔 Alert Service (`alertService.ts`)

### Methods

#### `getAlerts()`
- Fetches all alerts for current user
- Returns array of alerts

#### `createAlert(data)`
- Creates new price alert
- Data: `{ symbol, targetPrice, condition }`

#### `updateAlert(alertId, data)`
- Updates existing alert
- Data: `{ targetPrice?, condition?, active? }`

#### `deleteAlert(alertId)`
- Deletes alert by ID

#### `toggleAlert(alertId, active)`
- Toggles alert active status

### Example
```typescript
import { alertService } from './services/alertService';

// Get all alerts
const alerts = await alertService.getAlerts();

// Create alert
const newAlert = await alertService.createAlert({
  symbol: 'AAPL',
  targetPrice: 150,
  condition: 'above'
});

// Delete alert
await alertService.deleteAlert(alertId);
```

---

## 📊 Market Service (`marketService.ts`)

### Methods

#### `getMarketData(type?)`
- Fetches all market data
- Optional filter by type: 'stock' | 'crypto' | 'forex'

#### `getMarketDataBySymbol(symbol)`
- Fetches market data for specific symbol

#### `getCandleData(symbol, timeRange)`
- Fetches candlestick data
- TimeRange: '1D' | '1W' | '1M' | '3M' | '1Y'

#### `getMarketStats()`
- Fetches market statistics
- Returns: totalAssets, totalVolume, topGainers, topLosers

#### `searchMarketData(query)`
- Searches market data by symbol or name

### Example
```typescript
import { marketService } from './services/marketService';

// Get all stocks
const stocks = await marketService.getMarketData('stock');

// Get candle data
const candles = await marketService.getCandleData('AAPL', '1D');

// Search
const results = await marketService.searchMarketData('apple');
```

---

## 🎣 Custom Hooks

### `useApi<T>(options)`
Reusable hook for API calls with loading and error states.

```typescript
import { useApi } from './hooks/useApi';
import { alertService } from './services/alertService';

const MyComponent = () => {
  const { loading, error, data, execute } = useApi({
    onSuccess: (data) => console.log('Success!', data),
    onError: (error) => console.error('Error!', error),
  });

  const fetchAlerts = () => {
    execute(() => alertService.getAlerts());
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={fetchAlerts}>Fetch Alerts</button>
    </div>
  );
};
```

---

## 🛠️ Error Handling

### Centralized Error Handler (`utils/errorHandler.ts`)

```typescript
import { handleApiError } from './utils/errorHandler';

try {
  await apiRequest.get('/endpoint');
} catch (error) {
  const message = handleApiError(error);
  console.error(message);
}
```

### Error Types Handled
- **401 Unauthorized**: Auto-logout and redirect
- **403 Forbidden**: Permission denied message
- **404 Not Found**: Resource not found message
- **500 Server Error**: Server error message
- **Network Errors**: Connection issues
- **Timeout Errors**: Request timeout

---

## 🔄 Integration with Contexts

### AuthContext
- Uses `authService` for all authentication
- Auto-loads user on mount if token exists
- Handles logout events from API interceptor

### MarketContext
- Uses `marketService` for market data
- Falls back to mock data if API unavailable
- Real-time updates via polling

### useAlerts Hook
- Uses `alertService` for all alert operations
- Auto-syncs with backend
- Falls back to local storage if not authenticated

---

## 📝 Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🎯 Best Practices Implemented

1. **Single Source of Truth**: All API calls go through `apiClient`
2. **Type Safety**: Full TypeScript support
3. **Error Handling**: Centralized error handling
4. **Token Management**: Automatic token injection and refresh
5. **Reusability**: Services can be used anywhere
6. **Fallback Logic**: Graceful degradation if API unavailable
7. **Loading States**: Built-in loading state management
8. **Logging**: Development mode logging for debugging

---

## 🚦 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/updateMe` - Update profile
- `PATCH /api/v1/auth/updateMyPassword` - Update password

### Alerts
- `GET /api/v1/alerts` - Get all alerts
- `POST /api/v1/alerts` - Create alert
- `PATCH /api/v1/alerts/:id` - Update alert
- `DELETE /api/v1/alerts/:id` - Delete alert

### Market Data
- `GET /api/v1/market/data` - Get all market data
- `GET /api/v1/market/data/:symbol` - Get by symbol
- `GET /api/v1/market/candles/:symbol` - Get candle data
- `GET /api/v1/market/stats` - Get market stats
- `GET /api/v1/market/search` - Search market data

---

## ✅ Testing API Integration

1. **Check API Client**: Verify interceptors are working
2. **Test Authentication**: Login/logout flow
3. **Test Alerts**: Create, update, delete alerts
4. **Test Market Data**: Fetch and display data
5. **Test Error Handling**: Verify error messages
6. **Test Token Refresh**: Check auto-logout on 401

---

## 🔍 Debugging

### Enable API Logging
API requests/responses are automatically logged in development mode.

### Check Network Tab
- Verify requests have Authorization header
- Check response status codes
- Verify request/response payloads

### Common Issues

1. **401 Unauthorized**: Token expired or invalid
   - Solution: User will be auto-logged out

2. **CORS Errors**: Backend not configured
   - Solution: Check backend CORS settings

3. **Network Errors**: Backend not running
   - Solution: Start backend server

4. **Timeout Errors**: Slow API response
   - Solution: Increase timeout in `apiClient.ts`

---

**All APIs are fully integrated and ready to use! 🎉**

