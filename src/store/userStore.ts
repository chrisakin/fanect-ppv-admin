import { create } from 'zustand';
import { userService, ApiUser, UserStatus } from '../services/userService';

/**
 * UserFilters
 * Filters for querying users by status, lock status, and date range.
 */
interface UserFilters {
  status: UserStatus | 'All';
  locked: 'All' | 'Locked' | 'Not Locked';
  searchTerm: string;
  startDate: string;
  endDate: string;
}

/**
 * UserState
 * Zustand store for managing user list with lock/unlock actions and filtering.
 */
interface UserState {
  users: ApiUser[];
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: UserFilters;
  
  // Actions
  setUsers: (users: ApiUser[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActionLoading: (userId: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchUsers: (page?: number, searchTerm?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  lockUser: (userId: string) => Promise<{ success: boolean; message?: string }>;
  unlockUser: (userId: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

const initialFilters: UserFilters = {
  status: 'All',
  locked: 'All',
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  actionLoading: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActionLoading: (userId) => set({ actionLoading: userId }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),

  fetchUsers: async (page = 1, searchTerm = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        status: filters.status,
        searchTerm: searchTerm.trim(),
        locked: filters.locked,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy,
        sortOrder
      };
      
      const response = await userService.getAllUsers(page, limit, apiFilters);
      
      set({
        users: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch users' });
      console.error('Error fetching users:', err);
    } finally {
      set({ loading: false });
    }
  },

  lockUser: async (userId: string) => {
    try {
      set({ actionLoading: userId });
      const response = await userService.lockUser(userId);
      
      // Refresh users list
      const { currentPage, filters } = get();
      await get().fetchUsers(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'User locked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to lock user';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  },

  unlockUser: async (userId: string) => {
    try {
      set({ actionLoading: userId });
      const response = await userService.unlockUser(userId);
      
      // Refresh users list
      const { currentPage, filters } = get();
      await get().fetchUsers(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'User unlocked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to unlock user';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  }
}));