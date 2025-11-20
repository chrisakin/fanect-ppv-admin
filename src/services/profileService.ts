import api from '../utils/api';
import { UserProfile, UpdateProfileData, ChangePasswordData } from '../types/profile';

/**
 * profileService
 * Methods for fetching and updating the current user's profile and password.
 */
export const profileService = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/admin/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; data: UserProfile }> => {
    const response = await api.put('/admin/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await api.post('/admin/auth/change-password', data);
    return response.data;
  },
};