import api from '../utils/api';
import { EventLocationsResponse, CreateLocationData } from '../types/location';

export const locationService = {
  // Get all locations for an event
  getEventLocations: async (eventId: string): Promise<EventLocationsResponse> => {
    const response = await api.get(`/admin/events/event-locations/${eventId}`);
    return response.data;
  },

  // Add location to event
  addLocationToEvent: async (eventId: string, locationData: CreateLocationData): Promise<{ message: string }> => {
    const response = await api.post(`/admin/events/update-event-locations/${eventId}`, locationData);
    return response.data;
  },

  // Remove location from event
  removeLocationFromEvent: async (eventId: string, locationId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/events/update-event-locations/${eventId}/${locationId}`);
    return response.data;
  },
};