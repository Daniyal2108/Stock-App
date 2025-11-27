import { apiRequest } from './apiClient';

export interface User {
  _id: string;
  name: string;
  email: string;
  balance: number;
  riskTolerance: string;
  goal: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  data: {
    user: User;
  };
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  riskTolerance?: string;
  goal?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Auth Service
export const authService = {
  // Login
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiRequest.post<LoginResponse>('/auth/login', data);
    
    // Store token
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  // Signup
  signup: async (data: SignupData): Promise<LoginResponse> => {
    const response = await apiRequest.post<LoginResponse>('/auth/signup', data);
    
    // Store token
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest.get<{ status: string; data: { user: User } }>('/auth/me');
    return response.data.user;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiRequest.patch<{ status: string; data: { user: User } }>('/auth/updateMe', data);
    return response.data.user;
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string, passwordConfirm: string): Promise<void> => {
    await apiRequest.patch('/auth/updateMyPassword', {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm,
    });
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
    // Clear cookies if needed
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  // Get token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
