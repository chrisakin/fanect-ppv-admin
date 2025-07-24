import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null | string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value).getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(value ? new Date(value).getFullYear() : new Date().getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

 const handleDateSelect = (day: number) => {
  const selectedDate = new Date(currentYear, currentMonth, day);
  // Format as YYYY-MM-DD
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const date = String(selectedDate.getDate()).padStart(2, "0");
  const formatted = `${year}-${month}-${date}`;
  onChange(formatted); // Pass string instead of Date
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
      const isSelected = value && 
        new Date(value).getDate() === day && 
        new Date(value).getMonth() === currentMonth && 
        new Date(value).getFullYear() === currentYear;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      const dateObj = new Date(currentYear, currentMonth, day);
      const isPast = dateObj < today;
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={cn(
            "w-8 h-8 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            isSelected && "bg-green-600 text-white hover:bg-green-700",
            isToday && !isSelected && "bg-gray-200 dark:bg-gray-600",
            "focus:outline-none focus:ring-2 focus:ring-green-500",
            isPast
          ? "bg-gray-100 text-gray-400 dark:bg-transparent cursor-not-allowed"
          : "hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          )}
          disabled={isPast}
        >
          {day}
        </button>
      );
    }

    return days;
  };

 const formatInputDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Input
          value={value ? formatInputDate(value) : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn("cursor-pointer pr-10 w-full", className)}
        />
        <CalendarIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#13201A] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
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

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};