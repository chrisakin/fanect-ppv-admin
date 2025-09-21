import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, User, Activity, Mail, Calendar } from 'lucide-react';
import { adminService, ApiAdmin } from '../../services/adminService';
import { useAdminStore } from '../../store/adminStore';
import { useActivityStore } from '../../store/activityStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ActivityTable } from '../../components/activities/ActivityTable';

const SingleAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<ApiAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('overview');
  
  // Store actions
  const { actionLoading, lockAdmin, unlockAdmin } = useAdminStore();
  
  // Activity store
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    currentPage: activitiesCurrentPage,
    totalPages: activitiesTotalPages,
    totalDocs: activitiesTotalDocs,
    limit: activitiesLimit,
    filters: activityFilters,
    sortBy: activitySortBy,
    sortOrder: activitySortOrder,
    setFilters: setActivityFilters,
    setCurrentPage: setActivityCurrentPage,
    setSorting: setActivitySorting,
    fetchAdminActivities,
    clearError: clearActivityError,
    resetStore: resetActivityStore
  } = useActivityStore();
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | null;
    adminId: string | null;
    adminName: string | null;
  }>({
    isOpen: false,
    type: null,
    adminId: null,
    adminName: null
  });
  
  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch single admin
  useEffect(() => {
    const fetchAdmin = async () => {
      if (!id) {
        setError('Admin ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getSingleAdmin(id);
        setAdmin(response.admin);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch admin details');
        console.error('Error fetching admin details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
    
    // Reset activity store when component mounts or admin changes
    resetActivityStore();
  }, [id]);

  // Fetch activities when activities tab is active
  useEffect(() => {
    if (activeTab === 'activities' && id) {
      fetchAdminActivities(id, activitiesCurrentPage, activityFilters.searchTerm);
    }
  }, [activeTab, id, activitiesCurrentPage, activityFilters.component, activityFilters.startDate, activityFilters.endDate, activitySortBy, activitySortOrder]);

  // Handle activity search with debounce
  useEffect(() => {
    if (activeTab === 'activities' && id) {
      const timeoutId = setTimeout(() => {
        if (activitiesCurrentPage === 1) {
          fetchAdminActivities(id, 1, activityFilters.searchTerm);
        } else {
          setActivityCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [activityFilters.searchTerm]);

  // Open confirmation modal
  const openConfirmationModal = (type: 'lock' | 'unlock', adminId: string, adminName: string) => {
    setModalState({
      isOpen: true,
      type,
      adminId,
      adminName
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      adminId: null,
      adminName: null
    });
  };

  // Handle admin lock/unlock with confirmation
  const handleAdminAction = async () => {
    if (!modalState.adminId || !modalState.type) return;

    try {
      let result;
      
      if (modalState.type === 'lock') {
        result = await lockAdmin(modalState.adminId);
      } else {
        result = await unlockAdmin(modalState.adminId);
      }
      
      if (result.success) {
        // Refresh admin data
        if (id) {
          const updatedAdmin = await adminService.getSingleAdmin(id);
          setAdmin(updatedAdmin.admin);
        }
        
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `Admin ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalState.type} admin`);
      console.error(`Error ${modalState.type}ing admin:`, err);
      closeConfirmationModal();
    }
  };

  // Activity pagination handlers
  const handleActivityPreviousPage = () => {
    if (activitiesCurrentPage > 1) {
      setActivityCurrentPage(activitiesCurrentPage - 1);
    }
  };

  const handleActivityNextPage = () => {
    if (activitiesCurrentPage < activitiesTotalPages) {
      setActivityCurrentPage(activitiesCurrentPage + 1);
    }
  };

  // Handle activity filter changes
  const handleActivityFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      // Handle date range separately
      const dateRange = JSON.parse(value);
      setActivityFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setActivityFilters({ [key]: value });
    }
    if (activitiesCurrentPage !== 1) {
      setActivityCurrentPage(1);
    }
  };

  // Clear activity filters
  const clearActivityFilters = () => {
    setActivityFilters({
      component: 'All',
      searchTerm: '',
      startDate: '',
      endDate: ''
    });
    if (activitiesCurrentPage !== 1) {
      setActivityCurrentPage(1);
    }
  };

  // Handle activity sorting
  const handleActivitySortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setActivitySorting(sortBy, sortOrder);
    if (activitiesCurrentPage !== 1) {
      setActivityCurrentPage(1);
    }
  };

  // Get modal configuration based on action type
  const getModalConfig = () => {
    const { type, adminName } = modalState;
    
    if (type === 'lock') {
      return {
        title: 'Lock Admin Account',
        message: `Are you sure you want to lock ${adminName}'s account? They will not be able to access their account until it's unlocked.`,
        confirmText: 'Lock Account',
        confirmColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'Unlock Admin Account',
        message: `Are you sure you want to unlock ${adminName}'s account? They will be able to access their account again.`,
        confirmText: 'Unlock Account',
        confirmColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !admin) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admins')}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Admins</span>
          </button>
        </div>
        <ErrorAlert
          isOpen={true}
          message={error || 'Admin not found'}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admins')}
          className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Admins</span>
        </button>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {admin.firstName[0]}{admin.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {admin.firstName} {admin.lastName}
                </h1>
                <p className="text-gray-600 dark:text-dark-300">{admin.email}</p>
                {admin.role && (
                  <p className="text-gray-600 dark:text-dark-300">{admin.role}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {admin.status}
                  </span>
                  {admin.locked && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                      Locked
                    </span>
                  )}
                  {admin.isVerified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openConfirmationModal(
                  admin.locked ? 'unlock' : 'lock',
                  admin._id,
                  `${admin.firstName} ${admin.lastName}`
                )}
                disabled={actionLoading === admin._id}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  admin.locked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionLoading === admin._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  admin.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                )}
                <span>{actionLoading === admin._id ? 'Processing...' : (admin.locked ? 'Unlock' : 'Lock')} Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex space-x-8 px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'activities'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Admin Activities</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Email</p>
                        <p className="text-gray-900 dark:text-dark-100">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Member Since</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(admin.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Last Login</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(admin.lastLogin).toLocaleString()}</p>
                      </div>
                    </div>
                    {admin.role && (
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-dark-300">Role</p>
                          <p className="text-gray-900 dark:text-dark-100">{admin.role}</p>
                        </div>
                      </div>
                    )}
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
                        admin.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {admin.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Email Verification</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Email verification status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {admin.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Lock</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Account lock status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.locked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {admin.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Error Message */}
              <ErrorAlert
                isOpen={!!activitiesError}
                message={activitiesError || ''}
                onClose={clearActivityError}
              />

              {/* Activities Table with Filters */}
              <ActivityTable
                activities={activities}
                loading={activitiesLoading}
                currentPage={activitiesCurrentPage}
                totalPages={activitiesTotalPages}
                totalDocs={activitiesTotalDocs}
                limit={activitiesLimit}
                onPreviousPage={handleActivityPreviousPage}
                onNextPage={handleActivityNextPage}
                emptyMessage="No Activities Found"
                emptyDescription="This admin hasn't performed any activities yet."
                filters={activityFilters}
                onFilterChange={handleActivityFilterChange}
                onClearFilters={clearActivityFilters}
                showFilters={true}
                userType="admin"
                sortBy={activitySortBy}
                sortOrder={activitySortOrder}
                onSortChange={handleActivitySortChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleAdminAction}
        isLoading={actionLoading === modalState.adminId}
        {...getModalConfig()}
      />

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default SingleAdminPage;