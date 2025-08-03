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

export interface EventLocationsResponse {
  message: string;
  locations: EventLocation[];
}

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