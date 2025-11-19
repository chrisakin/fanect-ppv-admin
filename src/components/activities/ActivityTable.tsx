import React from 'react';
import { Activity, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { UserActivity, ActivityFilters } from '../../types/activity';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Pagination } from '../ui/pagination';
import { FilterBar } from '../ui/filter-bar';
import { CustomDateRangePicker } from '../ui/custom-date-range-picker';

/**
 * Props for the `ActivityTable` component.
 * - `activities`: list of user activity records to display
 * - `loading`: whether data is currently loading
 * - Pagination, filter, and sorting callbacks are passed in to
 *   allow parent components to control behavior.
 */
interface ActivityTableProps {
  activities: UserActivity[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  // Filter props
  filters?: ActivityFilters;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showFilters?: boolean;
  userType: string;
  // Sorting props
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  loading,
  currentPage,
  totalPages,
  totalDocs,
  limit,
  onPreviousPage,
  onNextPage,
  emptyMessage = "No Activities Found",
  emptyDescription = "No user activities have been recorded yet.",
  filters,
  onFilterChange,
  onClearFilters,
  showFilters = false,
  userType,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange
}) => {
  // Returns a Tailwind CSS string used to color-code the activity's component
  // (e.g., 'auth', 'event', 'transactions'). This provides a visual cue
  // in the UI by applying background/text color classes.
  const getComponentColor = (component: string) => {
    switch (component) {
      case 'auth':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'event':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'users':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'organisers':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'transactions':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
         case 'feedback':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'streampass':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'withdrawal':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Maps activity types (login, logout, create, update, delete...) to
  // Tailwind CSS classes so each activity type gets a distinct color badge.
  const getActivityTypeColor = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'create':
      case 'purchase':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'update':
      case 'edit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'delete':
      case 'cancel':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Called when the user requests sorting by a specific field (e.g., date).
  // If the field is already the active sort field we toggle the order,
  // otherwise we set the new field with a default order (desc).
  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    if (sortBy === field) {
      // Toggle sort order if same field
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      onSortChange(field, 'desc');
    }
  };

  // Returns the appropriate sort icon depending on active sort state.
  // - If sorting is not enabled or this is not the active field show a
  //   neutral `ArrowUpDown` icon.
  // - If this is the active field, show `ArrowUp` or `ArrowDown`.
  const getSortIcon = (field: string) => {
    if (!onSortChange || sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };
  // Filter configuration
  // Build the configuration used by the `FilterBar` component. Each entry
  // describes a filter control: its key, label, current value, and the UI
  // component to render (or a set of options for simple selects).
  // When required filter callbacks are not provided this becomes an empty list.
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
    {
      key: 'component',
      label: 'Component',
      value: filters.component,
      icon: Filter,
      options: userType == 'admin' ? [
        { value: 'All', label: 'All Components' },
        { value: 'auth', label: 'Authentication' },
        { value: 'event', label: 'Event' },
        { value: 'users', label: 'Users' },
        { value: 'organisers', label: 'Organisers' },
        { value: 'admin', label: 'Admin' },
        { value: 'transactions', label: 'Transactions' }
      ] : [
        { value: 'All', label: 'All Components' },
        { value: 'auth', label: 'Authentication' },
        { value: 'event', label: 'Event' },
        { value: 'feedback', label: 'Feedback' },
        { value: 'streampass', label: 'Stream Pass' },
        { value: 'withdrawal', label: 'Withdrawal' }

      ]
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filters: renders when `showFilters` is true and filter callbacks are provided. */}
      {showFilters && filters && onFilterChange && onClearFilters && (
        <FilterBar
          filters={filterConfigs}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          searchValue={filters.searchTerm}
          onSearchChange={(value) => onFilterChange('searchTerm', value)}
          searchPlaceholder="Search activities by description, type..."
        />
      )}

      {/* Table Container: shows spinner, empty state, or the activity table. */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[300px]">
        {loading ? (
          // Loading state: centered spinner while activities are fetched.
          <LoadingSpinner />
        ) : activities.length === 0 ? (
          // Empty state: icon, heading and description when no activities exist.
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 dark:text-dark-400">{emptyDescription}</p>
          </div>
        ) : (
          <>
            {/* Table: horizontally scrollable with fixed column widths. */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full table-fixed min-w-[800px]">
                <colgroup>
                  <col className="w-[300px]" />
                  <col className="w-[120px]" />
                  <col className="w-[140px]" />
                  <col className="w-[120px]" />
                  <col className="w-[160px]" />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Activity Type
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      {/* Sortable header: clicking toggles date sort if `onSortChange` provided. */}
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-dark-200 transition-colors duration-200"
                        disabled={!onSortChange}
                      >
                        <span>Date & Time</span>
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {/* Render each activity row. Each cell contains formatted data and
                      uses helper functions above to decide badge styling. */}
                  {activities.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          {activity.eventData}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getComponentColor(activity.component)}`}>
                          {activity.component}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getActivityTypeColor(activity.activityType)}`}>
                          {activity.activityType}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          {activity.userName}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-100">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-400">
                          {new Date(activity.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls - delegates page changes to parent callbacks. */}
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
    </div>
  );
};