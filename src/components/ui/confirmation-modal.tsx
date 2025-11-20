import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

/**
 * Props for ConfirmationModal
 * - isOpen: controls visibility
 * - onClose: close handler
 * - onConfirm: called when user confirms (optionally with reason)
 * - showReasonInput: whether a textarea for a reason should be shown
 */
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
  showReasonInput?: boolean;
  isLoading?: boolean;
}

/**
 * ConfirmationModal
 * Modal that asks the user to confirm an action. Optionally requests a reason.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor,
  showReasonInput = false,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-dark-300 mb-6">{message}</p>
          
          {showReasonInput && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this event..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 resize-none"
                rows={4}
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (showReasonInput && !reason.trim())}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${confirmColor}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};