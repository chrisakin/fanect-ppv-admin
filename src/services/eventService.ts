import api from '../utils/api';

import { EventCreator } from '../types';

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
  trailerUrl?: string;
  watermarkUrl?: string;
  prices: EventPrice[];
  published: boolean;
  status: 'Past' | 'Live' | 'Upcoming';
  adminStatus: 'Pending' | 'Approved' | 'Rejected';
  createdBy: EventCreator;
  haveBroadcastRoom: boolean;
  broadcastSoftware: string;
  scheduledTestDate?: string;
  createdAt: string;
  updatedAt: string;
  ivsChannelArn?: string;
  ivsChatRoomArn?: string;
  ivsPlaybackUrl?: string;
  ivsIngestEndpoint?: string;
  ivsIngestStreamKey?: string;
  publishedBy?: string;
  eventDateTime: string;
  canWatchSavedStream?: boolean;
  isStreaming?: boolean;
}

export interface CreateEventData {
  name: string;
  date: string;
  time: string;
  description: string;
  prices: EventPrice[];
  haveBroadcastRoom: boolean;
  broadcastSoftware: string;
  scheduledTestDate?: string;
  bannerUrl?: File;
  watermarkUrl?: File;
  eventTrailer?: File;
}

export interface UpdateEventData extends CreateEventData {
  // Same as CreateEventData for now
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
  results: ApiEvent;
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
      searchTerm?: string;
    }
  ): Promise<EventsResponse> => {
    let url = `/admin/events/all-events?page=${page}&limit=${limit}`;
    
    if (filters) {
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.status && filters.status !== 'All') url += `&status=${filters.status}`;
      if (filters.adminStatus && filters.adminStatus !== 'All') url += `&adminStatus=${filters.adminStatus}`;
      if (filters.searchTerm && filters.searchTerm.trim()) url += `&search=${encodeURIComponent(filters.searchTerm.trim())}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single event by ID
  getSingleEvent: async (id: string): Promise<SingleEventResponse> => {
    const response = await api.get(`/admin/events/single-event/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (eventData: CreateEventData): Promise<{ message: string }> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', eventData.name);
    formData.append('date', eventData.date);
    formData.append('time', eventData.time);
    formData.append('description', eventData.description);
    formData.append('haveBroadcastRoom', eventData.haveBroadcastRoom.toString());
    formData.append('broadcastSoftware', eventData.broadcastSoftware);
    
    if (eventData.scheduledTestDate) {
      formData.append('scheduledTestDate', eventData.scheduledTestDate);
    }
    
    // Add prices as JSON string
    formData.append('prices', JSON.stringify(eventData.prices));
    
    // Add files
    if (eventData.bannerUrl) {
      formData.append('bannerUrl', eventData.bannerUrl);
    }
    if (eventData.watermarkUrl) {
      formData.append('watermarkUrl', eventData.watermarkUrl);
    }
    if (eventData.eventTrailer) {
      formData.append('eventTrailer', eventData.eventTrailer);
    }
    
    const response = await api.post('/admin/events/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update existing event
  updateEvent: async (id: string, eventData: UpdateEventData): Promise<{ message: string }> => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', eventData.name);
    formData.append('date', eventData.date);
    formData.append('time', eventData.time);
    formData.append('description', eventData.description);
    formData.append('haveBroadcastRoom', eventData.haveBroadcastRoom.toString());
    formData.append('broadcastSoftware', eventData.broadcastSoftware);
    
    if (eventData.scheduledTestDate) {
      formData.append('scheduledTestDate', eventData.scheduledTestDate);
    }
    
    // Add prices as JSON string
    formData.append('prices', JSON.stringify(eventData.prices));
    
    // Add files (only if new files are provided)
    if (eventData.bannerUrl instanceof File) {
      formData.append('bannerUrl', eventData.bannerUrl);
    }
    if (eventData.watermarkUrl instanceof File) {
      formData.append('watermarkUrl', eventData.watermarkUrl);
    }
    if (eventData.eventTrailer instanceof File) {
      formData.append('eventTrailer', eventData.eventTrailer);
    }
    
    const response = await api.put(`/admin/events/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Approve/publish an event
  approveEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/publish/${id}`);
    return response.data;
  },

  // Reject an event
  rejectEvent: async (id: string, reason?: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/reject/${id}`, {
      rejectionReason: reason
    });
    return response.data;
  },

  // Unpublish an approved event
  unpublishEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/unpublish/${id}`);
    return response.data;
  },

  // Update event session (start/end stream)
  updateEventSession: async (id: string, session: 'stream-start' | 'stream-end'): Promise<{ message: string }> => {
    const response = await api.put(`/admin/events/update-event-session/${id}`, {
      session
    });
    return response.data;
  }
};