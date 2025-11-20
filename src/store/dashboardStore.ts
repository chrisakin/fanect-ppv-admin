import { create } from 'zustand';
import { dashboardService, DashboardAnalytics } from '../services/dashboardService';

/**
 * DashboardState
 * Zustand store for dashboard analytics with timeframe and currency controls.
 */
interface DashboardState {
  analytics: DashboardAnalytics | null;
  loading: boolean;
  error: string | null;
  timeframe: '7d' | '30d' | '90d' | '1y';
  currency: string;
  
  // Actions
  setAnalytics: (analytics: DashboardAnalytics) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTimeframe: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
  setCurrency: (currency: string) => void;
  
  // API Actions
  fetchDashboardAnalytics: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  analytics: null,
  loading: false,
  error: null,
  timeframe: '30d',
  currency: 'USD',

  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setCurrency: (currency) => set({ currency }),
  clearError: () => set({ error: null }),

  fetchDashboardAnalytics: async () => {
    const { timeframe, currency } = get();
    
    try {
      set({ loading: true, error: null });
      const response = await dashboardService.getDashboardAnalytics(timeframe, currency);
      set({ analytics: response.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch dashboard analytics' });
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      set({ loading: false });
    }
  },
}));