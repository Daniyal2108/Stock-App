import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// API Configuration
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;

  // If no env URL, use default
  if (!envUrl) {
    return "http://localhost:5000/api/v1";
  }

  // Trim whitespace
  let url = envUrl.trim();

  // If URL already has protocol, use as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Remove trailing slashes and ensure /api/v1
    url = url.replace(/\/+$/, "");
    if (!url.endsWith("/api/v1")) {
      url = `${url}/api/v1`;
    }
    return url;
  }

  // If URL doesn't have protocol, add https://
  // Remove leading slashes if any
  url = url.replace(/^\/+/, "");
  url = `https://${url}`;

  // Remove trailing slashes and ensure /api/v1
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api/v1")) {
    url = `${url}/api/v1`;
  }

  return url;
};

const API_BASE_URL = getApiBaseUrl();

// Log the API URL in development for debugging
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Add token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.data
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      localStorage.removeItem("token");

      // Only redirect if not already on auth page
      if (!window.location.pathname.includes("/login")) {
        // You can trigger a logout event or redirect here
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ API Error: ${originalRequest.method?.toUpperCase()} ${
          originalRequest.url
        }`,
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        }
      );
    }

    // Return a consistent error format
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// API Request Helper Functions
export const apiRequest = {
  get: <T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<T> => {
    return apiClient.get<T>(url, config).then((response) => response.data);
  },

  post: <T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .post<T>(url, data, config)
      .then((response) => response.data);
  },

  put: <T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .put<T>(url, data, config)
      .then((response) => response.data);
  },

  patch: <T = any>(
    url: string,
    data?: any,
    config?: InternalAxiosRequestConfig
  ): Promise<T> => {
    return apiClient
      .patch<T>(url, data, config)
      .then((response) => response.data);
  },

  delete: <T = any>(
    url: string,
    config?: InternalAxiosRequestConfig
  ): Promise<T> => {
    return apiClient.delete<T>(url, config).then((response) => response.data);
  },
};

// Export the client for advanced usage
export default apiClient;
