import api from '../utils/api';
import { UserActivitiesResponse, ActivityFilters } from '../types/activity';

export const activityService = {
  // Get user activities with pagination and filters
  getUserActivities: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Partial<ActivityFilters>
  ): Promise<UserActivitiesResponse> => {
    let url = `/admin/users/single-user-activities/${userId}?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.component && filters.component !== 'All') {
        url += `&component=${filters.component}`;
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
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

  // Get admin activities with pagination and filters
  getAdminActivities: async (
    adminId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Partial<ActivityFilters>
  ): Promise<UserActivitiesResponse> => {
    let url = `/admin/auth/admin-activites/${adminId}?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.component && filters.component !== 'All') {
        url += `&component=${filters.component}`;
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
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
};