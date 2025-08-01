export enum TransactionStatus {
  SUCCESSFUL = 'Successful',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

export enum PaymentMethod {
  FLUTTERWAVE = 'flutterwave',
  STRIPE = 'stripe'
}

export interface UserTransaction {
  _id: string;
  user: string;
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

export interface TransactionFilters {
  status: TransactionStatus | 'All';
  giftStatus: 'All' | 'gift' | 'not-gift';
  paymentMethod: PaymentMethod | 'All';
  searchTerm: string;
  startDate: string;
  endDate: string;
}