import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Trash2, Calendar, Clock, DollarSign, Settings, FileText, Image, Video, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { eventService, CreateEventData, UpdateEventData } from '../../services/eventService';
import { Currency } from '../../types/event';

interface EventPrice {
  currency: Currency;
  amount: number;
  _id?: string;
}

interface FormData {
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

interface FormErrors {
  [key: string]: string | undefined;
}

interface FilePreview {
  file: File | null;
  preview: string;
  type: 'image' | 'video';
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<FormData>({
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
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [filePreviews, setFilePreviews] = useState<{
    bannerUrl?: FilePreview;
    watermarkUrl?: FilePreview;
    eventTrailer?: FilePreview;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load event data for editing
  useEffect(() => {
    const loadEvent = async () => {
      if (isEditing && id) {
        try {
          setIsLoading(true);
          const response = await eventService.getSingleEvent(id);
          const event = response.results;
          
          setFormData({
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
          });

          // Set existing file previews
          const previews: any = {};
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
          setFilePreviews(previews);
        } catch (error: any) {
          setApiError(error.response?.data?.message || 'Failed to load event');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadEvent();
  }, [id, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
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
    }

    if (!formData.broadcastSoftware.trim()) {
      newErrors.broadcastSoftware = 'Broadcast software information is required';
    }

    if (!formData.scheduledTestDate) {
      newErrors.scheduledTestDate = 'Test stream date is required';
    }

    // Validate prices
    const validPrices = formData.prices.filter(price => 
      price.currency !== Currency.NONE && price.amount >= 0
    );
    if (validPrices.length === 0) {
      newErrors.prices = 'At least one valid price is required';
    }

    // Validate files for new events
    if (!isEditing) {
      if (!formData.bannerUrl && !filePreviews.bannerUrl) {
        newErrors.bannerUrl = 'Event banner is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handlePriceChange = (index: number, field: 'currency' | 'amount', value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    handleInputChange('prices', newPrices);
  };

  const addPrice = () => {
    const availableCurrencies = Object.values(Currency).filter(c => 
      c !== Currency.NONE && !formData.prices.some(p => p.currency === c)
    );
    
    if (availableCurrencies.length > 0) {
      handleInputChange('prices', [...formData.prices, { 
        currency: availableCurrencies[0], 
        amount: 0 
      }]);
    }
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      handleInputChange('prices', newPrices);
    }
  };

  const handleFileChange = (field: 'bannerUrl' | 'watermarkUrl' | 'eventTrailer', file: File | null) => {
    if (!file) return;

    const isVideo = field === 'eventTrailer';
    const validType = isVideo ? file.type.startsWith('video/') : file.type.startsWith('image/');
    
    if (!validType) {
      setErrors(prev => ({
        ...prev,
        [field]: isVideo ? 'Please upload a video file' : 'Please upload an image file'
      }));
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [field]: 'File size must be less than 10MB'
      }));
      return;
    }

    handleInputChange(field, file);

    // Create preview
    if (!isVideo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [field]: {
            file,
            preview: reader.result as string,
            type: 'image'
          }
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews(prev => ({
        ...prev,
        [field]: {
          file,
          preview: URL.createObjectURL(file),
          type: 'video'
        }
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const removeFile = (field: 'bannerUrl' | 'watermarkUrl' | 'eventTrailer') => {
    handleInputChange(field, null);
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[field];
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
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

      if (isEditing && id) {
        await eventService.updateEvent(id, submitData);
      } else {
        await eventService.createEvent(submitData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/events');
      }, 2000);

    } catch (error: any) {
      setApiError(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencies = Object.values(Currency).filter(c => c !== Currency.NONE);
  const availableCurrencies = currencies.filter(c => 
    !formData.prices.some(p => p.currency === c)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>
          
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="text-gray-600 dark:text-dark-300 mt-2">
              {isEditing ? 'Update your event details below' : 'Fill in the details to create a new event'}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200">
                Event {isEditing ? 'updated' : 'created'} successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-red-800 dark:text-red-200">{apiError}</p>
              </div>
              <button
                onClick={() => setApiError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-dark-700/50">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="w-5 h-5 text-primary-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Event Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter a compelling event name"
                    className={`${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} h-12`}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Event Date *
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`${errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} h-12`}
                    disabled={isSubmitting}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Event Time *
                  </label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className={`${errors.time ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} h-12`}
                    disabled={isSubmitting}
                  />
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.time}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Event Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of your event. What can attendees expect?"
                    rows={5}
                    className={`${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} resize-none`}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-dark-700/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-lg">
                  <DollarSign className="w-5 h-5 text-primary-600" />
                  <span>Pricing</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrice}
                  disabled={availableCurrencies.length === 0 || isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Currency</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.prices.map((price, index) => (
                <div key={index} className="flex items-end space-x-4 p-4 border border-gray-200 dark:border-dark-700 rounded-lg bg-gray-50 dark:bg-dark-700/30">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Currency
                    </label>
                    <Select
                      value={price.currency}
                      onValueChange={(value) => handlePriceChange(index, 'currency', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => {
                          const isUsed = formData.prices.some((p, i) => p.currency === currency && i !== index);
                          return (
                            <SelectItem 
                              key={currency} 
                              value={currency}
                              disabled={isUsed}
                            >
                              {currency} {isUsed && '(Already used)'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Amount
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price.amount}
                      onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="h-12"
                      disabled={isSubmitting}
                    />
                  </div>

                  {formData.prices.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePrice(index)}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-12 px-3"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.prices && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.prices}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-dark-700/50">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Settings className="w-5 h-5 text-primary-600" />
                <span>Technical Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Do you have a broadcast room? *
                  </label>
                  <Select
                    value={formData.haveBroadcastRoom ? 'yes' : 'no'}
                    onValueChange={(value) => handleInputChange('haveBroadcastRoom', value === 'yes')}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I have a broadcast room</SelectItem>
                      <SelectItem value="no">No, I need assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="scheduledTestDate" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Test Stream Date *
                  </label>
                  <Input
                    id="scheduledTestDate"
                    name="scheduledTestDate"
                    type="date"
                    value={formData.scheduledTestDate}
                    onChange={(e) => handleInputChange('scheduledTestDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`${errors.scheduledTestDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} h-12`}
                    disabled={isSubmitting}
                  />
                  {errors.scheduledTestDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.scheduledTestDate}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label htmlFor="broadcastSoftware" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Broadcast Software Details *
                  </label>
                  <Textarea
                    id="broadcastSoftware"
                    name="broadcastSoftware"
                    value={formData.broadcastSoftware}
                    onChange={(e) => handleInputChange('broadcastSoftware', e.target.value)}
                    placeholder="Please describe the broadcast software you'll be using (e.g., OBS Studio, XSplit, etc.) and any specific setup requirements..."
                    rows={4}
                    className={`${errors.broadcastSoftware ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} resize-none`}
                    disabled={isSubmitting}
                  />
                  {errors.broadcastSoftware && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.broadcastSoftware}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-dark-700/50">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Image className="w-5 h-5 text-primary-600" />
                <span>Media Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                  Event Banner {!isEditing && '*'}
                  <span className="text-gray-500 text-xs ml-2">(Recommended: 1920x1080px, Max: 10MB)</span>
                </label>
                <div className="relative">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    errors.bannerUrl ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-dark-600 hover:border-primary-500'
                  }`}>
                    {filePreviews.bannerUrl ? (
                      <div className="relative">
                        <img
                          src={filePreviews.bannerUrl.preview}
                          alt="Banner preview"
                          className="max-h-64 mx-auto rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('bannerUrl')}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-dark-200 mb-2">Upload Event Banner</p>
                        <p className="text-sm text-gray-500 dark:text-dark-400">
                          Drag and drop your banner image here, or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('bannerUrl', e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  </div>
                  {errors.bannerUrl && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bannerUrl}
                    </p>
                  )}
                </div>
              </div>

              {/* Watermark Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                  Custom Watermark (Optional)
                  <span className="text-gray-500 text-xs ml-2">(Your logo or brand mark, Max: 10MB)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  {filePreviews.watermarkUrl ? (
                    <div className="relative">
                      <img
                        src={filePreviews.watermarkUrl.preview}
                        alt="Watermark preview"
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('watermarkUrl')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-dark-300 mb-1">Upload Watermark</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">PNG recommended for transparency</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('watermarkUrl', e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Trailer Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                  <Video className="w-4 h-4 inline mr-1" />
                  Event Trailer (Optional)
                  <span className="text-gray-500 text-xs ml-2">(Preview video for your event, Max: 10MB)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  {filePreviews.eventTrailer ? (
                    <div className="relative">
                      <video
                        src={filePreviews.eventTrailer.preview}
                        controls
                        className="max-h-64 mx-auto rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('eventTrailer')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-dark-300 mb-1">Upload Event Trailer</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">MP4, MOV, or AVI format</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange('eventTrailer', e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
                disabled={isSubmitting}
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:w-auto w-full min-w-[140px] bg-primary-600 hover:bg-primary-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;