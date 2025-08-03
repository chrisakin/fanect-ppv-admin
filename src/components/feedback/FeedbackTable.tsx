import React from 'react';
import { Star, MessageCircle, Calendar, Eye } from 'lucide-react';
import { Feedback, FeedbackFilters } from '../../types/feedback';
import { FeedbackModal } from '../ui/feedback-modal';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Pagination } from '../ui/pagination';
import { FilterBar } from '../ui/filter-bar';
import { CustomDateRangePicker } from '../ui/custom-date-range-picker';

interface FeedbackTableProps {
  feedbacks: Feedback[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  showEventColumn?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  // Filter props
  filters?: FeedbackFilters;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showFilters?: boolean;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  feedbacks,
  loading,
  currentPage,
  totalPages,
  totalDocs,
  limit,
  onPreviousPage,
  onNextPage,
  showEventColumn = true,
  emptyMessage = "No Feedback Found",
  emptyDescription = "No feedback has been submitted yet.",
  filters,
  onFilterChange,
  onClearFilters,
  showFilters = false
}) => {
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = React.useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsFeedbackModalOpen(true);
  };

  // Filter configuration
  const filterConfigs = filters && onFilterChange && onClearFilters ? [
    {
      key: 'dateRange',
      label: 'Date Range',
      value: JSON.stringify({
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }),
      type: 'custom' as const,
      component: (
        <CustomDateRangePicker
          value={{
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
          }}
          onChange={(dateRange) => 
            onFilterChange('dateRange', JSON.stringify(dateRange))
          }
          placeholder="Select date range"
          className="h-10"
          showSearchButton={true}
          onSearch={(dateRange) => 
            onFilterChange('dateRange', JSON.stringify(dateRange))
          }
        />
      ),
      options: []
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && filters && onFilterChange && onClearFilters && (
        <FilterBar
          filters={filterConfigs}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          searchValue={filters.searchTerm}
          onSearchChange={(value) => onFilterChange('searchTerm', value)}
          searchPlaceholder="Search by event name, user name, or comments..."
        />
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[300px]">
        {loading ? (
          <LoadingSpinner />
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 dark:text-dark-400">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full table-fixed min-w-[800px]">
                <colgroup>
                  <col className="w-[150px]" />
                  {showEventColumn && <col className="w-[200px]" />}
                  <col className="w-[120px]" />
                  <col className="w-[300px]" />
                  <col className="w-[120px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      User
                    </th>
                    {showEventColumn && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                        Event
                      </th>
                    )}
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          {feedback.firstName && feedback.lastName ? (
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {feedback.firstName} {feedback.lastName}
                            </div>
                          ) : feedback.userName ? (
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {feedback.userName}
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-500 dark:text-dark-400">
                              Anonymous
                            </div>
                          )}
                        </div>
                      </td>
                      {showEventColumn && (
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {feedback.eventName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-dark-400">
                              {new Date(feedback.eventDate).toLocaleDateString()} at {feedback.eventTime}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {renderStars(feedback.ratings)}
                          <span className="text-sm text-gray-600 dark:text-dark-300 ml-2">
                            ({feedback.ratings}/5)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-100">
                          {feedback.comments ? (
                            <div className="max-w-xs" title={feedback.comments}>
                              {truncateText(feedback.comments, 80)}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-dark-500 italic">No comments</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-100">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-400">
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewFeedback(feedback)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalDocs={totalDocs}
              limit={limit}
              onPreviousPage={onPreviousPage}
              onNextPage={onNextPage}
            />
          </>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setSelectedFeedback(null);
        }}
        feedback={selectedFeedback}
      />
    </div>
  );
};