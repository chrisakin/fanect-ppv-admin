/**
 * EventLocation
 * Represents a physical location where an event can take place.
 */
export interface EventLocation {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * EventLocationsResponse
 * Response wrapper returning a list of event locations.
 */
export interface EventLocationsResponse {
  message: string;
  locations: EventLocation[];
}

/**
 * CreateLocationData
 * Payload for creating or updating an event location.
 */
export interface CreateLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  capacity?: number;
}

/**
 * LocationFormErrors
 * Client-side validation error shape for location forms.
 */
export interface LocationFormErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
  capacity?: string;
  general?: string;
}