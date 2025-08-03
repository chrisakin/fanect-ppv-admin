import React from 'react';
import { X } from 'lucide-react';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export const DescriptionModal: React.FC<DescriptionModalProps> = ({
  isOpen,
  onClose,
  title,
  description
}) => {
  if (!isOpen) return null;

  const formatDescription = (text: string) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0 text-gray-700 dark:text-dark-300 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {formatDescription(description)}
          </div>
        </div>
      </div>
    </div>
  );
};