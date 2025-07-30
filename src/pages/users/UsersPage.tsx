import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Eye, Lock, Unlock, Mail, Calendar, DollarSign, Activity, MoreVertical, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService, ApiUser, UserStatus } from '../../services/userService';

// Success Alert Component
interface SuccessAlertProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ isOpen, message, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <p className="text-green-800 dark:text-green-200">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'All' as UserStatus | 'All',
    searchTerm: ''
  });

  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch users with search and filters
  const fetchUsers = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        status: filters.status,
        searchTerm: searchTerm.trim()
      };
      
      const response = await userService.getAllUsers(page, limit, apiFilters);
      setUsers(response.docs);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalDocs(response.totalDocs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount, page change, or filter change
  useEffect(() => {
    fetchUsers(currentPage, filters.searchTerm);
  }, [currentPage, filters.status]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers(1, filters.searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  const toggleUserLock = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await userService.toggleUserLock(userId);
      
      // Refresh users list
      await fetchUsers(currentPage, filters.searchTerm);
      
      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'User status updated successfully!'
      });
      
      setOpenDropdown(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
      console.error('Error toggling user lock:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await userService.resetUserPassword(userId);
      
      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Password reset email sent successfully!'
      });
      
      setOpenDropdown(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset user password');
      console.error('Error resetting user password:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Pagination handlers
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

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'All',
      searchTerm: ''
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Action dropdown component
  const ActionDropdown: React.FC<{ user: ApiUser }> = ({ user }) => {
    const isOpen = openDropdown === user._id;
    const isLoading = actionLoading === user._id;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : user._id)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
          disabled={isLoading}
        >
          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-dark-400" />
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-[60]"
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user);
                  setOpenDropdown(null);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-3" />
                View Details
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserLock(user._id);
                }}
                disabled={isLoading}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50 ${
                  user.locked ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}
              >
                {user.locked ? <Unlock className="w-4 h-4 mr-3" /> : <Lock className="w-4 h-4 mr-3" />}
                {user.locked ? 'Unlock Account' : 'Lock Account'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetUserPassword(user._id);
                }}
                disabled={isLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
              >
                <Mail className="w-4 h-4 mr-3" />
                Reset Password
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedUser(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Users
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h1>
                  <p className="text-gray-600 dark:text-dark-300">@{selectedUser.username}</p>
                  <p className="text-gray-600 dark:text-dark-300">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {selectedUser.status}
                    </span>
                    {selectedUser.locked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                        Locked
                      </span>
                    )}
                    {selectedUser.isVerified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => toggleUserLock(selectedUser._id)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedUser.locked
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {selectedUser.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{selectedUser.locked ? 'Unlock' : 'Lock'} Account</span>
                </button>
                <button 
                  onClick={() => resetUserPassword(selectedUser._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Email</p>
                      <p className="text-gray-900 dark:text-dark-100">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Member Since</p>
                      <p className="text-gray-900 dark:text-dark-100">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Last Login</p>
                      <p className="text-gray-900 dark:text-dark-100">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Activity Summary</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-dark-300">Events Joined</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedUser.eventsJoinedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Status</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Current account status</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Email Verification</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Email verification status</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Lock</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">Account lock status</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.locked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {selectedUser.locked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">User Management</h1>
        <button className="bg-blue-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-blue-700">
          Export Users
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
            <input
              type="text"
              placeholder="Search users by name, username, or email..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-dark-400 flex-shrink-0" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
            >
              <option value="All">All Status</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.INACTIVE}>Inactive</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Events Joined
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Verification
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
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-dark-400">@{user.username}</div>
                            <div className="text-sm text-gray-500 dark:text-dark-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                        {user.eventsJoinedCount}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isVerified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionDropdown user={user} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-dark-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dark-600">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
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
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-700 dark:text-dark-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default UsersPage;