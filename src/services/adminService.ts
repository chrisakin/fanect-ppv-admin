import api from '../utils/api';

export enum AdminStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface ApiAdmin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
  locked: boolean;
  status: AdminStatus;
  role?: string;
}

export interface AdminsResponse {
  message: string;
  docs: ApiAdmin[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export interface SingleAdminResponse {
  message: string;
  admin: ApiAdmin;
}

export const adminService = {
  // Get all admins with pagination and filters
  getAllAdmins: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: AdminStatus | 'All';
      searchTerm?: string;
      locked?: 'All' | 'Locked' | 'Not Locked';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AdminsResponse> => {
    let url = `/admin/auth/get-all-admin?page=${page}&limit=${limit}`;
    
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
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single admin by ID
  getSingleAdmin: async (id: string): Promise<SingleAdminResponse> => {
    const response = await api.get(`/admin/auth/single-admin/${id}`);
    return response.data;
  },

  // Lock admin
  lockAdmin: async (adminId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/auth/lock-user/${adminId}`);
    return response.data;
  },

  // Unlock admin
  unlockAdmin: async (adminId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/auth/unlock-user/${adminId}`);
    return response.data;
  },
};