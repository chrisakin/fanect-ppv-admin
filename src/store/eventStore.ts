import { create } from 'zustand';
import { eventService, CreateEventData, UpdateEventData } from '../services/eventService';
import { Currency } from '../types/event';

export interface EventPrice {
  currency: Currency;
  amount: number;
  _id?: string;
}

export interface EventFormData {
  name: string;
  date: string;
  time: string;
  description: string;
  prices: EventPrice[];
  haveBroadcastRoom: boolean;
  broadcastSoftware: string;
  scheduledTestDate: string;
  bannerUrl: File | null;
  watermarkUrl: File | null;
  eventTrailer: File | null;
}

export interface EventFormErrors {
  [key: string]: string | undefined;
}

interface EventState {
  // Form state
  formData: EventFormData;
  errors: EventFormErrors;
  isLoading: boolean;
  isSubmitting: boolean;
  
  // File previews
  filePreviews: {
    bannerUrl?: { file: File | null; preview: string; type: 'image' | 'video' };
    watermarkUrl?: { file: File | null; preview: string; type: 'image' | 'video' };
    eventTrailer?: { file: File | null; preview: string; type: 'image' | 'video' };
  };
  
  // Actions
  setFormData: (data: Partial<EventFormData>) => void;
  setError: (field: string, error: string | undefined) => void;
  clearErrors: () => void;
  setFilePreview: (field: keyof EventFormData, preview: { file: File | null; preview: string; type: 'image' | 'video' }) => void;
  removeFilePreview: (field: keyof EventFormData) => void;
  resetForm: () => void;
  loadEventForEdit: (eventId: string) => Promise<void>;
  submitEvent: (isEditing: boolean, eventId?: string) => Promise<{ success: boolean; message?: string }>;
  validateForm: () => boolean;
}

const initialFormData: EventFormData = {
  name: '',
  date: '',
  time: '',
  description: '',
  prices: [{ currency: Currency.USD, amount: 0 }],
  haveBroadcastRoom: false,
  broadcastSoftware: '',
  scheduledTestDate: '',
  bannerUrl: null,
  watermarkUrl: null,
  eventTrailer: null,
};

export const useEventStore = create<EventState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isLoading: false,
  isSubmitting: false,
  filePreviews: {},

  setFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
      // Clear related errors when data changes
      errors: Object.keys(data).reduce((acc, key) => {
        const newErrors = { ...state.errors };
        delete newErrors[key];
        return newErrors;
      }, state.errors)
    }));
  },

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error }
    }));
  },

  clearErrors: () => {
    set({ errors: {} });
  },

  setFilePreview: (field, preview) => {
    set((state) => ({
      filePreviews: { ...state.filePreviews, [field]: preview }
    }));
  },

  removeFilePreview: (field) => {
    set((state) => {
      const newPreviews = { ...state.filePreviews };
      delete newPreviews[field];
      return { filePreviews: newPreviews };
    });
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      errors: {},
      filePreviews: {},
      isLoading: false,
      isSubmitting: false
    });
  },

  loadEventForEdit: async (eventId: string) => {
    try {
      set({ isLoading: true, errors: {} });
      const response = await eventService.getSingleEvent(eventId);
      const event = response.results;
      
      const formData: EventFormData = {
        name: event.name || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        description: event.description || '',
        prices: event.prices?.length > 0 ? event.prices : [{ currency: Currency.USD, amount: 0 }],
        haveBroadcastRoom: event.haveBroadcastRoom || false,
        broadcastSoftware: event.broadcastSoftware || '',
        scheduledTestDate: event.scheduledTestDate ? new Date(event.scheduledTestDate).toISOString().split('T')[0] : '',
        bannerUrl: null,
        watermarkUrl: null,
        eventTrailer: null,
      };

      // Set existing file previews
      const previews: Record<string, { file: File | null; preview: string; type: 'image' | 'video' }> = {};
      if (event.bannerUrl) {
        previews.bannerUrl = {
          preview: event.bannerUrl,
          type: 'image' as const,
          file: null
        };
      }
      if (event.watermarkUrl) {
        previews.watermarkUrl = {
          preview: event.watermarkUrl,
          type: 'image' as const,
          file: null
        };
      }
      if (event.trailerUrl) {
        previews.eventTrailer = {
          preview: event.trailerUrl,
          type: 'video' as const,
          file: null
        };
      }

      set({ formData, filePreviews: previews });
    } catch (error: any) {
      set({ 
        errors: { general: error.response?.data?.message || 'Failed to load event' }
      });
    } finally {
      set({ isLoading: false });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const errors: EventFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Event name is required';
    }

    if (!formData.date) {
      errors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = 'Event date cannot be in the past';
      }
    }

    if (!formData.time) {
      errors.time = 'Event time is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
    }

    if (!formData.broadcastSoftware.trim()) {
      errors.broadcastSoftware = 'Broadcast software information is required';
    }

    if (!formData.scheduledTestDate) {
      errors.scheduledTestDate = 'Test stream date is required';
    }

    // Validate prices
    const validPrices = formData.prices.filter(price => 
      price.currency !== Currency.NONE && price.amount >= 0
    );
    if (validPrices.length === 0) {
      errors.prices = 'At least one valid price is required';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  submitEvent: async (isEditing: boolean, eventId?: string) => {
    const { formData, validateForm } = get();
    
    if (!validateForm()) {
      return { success: false, message: 'Please fix the form errors' };
    }

    try {
      set({ isSubmitting: true, errors: {} });

      const submitData: CreateEventData | UpdateEventData = {
        name: formData.name,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        prices: formData.prices.filter(price => price.currency !== Currency.NONE),
        haveBroadcastRoom: formData.haveBroadcastRoom,
        broadcastSoftware: formData.broadcastSoftware,
        scheduledTestDate: formData.scheduledTestDate,
        banner: formData.bannerUrl,
        watermark: formData.watermarkUrl,
        trailer: formData.eventTrailer,
      };

      if (isEditing && eventId) {
        await eventService.updateEvent(eventId, submitData);
        return { success: true, message: 'Event updated successfully!' };
      } else {
        await eventService.createEvent(submitData);
        return { success: true, message: 'Event created successfully!' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} event`;
      set({ errors: { general: errorMessage } });
      return { success: false, message: errorMessage };
    } finally {
      set({ isSubmitting: false });
    }
  }
}));