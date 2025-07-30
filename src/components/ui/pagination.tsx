import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalDocs,
  limit,
  onPreviousPage,
  onNextPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dark-600">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-dark-300">
            Showing <span className="font-medium">{((currentPage - 1) * limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * limit, totalDocs)}</span> of{' '}
            <span className="font-medium">{totalDocs}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-700 dark:text-dark-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};