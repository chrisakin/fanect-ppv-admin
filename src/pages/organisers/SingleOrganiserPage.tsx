import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, User, Activity, CreditCard, Calendar, Mail, BarChart3 } from 'lucide-react';
import { organiserService, ApiOrganiser } from '../../services/organiserService';
import { useOrganiserStore } from '../../store/organiserStore';
import { useActivityStore } from '../../store/activityStore';
import { useOrganiserEventStore } from '../../store/organiserEventStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ActivityTable } from '../../components/activities/ActivityTable';
import { EventsTable } from '../../components/events/EventsTable';
import { OrganiserAnalyticsTab } from '../../components/organisers/OrganiserAnalyticsTab';

const SingleOrganiserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organiser, setOrganiser] = useState<ApiOrganiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'revenue' | 'activities'>('overview');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Store actions
  const { actionLoading, lockOrganiser, unlockOrganiser } = useOrganiserStore();
  
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
    fetchUserActivities,
    clearError: clearActivityError,
    resetStore: resetActivityStore
  } = useActivityStore();
  
  // Organiser Event store
  const {
    events: organiserEvents,
    loading: organiserEventsLoading,
    error: organiserEventsError,
    currentPage: organiserEventsCurrentPage,
    totalPages: organiserEventsTotalPages,
    totalDocs: organiserEventsTotalDocs,
    limit: organiserEventsLimit,
    filters: organiserEventFilters,
    setFilters: setOrganiserEventFilters,
    setCurrentPage: setOrganiserEventCurrentPage,
    fetchOrganiserEvents,
    clearError: clearOrganiserEventError,
    resetStore: resetOrganiserEventStore
  } = useOrganiserEventStore();
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | null;
    organiserId: string | null;
    organiserName: string | null;
  }>({
    isOpen: false,
    type: null,
    organiserId: null,
    organiserName: null
  });
  
  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch single organiser
  useEffect(() => {
    const fetchOrganiser = async () => {
      if (!id) {
        setError('Organiser ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await organiserService.getSingleOrganiser(id);
        setOrganiser(response.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch organiser details');
        console.error('Error fetching organiser details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganiser();
    
    // Reset stores when component mounts or organiser changes
    resetActivityStore();
    resetOrganiserEventStore();
  }, [id]);

  // Fetch activities when activities tab is active
  useEffect(() => {
    if (activeTab === 'activities' && id) {
      fetchUserActivities(id, activitiesCurrentPage, activityFilters.searchTerm);
    }
  }, [activeTab, id, activitiesCurrentPage, activityFilters.component, activityFilters.startDate, activityFilters.endDate, activitySortBy, activitySortOrder]);

  // Handle activity search with debounce
  useEffect(() => {
    if (activeTab === 'activities' && id) {
      const timeoutId = setTimeout(() => {
        if (activitiesCurrentPage === 1) {
          fetchUserActivities(id, 1, activityFilters.searchTerm);
        } else {
          setActivityCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [activityFilters.searchTerm]);

  // Fetch organiser events when events tab is active
  useEffect(() => {
    if (activeTab === 'events' && id) {
      fetchOrganiserEvents(id, organiserEventsCurrentPage, organiserEventFilters.searchTerm);
    }
  }, [activeTab, id, organiserEventsCurrentPage, organiserEventFilters.status, organiserEventFilters.adminStatus, organiserEventFilters.startDate, organiserEventFilters.endDate]);

  // Handle organiser event search with debounce
  useEffect(() => {
    if (activeTab === 'events' && id) {
      const timeoutId = setTimeout(() => {
        if (organiserEventsCurrentPage === 1) {
          fetchOrganiserEvents(id, 1, organiserEventFilters.searchTerm);
        } else {
          setOrganiserEventCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [organiserEventFilters.searchTerm]);

  // Open confirmation modal
  const openConfirmationModal = (type: 'lock' | 'unlock', organiserId: string, organiserName: string) => {
    setModalState({
      isOpen: true,
      type,
      organiserId,
      organiserName
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      organiserId: null,
      organiserName: null
    });
  };

  // Handle organiser lock/unlock with confirmation
  const handleOrganiserAction = async () => {
    if (!modalState.organiserId || !modalState.type) return;

    try {
      let result;
      
      if (modalState.type === 'lock') {
        result = await lockOrganiser(modalState.organiserId);
      } else {
        result = await unlockOrganiser(modalState.organiserId);
      }
      
      if (result.success) {
        // Refresh organiser data
        if (id) {
          const updatedOrganiser = await organiserService.getSingleOrganiser(id);
          setOrganiser(updatedOrganiser.user);
        }
        
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `Organiser ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalState.type} organiser`);
      console.error(`Error ${modalState.type}ing organiser:`, err);
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

  // Organiser Event pagination handlers
  const handleOrganiserEventPreviousPage = () => {
    if (organiserEventsCurrentPage > 1) {
      setOrganiserEventCurrentPage(organiserEventsCurrentPage - 1);
    }
  };

  const handleOrganiserEventNextPage = () => {
    if (organiserEventsCurrentPage < organiserEventsTotalPages) {
      setOrganiserEventCurrentPage(organiserEventsCurrentPage + 1);
    }
  };

  // Handle organiser event filter changes
  const handleOrganiserEventFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      // Handle date range separately
      const dateRange = JSON.parse(value);
      setOrganiserEventFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setOrganiserEventFilters({ [key]: value });
    }
    if (organiserEventsCurrentPage !== 1) {
      setOrganiserEventCurrentPage(1);
    }
  };

  // Clear organiser event filters
  const clearOrganiserEventFilters = () => {
    setOrganiserEventFilters({
      status: 'All',
      adminStatus: 'All',
      searchTerm: '',
      startDate: '',
      endDate: ''
    });
    if (organiserEventsCurrentPage !== 1) {
      setOrganiserEventCurrentPage(1);
    }
  };

  // Get modal configuration based on action type
  const getModalConfig = () => {
    const { type, organiserName } = modalState;
    
    if (type === 'lock') {
      return {
        title: 'Lock Organiser Account',
        message: `Are you sure you want to lock ${organiserName}'s account? They will not be able to access their account until it's unlocked.`,
        confirmText: 'Lock Account',
        confirmColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'Unlock Organiser Account',
        message: `Are you sure you want to unlock ${organiserName}'s account? They will be able to access their account again.`,
        confirmText: 'Unlock Account',
        confirmColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !organiser) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/organisers')}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Organisers</span>
          </button>
        </div>
        <ErrorAlert
          isOpen={true}
          message={error || 'Organiser not found'}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/organisers')}
          className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Organisers</span>
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {organiser.firstName[0]}{organiser.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {organiser.firstName} {organiser.lastName}
                </h1>
                <p className="text-gray-600 dark:text-dark-300">@{organiser.username}</p>
                <p className="text-gray-600 dark:text-dark-300">{organiser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    organiser.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {organiser.status}
                  </span>
                  {organiser.locked && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                      Locked
                    </span>
                  )}
                  {organiser.isVerified && (
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
                  organiser.locked ? 'unlock' : 'lock',
                  organiser._id,
                  `${organiser.firstName} ${organiser.lastName}`
                )}
                disabled={actionLoading === organiser._id}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  organiser.locked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionLoading === organiser._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  organiser.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                )}
                <span>{actionLoading === organiser._id ? 'Processing...' : (organiser.locked ? 'Unlock' : 'Lock')} Account</span>
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
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Events Created</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'revenue'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Organiser Analytics</span>
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
                <span>Organiser Activities</span>
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
                        <p className="text-gray-900 dark:text-dark-100">{organiser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Member Since</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(organiser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Last Login</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(organiser.lastLogin).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Activity Summary</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-dark-300">Events Created</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{organiser.eventCreated}</p>
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
                        organiser.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {organiser.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Email Verification</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Email verification status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        organiser.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {organiser.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Lock</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Account lock status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        organiser.locked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {organiser.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Error Message */}
              <ErrorAlert
                isOpen={!!organiserEventsError}
                message={organiserEventsError || ''}
                onClose={clearOrganiserEventError}
              />

              {/* Organiser Events Table with Filters */}
              <EventsTable
                events={organiserEvents}
                loading={organiserEventsLoading}
                currentPage={organiserEventsCurrentPage}
                totalPages={organiserEventsTotalPages}
                totalDocs={organiserEventsTotalDocs}
                limit={organiserEventsLimit}
                onPreviousPage={handleOrganiserEventPreviousPage}
                onNextPage={handleOrganiserEventNextPage}
                emptyMessage="No Events Found"
                emptyDescription="This organiser hasn't created any events yet."
                filters={organiserEventFilters}
                onFilterChange={handleOrganiserEventFilterChange}
                onClearFilters={clearOrganiserEventFilters}
                openDropdown={openDropdown}
                onToggleDropdown={setOpenDropdown}
                showFilters={true}
                showActions={true}
                showFullActions={false}
                onViewEvent={(eventId) => navigate(`/events/${eventId}`)}
                onEditEvent={(eventId) => navigate(`/events/edit/${eventId}`)}
              />
            </div>
          )}

          {activeTab === 'revenue' && (
             <div className="space-y-6">
              {/* Error Message */}
              

              {/* Activities Table with Filters */}
             <OrganiserAnalyticsTab organiserId={organiser._id} />
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
                emptyDescription="This organiser hasn't performed any activities yet."
                filters={activityFilters}
                onFilterChange={handleActivityFilterChange}
                onClearFilters={clearActivityFilters}
                showFilters={true}
                userType="organiser"
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
        onConfirm={handleOrganiserAction}
        isLoading={actionLoading === modalState.organiserId}
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

export default SingleOrganiserPage;