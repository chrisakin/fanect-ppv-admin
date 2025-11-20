import api from '../utils/api';

/**
 * UserStatus
 * Enum representing user account status.
 */
export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

/**
 * ApiUser
 * Shape of a user returned from the API.
 */
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

/**
 * UsersResponse
 * Paginated response containing users and pagination meta.
 */
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

/**
 * SingleUserResponse
 * Response when a single user is requested.
 */
export interface SingleUserResponse {
  message: string;
  user: ApiUser;
}

/**
 * userService
 * Methods for listing, retrieving and updating user accounts (lock/unlock).
 */
export const userService = {
  // Get all users with pagination and filters
  getAllUsers: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: UserStatus | 'All';
      searchTerm?: string;
      locked?: 'All' | 'Locked' | 'Not Locked';
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
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
      if (filters.locked && filters.locked !== 'All') {
        const locked = filters.locked === 'Locked' ? 'locked' : 'not-locked';
        url += `&locked=${locked}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
      if (filters.sortBy) {
        url += `&sortBy=${filters.sortBy}`;
      }
      if (filters.sortOrder) {
        url += `&sortOrder=${filters.sortOrder}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single user by ID
  getSingleUser: async (id: string): Promise<SingleUserResponse> => {
    const response = await api.get(`/admin/users/single-user/${id}`);
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