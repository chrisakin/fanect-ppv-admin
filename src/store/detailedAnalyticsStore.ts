import { create } from 'zustand';
import { detailedAnalyticsService, DetailedAnalytics, AnalyticsFilters, EventStatus, UserStatus } from '../services/detailedAnalyticsService';

interface DetailedAnalyticsState {
  analytics: DetailedAnalytics | null;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: AnalyticsFilters;
  
  // Actions
  setAnalytics: (analytics: DetailedAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  
  // API Actions
  fetchDetailedAnalytics: () => Promise<void>;
  clearError: () => void;
}

const initialFilters: AnalyticsFilters = {
  currency: 'USD'
};

export const useDetailedAnalyticsStore = create<DetailedAnalyticsState>((set, get) => ({
  analytics: null,
  loading: false,
  error: null,
  filters: initialFilters,

  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  clearError: () => set({ error: null }),

  fetchDetailedAnalytics: async () => {
    const { filters } = get();
    
    try {
      set({ loading: true, error: null });
      const response = await detailedAnalyticsService.getDetailedAnalytics(filters);
      set({ analytics: response.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch detailed analytics' });
      console.error('Error fetching detailed analytics:', err);
    } finally {
      set({ loading: false });
    }
  },
}));