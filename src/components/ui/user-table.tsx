import React from 'react';
import { Eye, Lock, Unlock, Filter } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';
import { Pagination } from './pagination';
import { FilterBar } from './filter-bar';
import { CustomDateRangePicker } from './custom-date-range-picker';
import { ActionDropdown } from './action-dropdown';

export interface BaseUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isVerified: boolean;
  lastLogin: string;
  locked: boolean;
  status: string;
  username?: string;
  role?: string;
  eventsJoinedCount?: number;
  eventCreated?: number;
}

interface UserFilters {
  status: string;
  locked: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}

interface UserTableProps {
  users: BaseUser[];
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  filters: UserFilters;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onViewUser: (userId: string) => void;
  onLockUser: (userId: string, userName: string) => void;
  onUnlockUser: (userId: string, userName: string) => void;
  clearError: () => void;
  // Configuration
  userType: 'user' | 'admin' | 'organiser';
  statusOptions: Array<{ value: string; label: string }>;
  searchPlaceholder: string;
  title: string;
  showUsername?: boolean;
  showEventsJoined?: boolean;
  showEventsCreated?: boolean;
  showRole?: boolean;
  // Optional create button
  showCreateButton?: boolean;
  onCreateUser?: () => void;
  createButtonText?: string;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  error,
  actionLoading,
  currentPage,
  totalPages,
  totalDocs,
  limit,
  filters,
  onFilterChange,
  onClearFilters,
  onPreviousPage,
  onNextPage,
  onViewUser,
  onLockUser,
  onUnlockUser,
  clearError,
  userType,
  statusOptions,
  searchPlaceholder,
  title,
  showUsername = false,
  showEventsJoined = false,
  showEventsCreated = false,
  showRole = false,
  showCreateButton = false,
  onCreateUser,
  createButtonText = "Create User"
}) => {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  // Get user action items
  const getUserActionItems = (user: BaseUser) => [
    {
      icon: Eye,
      label: 'View Details',
      onClick: () => {
        onViewUser(user._id);
        setOpenDropdown(null);
      }
    },
    {
      icon: user.locked ? Unlock : Lock,
      label: user.locked ? 'Unlock Account' : 'Lock Account',
      onClick: () => {
        if (user.locked) {
          onUnlockUser(user._id, `${user.firstName} ${user.lastName}`);
        } else {
          onLockUser(user._id, `${user.firstName} ${user.lastName}`);
        }
      },
      disabled: actionLoading === user._id,
      className: user.locked ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
    }
  ];

  // Get avatar gradient based on user type
  const getAvatarGradient = () => {
    switch (userType) {
      case 'admin':
        return 'from-purple-600 to-blue-600';
      case 'organiser':
        return 'from-green-600 to-blue-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  // Filter configuration
  const filterConfigs = [
    {
      key: 'dateRange',
      label: 'Join Date Range',
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
          placeholder="Select join date range"
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
      key: 'status',
      label: 'Status',
      value: filters.status,
      icon: Filter,
      options: statusOptions
    },
    {
      key: 'locked',
      label: 'Locked',
      value: filters.locked,
      icon: Filter,
      options: [
        { value: 'All', label: 'All Locked' },
        { value: 'Locked', label: 'Locked' },
        { value: 'Not Locked', label: 'Not Locked' }
      ]
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">{title}</h1>
        {showCreateButton && onCreateUser && (
          <button 
            onClick={onCreateUser}
            className="bg-primary-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <span>+</span>
            <span>{createButtonText}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-5 h-5 text-red-600 dark:text-red-400 mr-3">⚠</span>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        searchValue={filters.searchTerm}
        onSearchChange={(value) => onFilterChange('searchTerm', value)}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1000px]">
                <colgroup>
                  <col className="w-[250px]" />
                  {showUsername && <col className="w-[120px]" />}
                  <col className="w-[180px]" />
                  <col className="w-[100px]" />
                  <col className="w-[120px]" />
                  {showEventsJoined && <col className="w-[100px]" />}
                  {showEventsCreated && <col className="w-[100px]" />}
                  <col className="w-[120px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      {userType === 'admin' ? 'Admin' : userType === 'organiser' ? 'Organiser' : 'User'}
                    </th>
                    {showUsername && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                        Username
                      </th>
                    )}
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    {showEventsJoined && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                        Events Joined
                      </th>
                    )}
                    {showEventsCreated && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                        Events Created
                      </th>
                    )}
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Locked Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarGradient()} rounded-full flex items-center justify-center mr-3`}>
                            <span className="text-white text-sm font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {user.firstName} {user.lastName}
                            </div>
                            {showRole && user.role && (
                              <div className="text-sm text-gray-500 dark:text-dark-400">
                                {user.role}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      {showUsername && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                          {user.username}
                        </td>
                      )}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                        {user.email}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {user.status}
                          </span>
                          {user.locked && (
                            <Lock className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      {showEventsJoined && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                          {user.eventsJoinedCount || 0}
                        </td>
                      )}
                      {showEventsCreated && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                          {user.eventCreated || 0}
                        </td>
                      )}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.locked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {user.locked ? 'Locked' : 'Not Locked'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionDropdown
                          items={getUserActionItems(user)}
                          isOpen={openDropdown === user._id}
                          onToggle={() => setOpenDropdown(openDropdown === user._id ? null : user._id)}
                          isLoading={actionLoading === user._id}
                          onClickOutside={() => setOpenDropdown(null)}
                        />
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