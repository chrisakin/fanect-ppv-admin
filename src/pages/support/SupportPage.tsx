import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useFeedbackStore } from '../../store/feedbackStore';
import { FeedbackTable } from '../../components/feedback/FeedbackTable';
import { ErrorAlert } from '../../components/ui/error-alert';

const SupportPage: React.FC = () => {
  const {
    feedbacks,
    loading,
    error,
    currentPage,
    totalPages,
    totalDocs,
    limit,
    filters,
    setFilters,
    setCurrentPage,
    fetchAllFeedbacks,
    clearError
  } = useFeedbackStore();

  useEffect(() => {
    fetchAllFeedbacks(currentPage, filters.searchTerm);
  }, [currentPage, filters.startDate, filters.endDate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchAllFeedbacks(1, filters.searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      const dateRange = JSON.parse(value);
      setFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setFilters({ [key]: value });
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      startDate: '',
      endDate: ''
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Feedback & Ratings</h1>
        </div>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={clearError}
      />

      {/* Feedback Table */}
      <FeedbackTable
        feedbacks={feedbacks}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalDocs={totalDocs}
        limit={limit}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        showEventColumn={true}
        emptyMessage="No Feedback Found"
        emptyDescription="No feedback has been submitted yet."
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        showFilters={true}
      />
    </div>
  );
};

export default SupportPage;