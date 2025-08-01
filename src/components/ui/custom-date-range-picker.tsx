import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, Search } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface CustomDateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showSearchButton?: boolean;
  onSearch?: (dateRange: DateRange) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  className,
  showSearchButton = false,
  onSearch
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempDateRange, setTempDateRange] = useState<DateRange>(value);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const date = String(selectedDate.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${date}`;

    let newDateRange: DateRange;

    if (selectingStart || !tempDateRange.startDate) {
      newDateRange = {
        startDate: formatted,
        endDate: null
      };
      setSelectingStart(false);
    } else {
      const startDate = new Date(tempDateRange.startDate);
      const endDate = new Date(formatted);
      
      if (endDate < startDate) {
        // If end date is before start date, swap them
        newDateRange = {
          startDate: formatted,
          endDate: tempDateRange.startDate
        };
      } else {
        newDateRange = {
          startDate: tempDateRange.startDate,
          endDate: formatted
        };
      }
      setSelectingStart(true);
    }

    setTempDateRange(newDateRange);

    // If not using search button, apply changes immediately
    if (!showSearchButton) {
      onChange(newDateRange);
      if (newDateRange.startDate && newDateRange.endDate) {
        setIsOpen(false);
      }
    }
  };

  const handleSearch = () => {
    onChange(tempDateRange);
    if (onSearch) {
      onSearch(tempDateRange);
    }
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateInRange = (day: number) => {
    const dateRange = showSearchButton ? tempDateRange : value;
    if (!dateRange.startDate || !dateRange.endDate) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    
    return date >= start && date <= end;
  };

  const isDateSelected = (day: number) => {
    const dateRange = showSearchButton ? tempDateRange : value;
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    return dateStr === dateRange.startDate || dateStr === dateRange.endDate;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={cn(
            "w-8 h-8 text-sm rounded-md transition-colors relative",
            isSelected && "bg-green-600 text-white hover:bg-green-700 z-10",
            isInRange && !isSelected && "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
            isToday && !isSelected && !isInRange && "bg-gray-200 dark:bg-gray-600",
            !isSelected && !isInRange && "hover:bg-gray-100 dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-green-500"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDisplayDate = () => {
    const dateRange = showSearchButton ? value : (showSearchButton ? tempDateRange : value);
    if (!dateRange.startDate && !dateRange.endDate) return '';
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    if (dateRange.startDate && dateRange.endDate) {
      return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    } else if (dateRange.startDate) {
      return `${formatDate(dateRange.startDate)} - Select end date`;
    }
    
    return '';
  };

  const clearDates = () => {
    const clearedRange = { startDate: null, endDate: null };
    setTempDateRange(clearedRange);
    if (!showSearchButton) {
      onChange(clearedRange);
    }
    setSelectingStart(true);
  };

  const handleOpen = () => {
    if (!disabled) {
      setTempDateRange(value);
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Input
          value={formatDisplayDate()}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={handleOpen}
          className={cn("cursor-pointer pr-10 w-full", className)}
        />
        <CalendarIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg shadow-lg z-[9999] p-4 min-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="p-1 h-8 w-8"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            
            <div className="text-sm font-medium">
              {months[currentMonth]} {currentYear}
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="p-1 h-8 w-8"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Selection indicator */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
            {selectingStart && !tempDateRange.startDate ? 'Select start date' : 
             !selectingStart && tempDateRange.startDate && !tempDateRange.endDate ? 'Select end date' : 
             'Date range selected'}
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearDates}
              className="text-gray-600 dark:text-gray-400"
            >
              Clear
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 dark:text-gray-400"
              >
                Close
              </Button>
               {showSearchButton && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSearch}
                  disabled={!tempDateRange.startDate || !tempDateRange.endDate}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Search</span>
                </Button>
              )}
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