import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
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
      
      // Fetch user profile after successful verification
      try {
        const profileResponse = await authService.getProfile();
        
        // Store tokens and user data
        setAuth(
          {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          },
          profileResponse.data
        );
      } catch (error) {
        console.error('Failed to fetch user profile after OTP verification:', error);
        return { 
          success: false, 
          message: 'Login successful but failed to fetch profile. Please try again.' 
        };
      }
      
      return { success: true, message: response.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed. Please try again.' 
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