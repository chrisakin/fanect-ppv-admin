import api from '../utils/api';

export interface UserStats {
  total: number;
  new: number;
  active: number;
  verified: number;
  verificationRate: string;
}

export interface EventStats {
  total: number;
  new: number;
  live: number;
  approved: number;
  approvalRate: string;
}

export interface RevenueStats {
  total: number;
  transactions: number;
  average: number;
  giftTransactions: number;
  currency: string;
}

export interface EngagementStats {
  totalViews: number;
  streampassesSold: number;
  feedbacks: number;
  averageRating: number;
}

export interface RecentEvent {
  _id: string;
  name: string;
  status: string;
  adminStatus: string;
  createdBy: string;
  createdAt: string;
}

export interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface TopEvent {
  _id: string;
  name: string;
  date: string;
  status: string;
  revenue: number;
  viewCount: number;
}

export interface ChartData {
  userGrowth: Array<{
    _id: string;
    count: number;
  }>;
  revenueGrowth: Array<{
    _id: string;
    revenue: number;
    transactions: number;
  }>;
}

export interface DashboardAnalytics {
  timeframe: string;
  currency: string;
  userStats: UserStats;
  eventStats: EventStats;
  revenueStats: RevenueStats;
  engagementStats: EngagementStats;
  recentActivity: {
    recentEvents: RecentEvent[];
    recentUsers: RecentUser[];
  };
  topEvents: TopEvent[];
  charts: ChartData;
}

export interface DashboardResponse {
  message: string;
  data: DashboardAnalytics;
}

export const dashboardService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
    currency: string = 'USD'
  ): Promise<DashboardResponse> => {
    const response = await api.get(`/admin/analytics/dashboard?timeframe=${timeframe}&currency=${currency}`);
    return response.data;
  },
};