import { create } from 'zustand';
import { feedbackService } from '../services/feedbackService';
import { Feedback, FeedbackFilters } from '../types/feedback';

interface FeedbackState {
  feedbacks: Feedback[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  
  // Filters
  filters: FeedbackFilters;
  
  // Actions
  setFeedbacks: (feedbacks: Feedback[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { currentPage: number; totalPages: number; totalDocs: number }) => void;
  setFilters: (filters: Partial<FeedbackFilters>) => void;
  setCurrentPage: (page: number) => void;
  
  // API Actions
  fetchAllFeedbacks: (page?: number, searchTerm?: string) => Promise<void>;
  fetchEventFeedbacks: (eventId: string, page?: number, searchTerm?: string) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
}

const initialFilters: FeedbackFilters = {
  searchTerm: '',
  startDate: '',
  endDate: ''
};

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalDocs: 0,
  limit: 10,
  filters: initialFilters,

  setFeedbacks: (feedbacks) => set({ feedbacks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set(pagination),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setCurrentPage: (currentPage) => set({ currentPage }),
  clearError: () => set({ error: null }),
  resetStore: () => set({
    feedbacks: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    filters: initialFilters
  }),

  fetchAllFeedbacks: async (page = 1, searchTerm = '') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const response = await feedbackService.getAllFeedbacks(page, limit, apiFilters);
      
      set({
        feedbacks: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch feedbacks' });
      console.error('Error fetching feedbacks:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchEventFeedbacks: async (eventId: string, page = 1, searchTerm = '') => {
    const { filters, limit } = get();
    
    try {
      set({ loading: true, error: null });
      
      const apiFilters = {
        searchTerm: searchTerm.trim(),
        startDate: filters.startDate,
        endDate: filters.endDate
      };
      
      const response = await feedbackService.getEventFeedbacks(eventId, page, limit, apiFilters);
      
      set({
        feedbacks: response.docs,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalDocs: response.totalDocs,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch event feedbacks' });
      console.error('Error fetching event feedbacks:', err);
    } finally {
      set({ loading: false });
    }
  },
}));