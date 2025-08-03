import React from 'react';
import { Activity, Filter } from 'lucide-react';
import { UserActivity, ActivityFilters } from '../../types/activity';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Pagination } from '../ui/pagination';
import { FilterBar } from '../ui/filter-bar';
import { CustomDateRangePicker } from '../ui/custom-date-range-picker';

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
  userType
}) => {
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
      {/* Filters */}
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

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[300px]">
        {loading ? (
          <LoadingSpinner />
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 dark:text-dark-400">{emptyDescription}</p>
          </div>
        ) : (
          <>
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
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
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
    </div>
  );
};