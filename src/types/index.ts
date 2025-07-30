export interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  lastLogin: Date;
  joinedDate: Date;
  eventsJoined: number;
  totalPayments: number;
  isLocked: boolean;
}

// Add interface for API user structure to match the actual API response
export interface ApiUser {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
  locked: boolean;
  status: 'Active' | 'Inactive';
  eventsJoinedCount: number;
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  scheduledTime: Date;
  status: 'Draft' | 'Pending' | 'Live' | 'Completed';
  totalViews: number;
  avgWatchTime: number;
  chatCount: number;
  streamPassPurchases: number;
  revenue: number;
  bannerUrl?: string;
  watermarkUrl?: string;
  trailerUrl?: string;
}

export interface EventCreator {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Add interface for API event structure to match the actual API response
export interface ApiEventDetailed extends Omit<ApiEvent, 'eventDateTime'> {
  canWatchSavedStream: boolean;
  publishedBy?: string;
  __v: number;
  createdBy: EventCreator;
}

export interface Organizer {
  id: string;
  name: string;
  email: string;
  totalEvents: number;
  revenue: number;
  kycStatus: 'Verified' | 'Not Verified' | 'Pending';
  joinedDate: Date;
}

export interface Transaction {
  id: string;
  eventName: string;
  userName: string;
  amount: number;
  gateway: 'Paystack' | 'Stripe';
  status: 'Completed' | 'Pending' | 'Failed';
  date: Date;
  type: 'Ticket' | 'StreamPass' | 'Gift';
}

export interface SupportTicket {
  id: string;
  userName: string;
  userEmail: string;
  eventName: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  rating?: number;
}

export interface DashboardStats {
  liveEvents: number;
  totalTicketsSold: number;
  streamHealth: 'OK' | 'Warning' | 'Error';
  errorCount: number;
  totalRevenue: number;
  activeUsers: number;
  newUsers: number;
  conversionRate: number;
}