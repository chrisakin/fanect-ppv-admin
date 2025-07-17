import api from '../utils/api';

export interface EventPrice {
  currency: string;
  amount: number;
  _id: string;
}

export interface ApiEvent {
  _id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  bannerUrl?: string;
  prices: EventPrice[];
  published: boolean;
  status: 'Past' | 'Live' | 'Upcoming';
  adminStatus: 'Pending' | 'Approved' | 'Rejected';
  createdBy: string;
  haveBroadcastRoom: boolean;
  broadcastSoftware: string;
  scheduledTestDate?: string;
  createdAt: string;
  updatedAt: string;
  ivsChannelArn?: string;
  ivsChatRoomArn?: string;
  ivsPlaybackUrl?: string;
  publishedBy?: string;
  eventDateTime: string;
}

export interface EventsResponse {
  message: string;
  docs: ApiEvent[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  limit: number;
}

export interface SingleEventResponse {
  message: string;
  data: ApiEvent;
}

export const eventService = {
  // Get all events with pagination
  getAllEvents: async (
    page: number = 1, 
    limit: number = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      adminStatus?: string;
    }
  ): Promise<EventsResponse> => {
    let url = `/admin/events/all-events?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.status && filters.status !== 'All') url += `&status=${filters.status}`;
      if (filters.adminStatus && filters.adminStatus !== 'All') url += `&adminStatus=${filters.adminStatus}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single event by ID
  getSingleEvent: async (id: string): Promise<SingleEventResponse> => {
    const response = await api.get(`/admin/events/single-event/${id}`);
    return response.data;
  },

  // Approve/publish an event
  approveEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/publish/${id}`);
    return response.data;
  },

  // Reject an event
  rejectEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/reject/${id}`);
    return response.data;
  },

  // Unpublish an approved event
  unpublishEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/unpublish/${id}`);
    return response.data;
  }
};