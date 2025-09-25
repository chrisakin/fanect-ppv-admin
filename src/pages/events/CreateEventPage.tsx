import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  DollarSign, 
  Settings, 
  FileText, 
  Image, 
  Video, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Save,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useEventStore } from '../../store/eventStore';
import { Currency } from '../../types/event';
import { CustomDatePicker } from "../../components/ui/custom-date-picker";
import { CustomTimePicker } from "../../components/ui/custom-time-picker";
import { eventService } from '../../services/eventService';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [eventData, setEventData] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(false);
  
  const {
    formData,
    errors,
    isLoading,
    isSubmitting,
    filePreviews,
    setFormData,
    setError,
    clearErrors,
    setFilePreview,
    removeFilePreview,
    resetForm,
    loadEventForEdit,
    submitEvent,
  } = useEventStore();

  const [showSuccess, setShowSuccess] = useState(false);

  // Load event data for editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchEventData = async () => {
        try {
          setEventLoading(true);
          const response = await eventService.getSingleEvent(id);
          setEventData(response.results);
          
          if (response.results.isDeleted) {
            // Redirect to view page if event is deleted
            navigate(`/events/${id}`, { replace: true });
            return;
          }
          
          loadEventForEdit(id);
        } catch (error) {
          console.error('Error fetching event data:', error);
          navigate('/events', { replace: true });
        } finally {
          setEventLoading(false);
        }
      };
      
      fetchEventData();
    } else {
      resetForm();
    }

    return () => {
      resetForm();
    };
  }, [id, isEditing, loadEventForEdit, resetForm]);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ [field]: value });
  };

   const handleDateChange = (field: 'date' | 'scheduledTestDate', date: string | null) => {
    // setFormData((prev: unknown) => ({
    //   ...prev,
    //   [field]: date,
    // }));
    setFormData({ [field]: date || '' });
    // Clear error when date is selected
    setError(field, undefined);
  };

  const handleTimeChange = (time: string) => {
    setFormData({ time });
    // Clear error when time is selected
    setError('time', undefined);
  };

  const handlePriceChange = (index: number, field: 'currency' | 'amount', value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: field === 'amount' ? Number(value) : value
    };
    setFormData({ prices: newPrices });
  };

  const addPrice = () => {
    const availableCurrencies = Object.values(Currency).filter(c => 
      c !== Currency.NONE && !formData.prices.some(p => p.currency === c)
    );
    
    if (availableCurrencies.length > 0) {
      setFormData({ 
        prices: [...formData.prices, { 
          currency: availableCurrencies[0], 
          amount: 0 
        }]
      });
    }
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      const newPrices = formData.prices.filter((_, i) => i !== index);
      setFormData({ prices: newPrices });
    }
  };

  const handleFileChange = (field: 'bannerUrl' | 'watermarkUrl' | 'eventTrailer', file: File | null) => {
    if (!file) return;

    const isVideo = field === 'eventTrailer';
    const validType = isVideo ? file.type.startsWith('video/') : file.type.startsWith('image/');
    
    if (!validType) {
      setError(field, isVideo ? 'Please upload a video file' : 'Please upload an image file');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(field, 'File size must be less than 10MB');
      return;
    }

    setFormData({ [field]: file });

    // Create preview
    if (!isVideo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(field, {
          file,
          preview: reader.result as string,
          type: 'image'
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(field, {
        file,
        preview: URL.createObjectURL(file),
        type: 'video'
      });
    }
  };

  const removeFile = (field: 'bannerUrl' | 'watermarkUrl' | 'eventTrailer') => {
    setFormData({ [field]: null });
    removeFilePreview(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.prices.length === 0 || formData.prices.some(p => p.amount <= 0)) {
      errors.prices = "At least one valid price is required or an amount is empty or 0";
      setError('price', 'At least one valid price is required or an amount is empty or 0');
      return
    }
    const result = await submitEvent(isEditing, id);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } else {
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currencies = Object.values(Currency).filter(c => c !== Currency.NONE);
  const availableCurrencies = currencies.filter(c => 
    !formData.prices.some(p => p.currency === c)
  );

  if (isLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-dark-300">
            {eventLoading ? 'Loading event details...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Events</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-dark-600" />
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
                  {isEditing ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  {isEditing ? 'Update your event details' : 'Fill in the details to create a new event'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Update Event' : 'Create Event'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                <p className="text-red-800 dark:text-red-200">{errors.general}</p>
              </div>
              <button
                onClick={() => clearErrors()}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Basic Information</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Event Date *
                      </label>
                      <CustomDatePicker
                          value={formData.date ? new Date(formData.date) : null}
                          onChange={(date) => handleDateChange('date', date)}
                          placeholder="Select event date"
                          disabled={isSubmitting}
                          className={`h-[50px] w-full px-3.5 py-2.5 bg-white dark:bg-dark-800 rounded-lg border border-solid border-gray-300 dark:border-dark-600 font-normal text-gray-700 dark:text-gray-200 text-base ${
                            errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
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
                       <CustomTimePicker
                          value={formData.time}
                          onChange={handleTimeChange}
                          placeholder="Select event time"
                          disabled={isSubmitting}
                          className={`h-[50px] w-full px-3.5 py-2.5 bg-white dark:bg-dark-800 rounded-lg border border-solid border-gray-300 dark:border-dark-600 font-normal text-gray-700 dark:text-gray-200 text-base ${
                            errors.time ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
                        />
                      {errors.time && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
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
              </div>

              {/* Pricing */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Pricing</h2>
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
                  </div>
                </div>
                <div className="p-6 space-y-4">
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
                          <SelectTrigger className="h-12 bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600">
                            {currencies.map((currency) => {
                              const isUsed = formData.prices.some((p, i) => p.currency === currency && i !== index);
                              return (
                                <SelectItem 
                                  key={currency} 
                                  value={currency}
                                  disabled={isUsed}
                                  className="hover:bg-gray-100 dark:hover:bg-dark-700"
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
                        id="amount"
                        type="number"
                        className="h-[50px] px-3.5 py-2.5 bg-white dark:bg-dark-800 rounded-lg border-gray-300 dark:border-dark-600 font-normal text-gray-700 dark:text-gray-200 text-base"
                        placeholder="Enter amount"
                        value={price.amount|| ''}
                        onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
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
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Technical Details</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        Do you have a broadcast room? *
                      </label>
                      <Select
                        value={formData.haveBroadcastRoom ? 'yes' : 'no'}
                        onValueChange={(value) => handleInputChange('haveBroadcastRoom', value === 'yes')}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-12 bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600">
                          <SelectItem value="yes" className="hover:bg-gray-100 dark:hover:bg-dark-700">Yes, I have a broadcast room</SelectItem>
                          <SelectItem value="no" className="hover:bg-gray-100 dark:hover:bg-dark-700">No, I need assistance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="scheduledTestDate" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                        Test Stream Date *
                      </label>
                      <CustomDatePicker
                          value={formData.scheduledTestDate ? new Date(formData.scheduledTestDate) : null}
                          onChange={(date) => handleDateChange('scheduledTestDate', date)}
                          placeholder="Select test stream date"
                          disabled={isSubmitting}
                          className={`h-[50px] w-full px-3.5 py-2.5 bg-white dark:bg-dark-800 rounded-lg border border-solid border-gray-300 dark:border-dark-600 font-normal text-gray-700 dark:text-gray-200 text-base ${
                            errors.scheduledTestDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                          }`}
                        />
                      {errors.scheduledTestDate && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.scheduledTestDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
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
              </div>
            </div>

            {/* Sidebar - Media Upload */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 sticky top-24">
                <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-primary-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Media Files</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                      Event Banner {!isEditing && '*'}
                      <span className="text-gray-500 text-xs block">Recommended: 1920x1080px, Max: 10MB</span>
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      errors.bannerUrl ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-dark-600 hover:border-primary-500'
                    }`}>
                      {filePreviews.bannerUrl ? (
                        <div className="relative">
                          <img
                            src={filePreviews.bannerUrl.preview}
                            alt="Banner preview"
                            className="max-h-32 mx-auto rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('bannerUrl')}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">Upload Banner</p>
                          <p className="text-xs text-gray-500 dark:text-dark-400">
                            Click to browse
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

                  {/* Watermark Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
                      Custom Watermark (Optional)
                      <span className="text-gray-500 text-xs block">Your logo or brand mark</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                      {filePreviews.watermarkUrl ? (
                        <div className="relative">
                          <img
                            src={filePreviews.watermarkUrl.preview}
                            alt="Watermark preview"
                            className="max-h-20 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('watermarkUrl')}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-dark-300">Upload Watermark</p>
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
                      <span className="text-gray-500 text-xs block">Preview video for your event</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                      {filePreviews.eventTrailer ? (
                        <div className="relative">
                          <video
                            src={filePreviews.eventTrailer.preview}
                            controls
                            className="max-h-32 mx-auto rounded-lg shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('eventTrailer')}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-600 dark:text-dark-300 mb-1">Upload Trailer</p>
                          <p className="text-xs text-gray-500 dark:text-dark-400">MP4, MOV, AVI</p>
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
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;