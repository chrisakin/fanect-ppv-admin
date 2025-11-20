import api from '../utils/api';

/**
 * EventMetrics
 * Metrics and aggregated stats for a single event (ratings, earnings, viewers, feedback).
 */
export interface EventMetrics {
  _id: string;
  name: string;
  ratings: Array<{
    avg: number;
    count: number;
    breakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }>;
  earnings: {
    totalRevenue: number;
    totalTransactions: number;
    transactions: Array<{
      date: string;
      amount: number;
    }>;
  };
  viewers: {
    total: number;
    replay: number;
    peak: number | null;
  };
  chat: {
    count: number;
  };
  feedback: Array<{
    id: string;
    rating: number;
    createdAt: string;
  }>;
}

export interface EventMetricsResponse {
  message?: string;
  data?: EventMetrics;
}

/**
 * eventMetricsService
 * Fetch per-event analytics such as ratings, earnings and viewers for reporting pages.
 */
export const eventMetricsService = {
  // Get event metrics
  getEventMetrics: async (
    eventId: string,
    month?: string,
    currency?: string
  ): Promise<EventMetrics> => {
    let url = `/admin/events/single-event-metrics/${eventId}`;
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
    return response.data;
  },
};