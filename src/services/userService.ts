import api from '../utils/api';

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface ApiUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
  locked: boolean;
  status: UserStatus;
  eventsJoinedCount: number;
}

export interface UsersResponse {
  message: string;
  docs: ApiUser[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export const userService = {
  // Get all users with pagination and filters
  getAllUsers: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: UserStatus | 'All';
      searchTerm?: string;
      verified?: 'All' | 'Verified' | 'Not Verified';
    }
  ): Promise<UsersResponse> => {
    let url = `/admin/users/all-users?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status && filters.status !== 'All') {
        url += `&status=${filters.status}`;
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
      }
      if (filters.verified && filters.verified !== 'All') {
        const isVerified = filters.verified === 'Verified';
        url += `&isVerified=${isVerified}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Lock user
  lockUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/lock-user/${userId}`);
    return response.data;
  },

  // Unlock user
  unlockUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/unlock-user/${userId}`);
    return response.data;
  },
};