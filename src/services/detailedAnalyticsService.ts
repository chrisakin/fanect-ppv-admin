import api from '../utils/api';

export enum EventStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  PAST = 'Past'
}

export enum UserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PlatformMetrics {
  users: number;
  events: number;
  transactions: number;
  revenue: number;
}

export interface StatusBreakdown {
  _id: string;
  count: number;
  amount: number;
}

export interface PaymentMethodBreakdown {
  _id: string;
  count: number;
  amount: number;
}

export interface FinancialMetrics {
  statusBreakdown: StatusBreakdown[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}

export interface UserMetrics {
  _id: null;
  total: number;
  verified: number;
  active: number;
  locked: number;
}

export interface EventMetrics {
  _id: null;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  live: number;
}

export interface ViewMetrics {
  _id: string;
  count: number;
}

export interface RatingMetrics {
  _id: number;
  count: number;
}

export interface EngagementMetrics {
  views: ViewMetrics[];
  ratings: RatingMetrics[];
}

export interface GeographicData {
  message: string;
}

export interface PerformanceMetrics {
  conversionRate: string;
  averageSessionDuration: string;
}

export interface DetailedAnalytics {
  dateRange: DateRange;
  filters: {
    currency: string;
  };
  platformMetrics: PlatformMetrics;
  financialMetrics: FinancialMetrics;
  userMetrics: UserMetrics;
  eventMetrics: EventMetrics;
  engagementMetrics: EngagementMetrics;
  geographicData: GeographicData;
  performanceMetrics: PerformanceMetrics;
}

export interface DetailedAnalyticsResponse {
  message: string;
  data: DetailedAnalytics;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  currency?: string;
  eventStatus?: EventStatus;
  userStatus?: UserStatus;
}

export const detailedAnalyticsService = {
  // Get detailed analytics
  getDetailedAnalytics: async (filters?: AnalyticsFilters): Promise<DetailedAnalyticsResponse> => {
    let url = '/admin/analytics/detailed';
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters.currency) {
        params.append('currency', filters.currency);
      }
      if (filters.eventStatus) {
        params.append('eventStatus', filters.eventStatus);
      }
      if (filters.userStatus) {
        params.append('userStatus', filters.userStatus);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
};