import api from '../utils/api';

export interface OrganiserEventStats {
  total: number;
  published: number;
  approved: number;
  pending: number;
  rejected: number;
  live: number;
  upcoming: number;
  past: number;
}

export interface OrganiserRevenue {
  total: number;
  totalTransactions: number;
  successfulTransactions: number;
  giftTransactions: number;
  averageTransactionValue: number;
}

export interface OrganiserEngagement {
  totalViews: number;
  liveViews: number;
  replayViews: number;
  totalStreampassesSold: number;
  uniqueViewers: number;
}

export interface OrganiserRatings {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

export interface OrganiserTopEvent {
  _id: string;
  name: string;
  date: string;
  status: string;
  revenue: number;
  views: number;
  ratings: number;
  streampassesSold: number;
}

export interface OrganiserAnalytics {
  _id: string;
  eventStats: OrganiserEventStats;
  revenue: OrganiserRevenue;
  engagement: OrganiserEngagement;
  ratings: OrganiserRatings;
  topEvents: OrganiserTopEvent[];
}

export interface OrganiserAnalyticsResponse {
  message: string;
  analytics: OrganiserAnalytics;
}

export const organiserAnalyticsService = {
  // Get organiser analytics
  getOrganiserAnalytics: async (
    organiserId: string,
    month?: string,
    currency?: string
  ): Promise<OrganiserAnalytics> => {
    let url = `/admin/organisers/single-organiser-analytics/${organiserId}`;
    const params = new URLSearchParams();
    
    if (month) {
      params.append('month', month);
    }
    if (currency) {
      params.append('currency', currency);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.analytics;
  },
};