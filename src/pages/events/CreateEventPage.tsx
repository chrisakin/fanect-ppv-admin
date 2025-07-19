import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { eventService, CreateEventData, UpdateEventData } from '../../services/eventService';

interface EventPrice {
  currency: string;
  amount: number;
}

interface FormData {
  name: string;
  date: string;
  time: string;
  description: string;
  prices: EventPrice[];
  haveBroadcastRoom: string;
  broadcastSoftware: string;
  scheduledTestDate: string;
  bannerUrl?: File;
  watermarkUrl?: File;
  eventTrailer?: File;
}

interface FormErrors {
  name?: string;
  date?: string;
  time?: string;
  description?: string;
  prices?: string;
  haveBroadcastRoom?: string;
  broadcastSoftware?: string;
  scheduledTestDate?: string;
  bannerUrl?: string;
  watermarkUrl?: string;
  eventTrailer?: string;
  general?: string;
}

interface ImagePreviews {
  bannerUrl?: string;
  watermarkUrl?: string;
  eventTrailer?: string;
}

const currencies = ['USD', 'NGN', 'EUR', 'GBP'];

// Success Alert Component
interface SuccessAlertProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <p className="text-green-800 dark:text-green-200">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<ImagePreviews>({});
  
  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    date: '',
    time: '',
    description: '',
    prices: [{ currency: 'USD', amount: 0 }],
    haveBroadcastRoom: '',
    broadcastSoftware: '',
    scheduledTestDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load event data for editing
  useEffect(() => {
    if (isEditMode && id) {
      loadEventData(id);
    }
  }, [isEditMode, id]);

  const loadEventData = async (eventId: string) => {
    try {
      setLoading(true);
      const response = await eventService.getSingleEvent(eventId);
      const event = response.results;
      
      setFormData({
        name: event.name,
        date: event.date,
        time: event.time,
        description: event.description,
        prices: event.prices.length > 0 ? event.prices : [{ currency: 'USD', amount: 0 }],
        haveBroadcastRoom: event.haveBroadcastRoom ? 'yes' : 'no',
        broadcastSoftware: event.broadcastSoftware,
        scheduledTestDate: event.scheduledTestDate || '',
      });

      // Set image previews if URLs exist
      if (event.bannerUrl) {
        setImagePreviews(prev => ({ ...prev, bannerUrl: event.bannerUrl }));
      }
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || 'Failed to load event data' });
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Event name must be less than 100 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Event description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Event description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate prices
    const validPrices = formData.prices.filter(price => price.amount > 0);
    if (validPrices.length === 0) {
      newErrors.prices = 'At least one price must be greater than 0, or set all to 0 for free event';
    } else {
      for (const price of validPrices) {
        if (price.amount < 0) {
          newErrors.prices = 'Price cannot be negative';
          break;
        }
        if (price.amount > 10000) {
          newErrors.prices = 'Price cannot exceed 10,000';
          break;
        }
      }
    }

    if (!formData.haveBroadcastRoom) {
      newErrors.haveBroadcastRoom = 'Please select if you have a broadcast room';
    }

    if (!formData.broadcastSoftware.trim()) {
      newErrors.broadcastSoftware = 'Broadcast software information is required';
    } else if (formData.broadcastSoftware.length > 500) {
      newErrors.broadcastSoftware = 'Broadcast software description must be less than 500 characters';
    }

    if (formData.scheduledTestDate) {
      const testDate = new Date(formData.scheduledTestDate);
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (testDate < today) {
        newErrors.scheduledTestDate = 'Test date cannot be in the past';
      } else if (testDate >= eventDate) {
        newErrors.scheduledTestDate = 'Test date must be before the event date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Clear error when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleDateChange = (field: 'date' | 'scheduledTestDate', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user changes date
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, time: value }));
    
    // Clear error when user changes time
    if (errors.time) {
      setErrors(prev => ({ ...prev, time: undefined }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes selection
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriceChange = (index: number, field: 'currency' | 'amount', value: string) => {
    const newPrices = [...formData.prices];
    if (field === 'amount') {
      newPrices[index] = { ...newPrices[index], [field]: parseFloat(value) || 0 };
    } else {
      newPrices[index] = { ...newPrices[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, prices: newPrices }));
    
    // Clear price errors
    if (errors.prices) {
      setErrors(prev => ({ ...prev, prices: undefined }));
    }
  };

  const addPrice = () => {
    const availableCurrencies = currencies.filter(
      currency => !formData.prices.some(price => price.currency === currency)
    );
    
    if (availableCurrencies.length > 0) {
      setFormData(prev => ({
        ...prev,
        prices: [...prev.prices, { currency: availableCurrencies[0], amount: 0 }]
      }));
    }
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerUrl' | 'watermarkUrl' | 'eventTrailer') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
        return;
      }

      // Validate file type
      if (field === 'eventTrailer') {
        if (!file.type.startsWith('video/')) {
          setErrors(prev => ({ ...prev, [field]: 'Please select a valid video file' }));
          return;
        }
      } else {
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, [field]: 'Please select a valid image file' }));
          return;
        }
      }

      setFormData(prev => ({ ...prev, [field]: file }));
      
      // Create preview for images
      if (field !== 'eventTrailer') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => ({ ...prev, [field]: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreviews(prev => ({ ...prev, [field]: file.name }));
      }

      // Clear error
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    }
  };

  // Step navigation
  const handleContinue = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const eventData: CreateEventData | UpdateEventData = {
        name: formData.name.trim(),
        date: formData.date,
        time: formData.time,
        description: formData.description.trim(),
        prices: formData.prices.filter(price => price.amount >= 0),
        haveBroadcastRoom: formData.haveBroadcastRoom === 'yes',
        broadcastSoftware: formData.broadcastSoftware.trim(),
        scheduledTestDate: formData.scheduledTestDate || undefined,
        bannerUrl: formData.bannerUrl,
        watermarkUrl: formData.watermarkUrl,
        eventTrailer: formData.eventTrailer,
      };

      let response;
      if (isEditMode && id) {
        response = await eventService.updateEvent(id, eventData as UpdateEventData);
      } else {
        response = await eventService.createEvent(eventData as CreateEventData);
      }

      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || `Event ${isEditMode ? 'updated' : 'created'} successfully!`
      });

      // Navigate back to events list after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error: any) {
      setErrors({ 
        general: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Events</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
          <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
            <div className="p-6 lg:p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-dark-100 mb-2">
                  {isEditMode ? 'Edit Event' : 'Create Event'}
                </h1>
                <p className="text-gray-600 dark:text-dark-300">
                  {isEditMode ? 'Update your event details' : 'Enter your event details to create an event'}
                </p>
                <p className="text-gray-500 dark:text-dark-400 mt-2">
                  Step {currentStep} of 2
                </p>
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Event Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Event Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                        errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter event name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Event Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Event Date *
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange('date', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 ${
                        errors.date ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                    )}
                  </div>

                  {/* Event Time */}
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Event Time *
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 ${
                        errors.time ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.time}</p>
                    )}
                  </div>

                  {/* Event Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Event Description *
                    </label>
                    <textarea
                      id="description"
                      rows={6}
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 resize-none ${
                        errors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter event description. You can use line breaks for paragraphs and format your text as needed."
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Tip: Use line breaks to create paragraphs. Your formatting will be preserved.
                    </p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                  </div>

                  {/* Continue Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={isSubmitting}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Pricing and Additional Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Event Pricing */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">
                        Event Pricing
                      </h3>
                      {formData.prices.length < currencies.length && (
                        <button
                          type="button"
                          onClick={addPrice}
                          className="flex items-center space-x-2 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Currency</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {formData.prices.map((price, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-24">
                            <select
                              value={price.currency}
                              onChange={(e) => handlePriceChange(index, 'currency', e.target.value)}
                              disabled={isSubmitting}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
                            >
                              {currencies.map((currency) => {
                                const isSelected = formData.prices.some(
                                  (p, i) => p.currency === currency && i !== index
                                );
                                return (
                                  <option
                                    key={currency}
                                    value={currency}
                                    disabled={isSelected}
                                  >
                                    {currency}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          <div className="flex-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={price.amount || ''}
                              onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                              disabled={isSubmitting}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
                              placeholder="Enter amount"
                            />
                          </div>

                          {formData.prices.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePrice(index)}
                              disabled={isSubmitting}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {errors.prices && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prices}</p>
                    )}
                  </div>

                  {/* Broadcast Room Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Do you have a broadcast room? *
                    </label>
                    <select
                      value={formData.haveBroadcastRoom}
                      onChange={(e) => handleSelectChange('haveBroadcastRoom', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 ${
                        errors.haveBroadcastRoom ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                    >
                      <option value="">Select answer</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {errors.haveBroadcastRoom && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.haveBroadcastRoom}</p>
                    )}
                  </div>

                  {/* Broadcast Software */}
                  <div>
                    <label htmlFor="broadcastSoftware" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      What broadcast software will you be using? *
                    </label>
                    <textarea
                      id="broadcastSoftware"
                      rows={3}
                      value={formData.broadcastSoftware}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 resize-none ${
                        errors.broadcastSoftware ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter broadcast software details"
                    />
                    {errors.broadcastSoftware && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.broadcastSoftware}</p>
                    )}
                  </div>

                  {/* Test Stream Date */}
                  <div>
                    <label htmlFor="scheduledTestDate" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Schedule Test Stream with FaNect Support
                    </label>
                    <input
                      id="scheduledTestDate"
                      type="date"
                      value={formData.scheduledTestDate}
                      onChange={(e) => handleDateChange('scheduledTestDate', e.target.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 ${
                        errors.scheduledTestDate ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                    />
                    {errors.scheduledTestDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.scheduledTestDate}</p>
                    )}
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-6">
                    {/* Event Banner Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        Event Banner
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors duration-200">
                        {imagePreviews.bannerUrl ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreviews.bannerUrl}
                              alt="Banner Preview"
                              className="max-h-32 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, bannerUrl: undefined }));
                                setImagePreviews(prev => ({ ...prev, bannerUrl: undefined }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-dark-300 mb-2">Upload event banner</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'bannerUrl')}
                              disabled={isSubmitting}
                              className="hidden"
                              id="bannerUrl"
                            />
                            <label
                              htmlFor="bannerUrl"
                              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                      </div>
                      {errors.bannerUrl && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bannerUrl}</p>
                      )}
                    </div>

                    {/* Watermark Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        Custom Watermark (this could be your logo)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors duration-200">
                        {imagePreviews.watermarkUrl ? (
                          <div className="space-y-4">
                            <img
                              src={imagePreviews.watermarkUrl}
                              alt="Watermark Preview"
                              className="max-h-32 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, watermarkUrl: undefined }));
                                setImagePreviews(prev => ({ ...prev, watermarkUrl: undefined }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-dark-300 mb-2">Upload watermark</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'watermarkUrl')}
                              disabled={isSubmitting}
                              className="hidden"
                              id="watermarkUrl"
                            />
                            <label
                              htmlFor="watermarkUrl"
                              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                      </div>
                      {errors.watermarkUrl && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.watermarkUrl}</p>
                      )}
                    </div>

                    {/* Event Trailer Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        Event Trailer
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors duration-200">
                        {imagePreviews.eventTrailer ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Upload className="w-6 h-6 text-primary-600" />
                              <span className="text-primary-600 text-sm">{imagePreviews.eventTrailer}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, eventTrailer: undefined }));
                                setImagePreviews(prev => ({ ...prev, eventTrailer: undefined }));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 dark:text-dark-300 mb-2">Upload event trailer</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleFileChange(e, 'eventTrailer')}
                              disabled={isSubmitting}
                              className="hidden"
                              id="eventTrailer"
                            />
                            <label
                              htmlFor="eventTrailer"
                              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                      </div>
                      {errors.eventTrailer && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventTrailer}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 
                        (isEditMode ? "Updating Event..." : "Creating Event...") : 
                        (isEditMode ? "Update Event" : "Create Event")
                      }
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="w-full border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-dark-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default CreateEventPage;