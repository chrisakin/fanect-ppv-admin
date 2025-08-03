import React, { useState, useRef, useEffect } from 'react';
import { X, Search, MapPin, Plus } from 'lucide-react';

interface LocationOption {
  value: string;
  label: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedLocations: string[]) => void;
  existingLocations: string[];
  isSubmitting: boolean;
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

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingLocations,
  isSubmitting
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedLocations([]);
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filter locations based on search term and exclude existing ones
  const filteredLocations = ALL_LOCATIONS.filter(location => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = location.label.toLowerCase().includes(searchLower) ||
                         location.value.toLowerCase().includes(searchLower);
    const notExisting = !existingLocations.includes(location.value);
    return matchesSearch && notExisting;
  });

  const handleLocationToggle = (locationValue: string) => {
    if (selectedLocations.includes(locationValue)) {
      setSelectedLocations(prev => prev.filter(loc => loc !== locationValue));
    } else {
      setSelectedLocations(prev => [...prev, locationValue]);
    }
  };

  const handleSubmit = () => {
    if (selectedLocations.length > 0) {
      onSubmit(selectedLocations);
    }
  };

  const handleClose = () => {
    setSelectedLocations([]);
    setSearchTerm('');
    onClose();
  };

  const getLocationLabel = (locationValue: string) => {
    const location = ALL_LOCATIONS.find(loc => loc.value === locationValue);
    return location ? location.label : locationValue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Add Event Locations</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400"
              disabled={isSubmitting}
            />
          </div>

          {/* Selected Locations */}
          {selectedLocations.length > 0 && (
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3">
                Selected Locations ({selectedLocations.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map((locationValue) => (
                  <div
                    key={locationValue}
                    className="flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{getLocationLabel(locationValue)}</span>
                    <button
                      type="button"
                      onClick={() => handleLocationToggle(locationValue)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Locations */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3">
              Available Locations
            </h4>
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-dark-700 rounded-lg">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => {
                  const isSelected = selectedLocations.includes(location.value);
                  return (
                    <button
                      key={location.value}
                      type="button"
                      onClick={() => handleLocationToggle(location.value)}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 flex items-center justify-between border-b border-gray-100 dark:border-dark-600 last:border-b-0 disabled:opacity-50 ${
                        isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary-600' : 'bg-gray-100 dark:bg-dark-600'
                        }`}>
                          {isSelected ? (
                            <Plus className="w-4 h-4 text-white rotate-45" />
                          ) : (
                            <MapPin className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                            {location.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-dark-400">
                            {location.value}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                          Selected
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-dark-400">
                  {searchTerm ? `No locations found matching "${searchTerm}"` : 'All locations have been added to this event'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-dark-300">
              {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedLocations.length === 0 || isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Locations</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};