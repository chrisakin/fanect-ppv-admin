import React, { useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface ActionItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

interface ActionDropdownProps {
  items: ActionItem[];
  isOpen: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  onClickOutside?: () => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  items,
  isOpen,
  onToggle,
  isLoading = false,
  onClickOutside
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClickOutside?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClickOutside]);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
        disabled={isLoading}
      >
        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-dark-400" />
      </button>
      
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-[9999]"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                }}
                disabled={item.disabled || isLoading}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50 ${
                  item.className || 'text-gray-700 dark:text-dark-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};