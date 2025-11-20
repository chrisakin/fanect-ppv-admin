import api from '../utils/api';

/**
 * EventLocation
 * Simple representation of a saved location for an event.
 */
interface EventLocation {
  location: string;
  _id: string;
}

/**
 * EventLocationsApiResponse
 * Response shape for fetching locations for an event.
 */
interface EventLocationsApiResponse {
  message: string;
  locations: EventLocation[];
}

/**
 * LocationPayload
 * Payload used when adding/removing a location from an event.
 */
interface LocationPayload {
  location: string;
  event: string;
}

/**
 * locationService
 * CRUD helpers for event locations (list, add, remove).
 */
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
  removeLocationFromEvent: async (_eventId: string, locationValue: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/events/delete-event-location/${locationValue}`);
    return response.data;
  },
};