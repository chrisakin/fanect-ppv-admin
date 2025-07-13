import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; email?: string }>;
  verifyOTP: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { 
    isAuthenticated, 
    user, 
    setAuth, 
    setUser, 
    clearAuth 
  } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      if (isAuthenticated) {
        try {
          const response = await authService.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // If profile fetch fails, user might not be properly authenticated
          clearAuth();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, setUser, clearAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      return { 
        success: true, 
        message: response.message,
        email: email
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const verifyOTP = async (email: string, code: string) => {
    try {
      const response = await authService.verifyOTP({ email, code });
      
      const { accessToken, refreshToken } = response.data;
      
      console.log('OTP verification successful, tokens received:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken 
      });
      
      // Temporarily set the token in the header for the profile request
      const originalAuthHeader = api.defaults.headers.common['Authorization'];
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Fetch user profile with the new token
      try {
        console.log('Fetching user profile...');
        const profileResponse = await api.get('/admin/auth/profile');
        
        console.log('Profile fetch successful:', profileResponse.data);
        
        // Now save both tokens and user data together
        setAuth(
          { accessToken, refreshToken },
          profileResponse.data.data
        );
        
        return { success: true, message: response.message };
      } catch (error) {
        // Restore original auth header
        if (originalAuthHeader) {
          api.defaults.headers.common['Authorization'] = originalAuthHeader;
        } else {
          delete api.defaults.headers.common['Authorization'];
        }
        
        return { 
          success: false, 
          message: `Login successful but failed to fetch profile: ${error.response?.data?.message || error.message}` 
        };
      } finally {
        // Clean up - remove the temporary auth header since we'll set it properly via the store
        if (!originalAuthHeader) {
          delete api.defaults.headers.common['Authorization'];
        }
      }
    } catch (error: unknown) {
      let message = 'OTP verification failed. Please try again.';
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        // @ts-expect-error: dynamic error shape
        message = error.response.data.message || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      return { 
        success: false, 
        message
      };
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const response = await authService.resendOTP({ email });
      return { success: true, message: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend OTP. Please try again.' 
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword({ email });
      return { success: true, message: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset email. Please try again.' 
      };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await authService.resetPassword(token, { password });
      return { success: true, message: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};