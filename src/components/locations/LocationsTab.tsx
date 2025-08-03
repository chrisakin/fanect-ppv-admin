import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { EventLocation, CreateLocationData, LocationFormErrors } from '../../types/location';
import { locationService } from '../../services/locationService';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';
import { SuccessAlert } from '../ui/success-alert';
import { AddLocationModal } from './AddLocationModal';

interface LocationsTabProps {
  eventId: string;
}

export const LocationsTab: React.FC<LocationsTabProps> = ({ eventId }) => {
  const [locations, setLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch locations
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationService.getEventLocations(eventId);
      setLocations(response.locations);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [eventId]);

  const handleAddLocation = async (locationData: CreateLocationData) => {
    try {
      const response = await locationService.addLocationToEvent(eventId, locationData);
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Location added successfully!'
      });
      fetchLocations(); // Refresh locations
      return { success: true };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add location' 
      };
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to remove this location?')) return;

    try {
      const response = await locationService.removeLocationFromEvent(eventId, locationId);
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Location removed successfully!'
      });
      fetchLocations(); // Refresh locations
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove location');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Event Locations</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Locations Added</h3>
          <p className="text-gray-500 dark:text-dark-400 mb-4">Add locations where this event will take place.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((location) => (
            <div key={location._id} className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100">{location.name}</h4>
                    {location.capacity && (
                      <p className="text-sm text-gray-500 dark:text-dark-400">Capacity: {location.capacity.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLocation(location._id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Address:</span>
                  <p className="text-gray-900 dark:text-dark-100">{location.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-dark-300">City:</span>
                    <p className="text-gray-900 dark:text-dark-100">{location.city}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-dark-300">State:</span>
                    <p className="text-gray-900 dark:text-dark-100">{location.state}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Country:</span>
                    <p className="text-gray-900 dark:text-dark-100">{location.country}</p>
                  </div>
                  {location.zipCode && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Zip Code:</span>
                      <p className="text-gray-900 dark:text-dark-100">{location.zipCode}</p>
                    </div>
                  )}
                </div>

                {location.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Description:</span>
                    <p className="text-gray-900 dark:text-dark-100 text-sm">{location.description}</p>
                  </div>
                )}

                {(location.latitude && location.longitude) && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Coordinates:</span>
                    <p className="text-gray-900 dark:text-dark-100 text-sm font-mono">
                      {location.latitude}, {location.longitude}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-dark-400 pt-2 border-t border-gray-200 dark:border-dark-600">
                  Added on {new Date(location.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLocation}
      />

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};