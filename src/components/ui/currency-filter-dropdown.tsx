import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { availableCurrencies, currencyNames } from '../../constants/currencies';

interface CurrencyFilterDropdownProps {
  selectedCurrencies: string[];
  onChange: (currencies: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyFilterDropdown: React.FC<CurrencyFilterDropdownProps> = ({
  selectedCurrencies,
  onChange,
  placeholder = "Filter by currencies",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleCurrencyToggle = (currency: string) => {
    if (selectedCurrencies.includes(currency)) {
      onChange(selectedCurrencies.filter(c => c !== currency));
    } else {
      onChange([...selectedCurrencies, currency]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCurrencies.length === availableCurrencies.length) {
      onChange([]);
    } else {
      onChange([...availableCurrencies]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (selectedCurrencies.length === 0) {
      return placeholder;
    } else if (selectedCurrencies.length === 1) {
      return `${selectedCurrencies[0]} - ${currencyNames[selectedCurrencies[0]]}`;
    } else if (selectedCurrencies.length <= 3) {
      return selectedCurrencies.join(', ');
    } else {
      return `${selectedCurrencies.length} currencies selected`;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 flex items-center justify-between"
      >
        <span className={`truncate ${selectedCurrencies.length === 0 ? 'text-gray-400 dark:text-dark-400' : 'text-gray-900 dark:text-dark-100'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-[9999] max-h-64 overflow-hidden">
          {/* Header with actions */}
          <div className="p-3 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-300">
                Select Currencies ({selectedCurrencies.length}/{availableCurrencies.length})
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  {selectedCurrencies.length === availableCurrencies.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedCurrencies.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Currency list */}
          <div className="max-h-48 overflow-y-auto">
            {availableCurrencies.map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => handleCurrencyToggle(currency)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedCurrencies.includes(currency)
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300 dark:border-dark-600'
                  }`}>
                    {selectedCurrencies.includes(currency) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                      {currency}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-dark-400">
                      {currencyNames[currency]}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};