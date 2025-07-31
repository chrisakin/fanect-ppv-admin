import api from '../utils/api';
import { UserTransactionsResponse, TransactionStatus, PaymentMethod } from '../types/transaction';

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
    }
    
    const response = await api.get(url);
    return response.data;
  },
};