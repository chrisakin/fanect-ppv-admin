import { create } from 'zustand';
import { adminService, ApiAdmin, AdminStatus } from '../services/adminService';

/**
 * AdminFilters
 * Filter configuration for admin list queries (status, locked, search, date range).
 */
interface AdminFilters {
  status: AdminStatus | 'All';
  locked: 'All' | 'Locked' | 'Not Locked';
  searchTerm: string;
  startDate: string;
  endDate: string;
}

interface AdminState {
  admins: ApiAdmin[];
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: AdminFilters;
  
  // Actions
  setAdmins: (admins: ApiAdmin[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActionLoading: (adminId: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<AdminFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchAdmins: (page?: number, searchTerm?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  lockAdmin: (adminId: string) => Promise<{ success: boolean; message?: string }>;
  unlockAdmin: (adminId: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

const initialFilters: AdminFilters = {
  status: 'All',
  locked: 'All',
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useAdminStore = create<AdminState>((set, get) => ({
  admins: [],
  loading: false,
  error: null,
  actionLoading: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setAdmins: (admins) => set({ admins }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActionLoading: (adminId) => set({ actionLoading: adminId }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),

  fetchAdmins: async (page = 1, searchTerm = '', sortBy = 'createdAt', sortOrder = 'desc') => {
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
      
      const response = await adminService.getAllAdmins(page, limit, apiFilters);
      
      set({
        admins: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch admins' });
      console.error('Error fetching admins:', err);
    } finally {
      set({ loading: false });
    }
  },

  lockAdmin: async (adminId: string) => {
    try {
      set({ actionLoading: adminId });
      const response = await adminService.lockAdmin(adminId);
      
      // Refresh admins list
      const { currentPage, filters } = get();
      await get().fetchAdmins(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'Admin locked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to lock admin';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  },

  unlockAdmin: async (adminId: string) => {
    try {
      set({ actionLoading: adminId });
      const response = await adminService.unlockAdmin(adminId);
      
      // Refresh admins list
      const { currentPage, filters } = get();
      await get().fetchAdmins(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'Admin unlocked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to unlock admin';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  }
}));