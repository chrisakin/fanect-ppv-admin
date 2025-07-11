import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
});

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    return useAuthStore.getState().accessToken;
  },
  
  getRefreshToken: (): string | null => {
    return useAuthStore.getState().refreshToken;
  },
  
  setTokens: (accessToken: string, refreshToken: string): void => {
    useAuthStore.getState().updateTokens({ accessToken, refreshToken });
  },
  
  clearTokens: (): void => {
    useAuthStore.getState().clearAuth();
  },
  
  isAuthenticated: (): boolean => {
    return useAuthStore.getState().isAuthenticated;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post('/admin/auth/refresh', {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          tokenManager.setTokens(accessToken, newRefreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;