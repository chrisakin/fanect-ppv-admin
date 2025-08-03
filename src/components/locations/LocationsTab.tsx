import React, { useState, useEffect } from 'react';
import { MapPin, Search, X, Plus, Trash2 } from 'lucide-react';
import { locationService } from '../../services/locationService';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';
import { SuccessAlert } from '../ui/success-alert';

interface EventLocation {
  location: string;
}

interface LocationOption {
  value: string;
  label: string;
}

interface LocationsTabProps {
  eventId: string;
}

// List of all available locations (countries)
const ALL_LOCATIONS: LocationOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'AU', label: 'Australia' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'KE', label: 'Kenya' },
  { value: 'GH', label: 'Ghana' },
  { value: 'EG', label: 'Egypt' },
  { value: 'MA', label: 'Morocco' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'PH', label: 'Philippines' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'KR', label: 'South Korea' },
  { value: 'TR', label: 'Turkey' },
  { value: 'RU', label: 'Russia' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GR', label: 'Greece' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'HU', label: 'Hungary' },
  { value: 'RO', label: 'Romania' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'HR', label: 'Croatia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LV', label: 'Latvia' },
  { value: 'EE', label: 'Estonia' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'PE', label: 'Peru' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'PA', label: 'Panama' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'HN', label: 'Honduras' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'BZ', label: 'Belize' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'CU', label: 'Cuba' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'HT', label: 'Haiti' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'IL', label: 'Israel' },
  { value: 'JO', label: 'Jordan' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'SY', label: 'Syria' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IR', label: 'Iran' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'NP', label: 'Nepal' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'MV', label: 'Maldives' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'LA', label: 'Laos' },
  { value: 'BN', label: 'Brunei' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'SB', label: 'Solomon Islands' },
  { value: 'VU', label: 'Vanuatu' },
  { value: 'NC', label: 'New Caledonia' },
  { value: 'PF', label: 'French Polynesia' },
  { value: 'WS', label: 'Samoa' },
  { value: 'TO', label: 'Tonga' },
  { value: 'KI', label: 'Kiribati' },
  { value: 'TV', label: 'Tuvalu' },
  { value: 'NR', label: 'Nauru' },
  { value: 'PW', label: 'Palau' },
  { value: 'FM', label: 'Micronesia' },
  { value: 'MH', label: 'Marshall Islands' },
  { value: 'NZ', label: 'New Zealand' }
].sort((a, b) => a.label.localeCompare(b.label));

export const LocationsTab: React.FC<LocationsTabProps> = ({ eventId }) => {
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch event locations
  const fetchEventLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationService.getEventLocations(eventId);
      setEventLocations(response.locations || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventLocations();
  }, [eventId]);

  // Filter locations based on search term
  const filteredLocations = ALL_LOCATIONS.filter(location => {
    const searchLower = searchTerm.toLowerCase();
    return (
      location.label.toLowerCase().includes(searchLower) ||
      location.value.toLowerCase().includes(searchLower)
    );
  });

  // Get available locations (not already selected)
  const availableLocations = filteredLocations.filter(location => 
    !eventLocations.some(eventLoc => eventLoc.location === location.value)
  );

  // Get location label by value
  const getLocationLabel = (locationValue: string) => {
    const location = ALL_LOCATIONS.find(loc => loc.value === locationValue);
    return location ? location.label : locationValue;
  };

  // Handle location selection
  const handleLocationSelect = async (locationValue: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create the payload with all selected locations plus the new one
      const updatedLocations = [
        ...eventLocations,
        { location: locationValue }
      ];

      // Send to backend
      const payload = updatedLocations.map(loc => ({
        location: loc.location,
        event: eventId
      }));

      const response = await locationService.addLocationToEvent(eventId, payload as any);
      
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Location added successfully!'
      });

      // Refresh locations
      await fetchEventLocations();
      
      setIsDropdownOpen(false);
      setSearchTerm('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add location');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle location removal
  const handleLocationRemove = async (locationValue: string) => {
    if (!confirm('Are you sure you want to remove this location?')) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await locationService.removeLocationFromEvent(eventId, locationValue);
      
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Location removed successfully!'
      });

      // Refresh locations
      await fetchEventLocations();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove location');
    } finally {
      setIsSubmitting(false);
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
        
        {/* Location Search Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isSubmitting || availableLocations.length === 0}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-[9999] max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 dark:border-dark-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 text-sm"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Location List */}
              <div className="max-h-60 overflow-y-auto">
                {availableLocations.length > 0 ? (
                  availableLocations.map((location) => (
                    <button
                      key={location.value}
                      type="button"
                      onClick={() => handleLocationSelect(location.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 flex items-center space-x-3 disabled:opacity-50"
                    >
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          {location.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-dark-400">
                          {location.value}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-dark-400">
                    {searchTerm ? `No locations found matching "${searchTerm}"` : 'All locations have been added'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backdrop */}
          {isDropdownOpen && (
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => {
                setIsDropdownOpen(false);
                setSearchTerm('');
              }}
            />
          )}
        </div>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      {/* Selected Locations */}
      {eventLocations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Locations Added</h3>
          <p className="text-gray-500 dark:text-dark-400 mb-4">Add locations where this event will be available.</p>
          <button
            onClick={() => setIsDropdownOpen(true)}
            disabled={isSubmitting}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
          >
            Add First Location
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700">
            <h4 className="text-md font-semibold text-gray-900 dark:text-dark-100">
              Selected Locations ({eventLocations.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {eventLocations.map((eventLocation, index) => (
              <div key={`${eventLocation.location}-${index}`} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                      {getLocationLabel(eventLocation.location)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-400">
                      {eventLocation.location}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLocationRemove(eventLocation.location)}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};