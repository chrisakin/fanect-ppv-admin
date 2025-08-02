import { create } from 'zustand';
import { eventService, ApiEvent } from '../services/eventService';

interface EventFilters {
  status: string;
  adminStatus: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}

interface OrganiserEventState {
  events: ApiEvent[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: EventFilters;
  
  // Actions
  setEvents: (events: ApiEvent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchOrganiserEvents: (organiserId: string, page?: number, searchTerm?: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialFilters: EventFilters = {
  status: 'All',
  adminStatus: 'All',
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useOrganiserEventStore = create<OrganiserEventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setEvents: (events) => set({ events }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),
  resetStore: () => set({
    events: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    filters: initialFilters
  }),

  fetchOrganiserEvents: async (organiserId: string, page = 1, searchTerm = '') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        status: filters.status,
        adminStatus: filters.adminStatus,
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      // Using the same endpoint as user events but for organiser
      const response = await eventService.getUserEvents(organiserId, page, limit, apiFilters);
      
      set({
        events: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch organiser events' });
      console.error('Error fetching organiser events:', err);
    } finally {
      set({ loading: false });
    }
  },
}));