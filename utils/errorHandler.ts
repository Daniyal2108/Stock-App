// Centralized error handling utilities

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const handleApiError = (error: any): string => {
  // Handle different error types
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.status === 401) {
    return 'Authentication required. Please login again.';
  }
  
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error?.status === 404) {
    return 'Resource not found.';
  }
  
  if (error?.status === 500) {
    return 'Server error. Please try again later.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return !error?.response && error?.message?.includes('Network');
};

export const isTimeoutError = (error: any): boolean => {
  return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
};

