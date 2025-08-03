import React, { useState } from 'react';
import { X, MapPin, AlertCircle, Save } from 'lucide-react';
import { CreateLocationData, LocationFormErrors } from '../../types/location';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (locationData: CreateLocationData) => Promise<{ success: boolean; message?: string }>;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateLocationData>({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: undefined,
    longitude: undefined,
    description: '',
    capacity: undefined
  });
  const [errors, setErrors] = useState<LocationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LocationFormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Location name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude !== undefined && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (formData.capacity !== undefined && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateLocationData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await onSubmit({
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      });

      if (result.success) {
        handleClose();
      } else {
        setErrors({ general: result.message || 'Failed to add location' });
      }
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: undefined,
      longitude: undefined,
      description: '',
      capacity: undefined
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Add Event Location</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Location Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                  errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="e.g., Main Conference Hall"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Street Address *
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                  errors.address ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="e.g., 123 Main Street"
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* City, State, Country */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  City *
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.city ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="City"
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  State *
                </label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.state ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="State"
                  disabled={isSubmitting}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Country *
                </label>
                <input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.country ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="Country"
                  disabled={isSubmitting}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.country}
                  </p>
                )}
              </div>
            </div>

            {/* Zip Code and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.zipCode ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="12345"
                  disabled={isSubmitting}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.zipCode}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.capacity ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="e.g., 500"
                  min="1"
                  disabled={isSubmitting}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.capacity}
                  </p>
                )}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Latitude
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.latitude ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="e.g., 40.7128"
                  disabled={isSubmitting}
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.latitude}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                  Longitude
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                    errors.longitude ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="e.g., -74.0060"
                  disabled={isSubmitting}
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 resize-none ${
                  errors.description ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="Additional details about this location..."
                rows={3}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Add Location</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};