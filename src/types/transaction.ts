/**
 * TransactionStatus
 * Possible states for a transaction.
 */
export enum TransactionStatus {
  SUCCESSFUL = 'Successful',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

/**
 * PaymentMethod
 * Payment gateway identifiers used on transactions.
 */
export enum PaymentMethod {
  FLUTTERWAVE = 'flutterwave',
  STRIPE = 'stripe'
}

/**
 * UserTransaction
 * Detailed transaction record associated with a user and an event.
 */
export interface UserTransaction {
  _id: string;
  user: string;
  firstName?: string;
  lastName?: string;
  isGift: boolean;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  currency: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  __v: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventStatus: string;
  eventAdminStatus: string;
  eventId: string;
}

/**
 * UserTransactionsResponse
 * Paginated response wrapper for user transaction lists.
 */
export interface UserTransactionsResponse {
  message: string;
  docs: UserTransaction[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

/**
 * TransactionFilters
 * Query filters used when fetching transaction lists (status, method, date range).
 */
export interface TransactionFilters {
  status: TransactionStatus | 'All';
  giftStatus: 'All' | 'gift' | 'not-gift';
  paymentMethod: PaymentMethod | 'All';
  searchTerm: string;
  startDate: string;
  endDate: string;
}