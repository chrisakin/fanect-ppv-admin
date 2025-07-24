import React, { useState, useRef, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface CustomTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(value ? parseInt(value.split(':')[0]) : 12);
  const [selectedMinute, setSelectedMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);
  const [selectedPeriod, setSelectedPeriod] = useState(value ? (parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM') : 'AM');
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour);
      setSelectedMinute(minute);
      setSelectedPeriod(hour >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  const formatTime = (hour: number, minute: number, period: string) => {
    let hour24 = hour;
    if (period === 'AM' && hour === 12) hour24 = 0;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (hour: number, minute: number, period: string) => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeSelect = () => {
    const timeString = formatTime(selectedHour, selectedMinute, selectedPeriod);
    onChange(timeString);
    setIsOpen(false);
  };

  const scrollToSelected = (ref: React.RefObject<HTMLDivElement>, value: number) => {
    if (ref.current) {
      const itemHeight = 32; // Height of each item
      ref.current.scrollTop = value * itemHeight - ref.current.clientHeight / 2 + itemHeight / 2;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToSelected(hourRef, selectedHour - 1);
        scrollToSelected(minuteRef, selectedMinute);
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  return (
    <div className="relative w-full">
      <div className="relative w-full">
        <Input
          value={value ? formatDisplayTime(selectedHour, selectedMinute, selectedPeriod) : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn("cursor-pointer pr-10 w-full", className)}
        />
        <ClockIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#13201A] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 min-w-[280px]">
          <div className="flex items-center justify-between space-x-4">
            {/* Hours */}
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-center">Hour</div>
              <div 
                ref={hourRef}
                className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              >
                {hours.map(hour => (
                  <div
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={cn(
                      "h-8 flex items-center justify-center cursor-pointer rounded text-sm transition-colors",
                      selectedHour === hour 
                        ? "bg-green-600 text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-center">Minute</div>
              <div 
                ref={minuteRef}
                className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              >
                {minutes.map(minute => (
                  <div
                    key={minute}
                    onClick={() => setSelectedMinute(minute)}
                    className={cn(
                      "h-8 flex items-center justify-center cursor-pointer rounded text-sm transition-colors",
                      selectedMinute === minute 
                        ? "bg-green-600 text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className="flex-1">
              <div className="text-sm font-medium mb-2 text-center">Period</div>
              <div className="space-y-1">
                {['AM', 'PM'].map(period => (
                  <div
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "h-8 flex items-center justify-center cursor-pointer rounded text-sm transition-colors",
                      selectedPeriod === period 
                        ? "bg-green-600 text-white" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {period}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTimeSelect}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Select
            </button>
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