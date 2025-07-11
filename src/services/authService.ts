import api from '../utils/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data?: any;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface VerifyOTPResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface ResendOTPRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
}

export const authService = {
  // Login with username and password
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/admin/auth/login', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    const response = await api.post('/admin/auth/verify', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data: ResendOTPRequest): Promise<LoginResponse> => {
    const response = await api.post('/admin/auth/resend-otp', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<LoginResponse> => {
    const response = await api.post('/admin/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<LoginResponse> => {
    const response = await api.post(`/admin/auth/reset/${token}`, data);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<{ message: string; data: any }> => {
    const response = await api.get('/admin/auth/profile');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens on logout
      const { tokenManager } = await import('../utils/api');
      tokenManager.clearTokens();
    }
  }
};