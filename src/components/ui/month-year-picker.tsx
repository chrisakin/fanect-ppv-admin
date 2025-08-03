import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MonthYearPickerProps {
  value: string; // Format: YYYY-MM
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  placeholder = "Select month and year",
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse current value
  const [currentYear, currentMonth] = value ? value.split('-') : ['', ''];
  
  // Generate years (current year - 5 to current year + 5)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearNum - 5 + i);

  const handleMonthSelect = (month: string) => {
    if (currentYear) {
      const newValue = `${currentYear}-${month}`;
      onChange(newValue);
      setIsOpen(false);
    }
  };

  const handleYearSelect = (year: number) => {
    if (currentMonth) {
      const newValue = `${year}-${currentMonth}`;
      onChange(newValue);
      setIsOpen(false);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    const [year, month] = value.split('-');
    const monthObj = months.find(m => m.value === month);
    return `${monthObj?.label || month} ${year}`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-left bg-white dark:bg-dark-900 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={value ? 'text-gray-900 dark:text-dark-100' : 'text-gray-400 dark:text-dark-400'}>
            {value ? formatDisplayValue() : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg z-[9999] overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-dark-700">
            {/* Months */}
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-dark-400 px-2 py-1 mb-1">Month</div>
              <div className="max-h-48 overflow-y-auto">
                {months.map((month) => (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => handleMonthSelect(month.value)}
                    className={cn(
                      "w-full px-2 py-2 text-left text-sm rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors",
                      currentMonth === month.value && "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    )}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years */}
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-dark-400 px-2 py-1 mb-1">Year</div>
              <div className="max-h-48 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "w-full px-2 py-2 text-left text-sm rounded hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors",
                      currentYear === year.toString() && "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};