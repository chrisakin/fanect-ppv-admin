import api from '../utils/api';

export enum OrganiserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface ApiOrganiser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
  locked: boolean;
  status: OrganiserStatus;
  eventCreated: number;
}

export interface OrganisersResponse {
  message: string;
  docs: ApiOrganiser[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export interface SingleOrganiserResponse {
  message: string;
  user: ApiOrganiser;
}

export const organiserService = {
  // Get all organisers with pagination and filters
  getAllOrganisers: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: OrganiserStatus | 'All';
      searchTerm?: string;
      locked?: 'All' | 'Locked' | 'Not Locked';
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
    }
  ): Promise<OrganisersResponse> => {
    let url = `/admin/organisers/all-organisers?page=${page}&limit=${limit}`;
    
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

  // Get single organiser by ID (using same endpoint as users)
  getSingleOrganiser: async (id: string): Promise<SingleOrganiserResponse> => {
    const response = await api.get(`/admin/users/single-user/${id}`);
    return response.data;
  },

  // Lock organiser
  lockOrganiser: async (organiserId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/lock-user/${organiserId}`);
    return response.data;
  },

  // Unlock organiser
  unlockOrganiser: async (organiserId: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/unlock-user/${organiserId}`);
    return response.data;
  },
};