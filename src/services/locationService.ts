import api from '../utils/api';
import { EventLocationsResponse } from '../types/location';

interface EventLocation {
  location: string;
}

interface EventLocationsApiResponse {
  message: string;
  locations: EventLocation[];
}

interface LocationPayload {
  location: string;
  event: string;
}

export const locationService = {
  // Get all locations for an event
  getEventLocations: async (eventId: string): Promise<EventLocationsApiResponse> => {
    const response = await api.get(`/admin/events/event-locations/${eventId}`);
    return response.data;
  },

  // Add location to event
  addLocationToEvent: async (eventId: string, locationPayload: LocationPayload[]): Promise<{ message: string }> => {
    const response = await api.post(`/admin/events/update-event-locations/${eventId}`, locationPayload);
    return response.data;
  },

  // Remove location from event
  removeLocationFromEvent: async (eventId: string, locationValue: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/events/delete-event-location/${locationValue}`);
    return response.data;
  },
};