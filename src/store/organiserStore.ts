import { create } from 'zustand';
import { organiserService, ApiOrganiser, OrganiserStatus } from '../services/organiserService';

interface OrganiserFilters {
  status: OrganiserStatus | 'All';
  locked: 'All' | 'Locked' | 'Not Locked';
  searchTerm: string;
  startDate: string;
  endDate: string;
}

interface OrganiserState {
  organisers: ApiOrganiser[];
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: OrganiserFilters;
  
  // Actions
  setOrganisers: (organisers: ApiOrganiser[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActionLoading: (organiserId: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<OrganiserFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchOrganisers: (page?: number, searchTerm?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  lockOrganiser: (organiserId: string) => Promise<{ success: boolean; message?: string }>;
  unlockOrganiser: (organiserId: string) => Promise<{ success: boolean; message?: string }>;
  clearError: () => void;
}

const initialFilters: OrganiserFilters = {
  status: 'All',
  locked: 'All',
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useOrganiserStore = create<OrganiserState>((set, get) => ({
  organisers: [],
  loading: false,
  error: null,
  actionLoading: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setOrganisers: (organisers) => set({ organisers }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setActionLoading: (organiserId) => set({ actionLoading: organiserId }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),

  fetchOrganisers: async (page = 1, searchTerm = '', sortBy = 'createdAt', sortOrder = 'desc') => {
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
      
      const response = await organiserService.getAllOrganisers(page, limit, apiFilters);
      
      set({
        organisers: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch organisers' });
      console.error('Error fetching organisers:', err);
    } finally {
      set({ loading: false });
    }
  },

  lockOrganiser: async (organiserId: string) => {
    try {
      set({ actionLoading: organiserId });
      const response = await organiserService.lockOrganiser(organiserId);
      
      // Refresh organisers list
      const { currentPage, filters } = get();
      await get().fetchOrganisers(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'Organiser locked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to lock organiser';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  },

  unlockOrganiser: async (organiserId: string) => {
    try {
      set({ actionLoading: organiserId });
      const response = await organiserService.unlockOrganiser(organiserId);
      
      // Refresh organisers list
      const { currentPage, filters } = get();
      await get().fetchOrganisers(currentPage, filters.searchTerm, 'createdAt', 'desc');
      
      return { success: true, message: response.message || 'Organiser unlocked successfully!' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to unlock organiser';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ actionLoading: null });
    }
  }
}));