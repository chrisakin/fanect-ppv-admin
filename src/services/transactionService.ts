import api from '../utils/api';
import { UserTransactionsResponse, TransactionStatus, PaymentMethod, UserTransaction } from '../types/transaction';

export interface AllTransactionsResponse {
  message: string;
  docs: UserTransaction[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  successful: number;
  pending: number;
  failed: number;
  giftTransactions: number;
  nonGiftTransactions: number;
  flutterwaveCount: number;
  stripeCount: number;
}

export const transactionService = {
  // Get user transactions with pagination and filters
  getUserTransactions: async (
    userId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: TransactionStatus | 'All';
      giftStatus?: 'All' | 'gift' | 'not-gift';
      paymentMethod?: PaymentMethod | 'All';
      searchTerm?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<UserTransactionsResponse> => {
    let url = `/admin/users/single-user-transactions/${userId}?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status && filters.status !== 'All') {
        url += `&status=${filters.status}`;
      }
      if (filters.giftStatus && filters.giftStatus !== 'All') {
        url += `&giftStatus=${filters.giftStatus}`;
      }
      if (filters.paymentMethod && filters.paymentMethod !== 'All') {
        url += `&paymentMethod=${filters.paymentMethod}`;
      }
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

  // Get all transactions with pagination and filters
  getAllTransactions: async (
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: TransactionStatus | 'All';
      giftStatus?: 'All' | 'gift' | 'not-gift';
      paymentMethod?: PaymentMethod | 'All';
      searchTerm?: string;
      startDate?: string;
      endDate?: string;
      currency?: string; // Comma-separated currency codes
    }
  ): Promise<AllTransactionsResponse> => {
    let url = `/admin/transactions/all-transactions?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status && filters.status !== 'All') {
        url += `&status=${filters.status}`;
      }
      if (filters.giftStatus && filters.giftStatus !== 'All') {
        url += `&giftStatus=${filters.giftStatus}`;
      }
      if (filters.paymentMethod && filters.paymentMethod !== 'All') {
        url += `&paymentMethod=${filters.paymentMethod}`;
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
      if (filters.currency && filters.currency.trim()) {
        url += `&currency=${encodeURIComponent(filters.currency)}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get event transactions with pagination and filters
  getEventTransactions: async (
    eventId: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: TransactionStatus | 'All';
      giftStatus?: 'All' | 'gift' | 'not-gift';
      paymentMethod?: PaymentMethod | 'All';
      searchTerm?: string;
      startDate?: string;
      endDate?: string;
      currency?: string; // Comma-separated currency codes
    }
  ): Promise<AllTransactionsResponse> => {
    let url = `/admin/events/single-event-transactions/${eventId}?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.status && filters.status !== 'All') {
        url += `&status=${filters.status}`;
      }
      if (filters.giftStatus && filters.giftStatus !== 'All') {
        url += `&giftStatus=${filters.giftStatus}`;
      }
      if (filters.paymentMethod && filters.paymentMethod !== 'All') {
        url += `&paymentMethod=${filters.paymentMethod}`;
      }
      if (filters.searchTerm && filters.searchTerm.trim()) {
        url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
      }
      if (filters.startDate) {
        url += `&startDate=${filters.startDate}`;
      }
      if (filters.endDate) {
        url += `&endDate=${filters.endDate}`;
      }
      if (filters.currency && filters.currency.trim()) {
        url += `&currency=${encodeURIComponent(filters.currency)}`;
      }
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get transaction statistics
  getTransactionStats: async (
    filters?: {
      currency?: string; // Comma-separated currency codes
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ message: string; stats: TransactionStats }> => {
    let url = '/admin/transactions/transaction-stats';
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.currency && filters.currency.trim()) {
        params.append('currency', filters.currency);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
};