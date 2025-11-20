import api from '../utils/api';
import { FeedbackResponse, FeedbackFilters } from '../types/feedback';

/**
 * feedbackService
 * Methods to list feedbacks globally or for a specific event with paging and simple filters.
 */
export const feedbackService = {
  // Get all feedbacks with pagination and filters
  getAllFeedbacks: async (
    page: number = 1,
    limit: number = 10,
    filters?: Partial<FeedbackFilters>
  ): Promise<FeedbackResponse> => {
    let url = `/admin/feedbacks/all-feedbacks?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get event feedbacks with pagination and filters
  getEventFeedbacks: async (
    eventId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Partial<FeedbackFilters>
  ): Promise<FeedbackResponse> => {
    let url = `/admin/feedbacks/all-feedbacks/${eventId}?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },
};