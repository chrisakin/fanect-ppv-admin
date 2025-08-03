import React from 'react';
import { X, Star, Calendar, User, MessageCircle } from 'lucide-react';
import { Feedback } from '../../types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: Feedback | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  feedback
}) => {
  if (!isOpen || !feedback) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const formatComments = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0 text-gray-700 dark:text-dark-300 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Feedback Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Event Information */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Event Information
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Event Name:</span>
                <p className="text-gray-900 dark:text-dark-100">{feedback.eventName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Event Date & Time:</span>
                <p className="text-gray-900 dark:text-dark-100">
                  {new Date(feedback.eventDate).toLocaleDateString()} at {feedback.eventTime}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Event Status:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                    {feedback.eventStatus}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Admin Status:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium">
                    {feedback.eventAdminStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              User Information
            </h4>
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Submitted by:</span>
              <p className="text-gray-900 dark:text-dark-100">
                {feedback.firstName && feedback.lastName 
                  ? `${feedback.firstName} ${feedback.lastName}` 
                  : feedback.userName || 'Anonymous User'}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">Rating</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(feedback.ratings)}
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                {feedback.ratings}/5
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments
            </h4>
            {feedback.comments ? (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {formatComments(feedback.comments)}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-dark-400 italic">No comments provided</p>
            )}
          </div>

          {/* Submission Date */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-3">Submission Details</h4>
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-dark-300">Submitted on:</span>
              <p className="text-gray-900 dark:text-dark-100">
                {new Date(feedback.createdAt).toLocaleDateString()} at {new Date(feedback.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};