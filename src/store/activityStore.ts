import { create } from 'zustand';
import { activityService } from '../services/activityService';
import { UserActivity, ActivityFilters } from '../types/activity';

interface ActivityState {
  activities: UserActivity[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: ActivityFilters;
  
  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setActivities: (activities: UserActivity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<ActivityFilters>) => void;
  setCurrentPage: (page: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  
  // API Actions
  fetchUserActivities: (userId: string, page?: number, searchTerm?: string) => Promise<void>;
  fetchAdminActivities: (adminId: string, page?: number, searchTerm?: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialFilters: ActivityFilters = {
  component: 'All',
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,
  sortBy: 'createdAt',
  sortOrder: 'desc',

  setActivities: (activities) => set({ activities }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  clearError: () => set({ error: null }),
  resetStore: () => set({
    activities: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    filters: initialFilters,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }),

  fetchUserActivities: async (userId: string, page = 1, searchTerm = '') => {
    const { filters, limit, sortBy, sortOrder } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        component: filters.component,
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const response = await activityService.getUserActivities(userId, page, limit, apiFilters, sortBy, sortOrder);
      
      set({
        activities: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch user activities' });
      console.error('Error fetching user activities:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchAdminActivities: async (adminId: string, page = 1, searchTerm = '') => {
    const { filters, limit, sortBy, sortOrder } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        component: filters.component,
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const response = await activityService.getAdminActivities(adminId, page, limit, apiFilters, sortBy, sortOrder);
      
      set({
        activities: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch admin activities' });
      console.error('Error fetching admin activities:', err);
    } finally {
      set({ loading: false });
    }
  },
}));