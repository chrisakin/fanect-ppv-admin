import { create } from 'zustand';
import { transactionService, TransactionStats } from '../services/transactionService';
import { UserTransaction, TransactionFilters } from '../types/transaction';

interface AllTransactionFilters extends TransactionFilters {
  currency: string[]; // Array of selected currencies
}

interface AllTransactionState {
  transactions: UserTransaction[];
  stats: TransactionStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: AllTransactionFilters;
  
  // Actions
  setTransactions: (transactions: UserTransaction[]) => void;
  setStats: (stats: TransactionStats) => void;
  setLoading: (loading: boolean) => void;
  setStatsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<AllTransactionFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchAllTransactions: (page?: number, searchTerm?: string) => Promise<void>;
  fetchTransactionStats: () => Promise<void>;
  clearError: () => void;
}

const initialFilters: AllTransactionFilters = {
  status: 'All',
  giftStatus: 'All',
  paymentMethod: 'All',
  searchTerm: '',
  startDate: '',
  endDate: '',
  currency: []
};

export const useAllTransactionStore = create<AllTransactionState>((set, get) => ({
  transactions: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setTransactions: (transactions) => set({ transactions }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
  setStatsLoading: (statsLoading) => set({ statsLoading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),

  fetchAllTransactions: async (page = 1, searchTerm = '') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        status: filters.status,
        giftStatus: filters.giftStatus,
        paymentMethod: filters.paymentMethod,
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate,
        currency: filters.currency.length > 0 ? filters.currency.join(',') : undefined
      };
      
      const response = await transactionService.getAllTransactions(page, limit, apiFilters);
      
      set({
        transactions: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch transactions' });
      console.error('Error fetching transactions:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactionStats: async () => {
    const { filters } = get();
    
    try {
      set({ statsLoading: true });
      
      const apiFilters = {
        currency: filters.currency.length > 0 ? filters.currency.join(',') : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };
      
      const response = await transactionService.getTransactionStats(apiFilters);
      set({ stats: response.stats });
    } catch (err: any) {
      console.error('Error fetching transaction stats:', err);
      // Don't set error for stats as it's not critical
    } finally {
      set({ statsLoading: false });
    }
  },
}));