import { create } from 'zustand';
import { transactionService } from '../services/transactionService';
import { UserTransaction, TransactionFilters } from '../types/transaction';

interface TransactionState {
  transactions: UserTransaction[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: TransactionFilters;
  
  // Actions
  setTransactions: (transactions: UserTransaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchUserTransactions: (userId: string, page?: number, searchTerm?: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialFilters: TransactionFilters = {
  status: 'All',
  giftStatus: 'All',
  paymentMethod: 'All',
  searchTerm: ''
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setTransactions: (transactions) => set({ transactions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),
  resetStore: () => set({
    transactions: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    filters: initialFilters
  }),

  fetchUserTransactions: async (userId: string, page = 1, searchTerm = '') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        status: filters.status,
        giftStatus: filters.giftStatus,
        paymentMethod: filters.paymentMethod,
        searchTerm: searchTerm.trim()
      };
      
      const response = await transactionService.getUserTransactions(userId, page, limit, apiFilters);
      
      set({
        transactions: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch user transactions' });
      console.error('Error fetching user transactions:', err);
    } finally {
      set({ loading: false });
    }
  },
}));