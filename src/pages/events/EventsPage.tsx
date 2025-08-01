import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Eye, Edit3, CheckCircle, Clock, AlertCircle, Plus, Activity } from 'lucide-react';
import { eventService, ApiEvent } from '../../services/eventService';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';
import { Pagination } from '../../components/ui/pagination';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ActionDropdown } from '../../components/ui/action-dropdown';
import { FilterBar } from '../../components/ui/filter-bar';
import { CustomDateRangePicker } from '../../components/ui/custom-date-range-picker';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'unpublish' | null;
    eventId: string | null;
  }>({
    isOpen: false,
    type: null,
    eventId: null
  });
  
  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [limit] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'All',
    adminStatus: 'All',
    dateRange: { startDate: null as string | null, endDate: null as string | null },
    searchTerm: ''
  });

  // Fetch events with search and filters
  const fetchEvents = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        startDate: filters.dateRange.startDate || '',
        endDate: filters.dateRange.endDate || '',
        status: filters.status,
        adminStatus: filters.adminStatus,
        searchTerm: searchTerm.trim()
      };
      
      const response = await eventService.getAllEvents(page, limit, apiFilters);
      setEvents(response.docs);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalDocs(response.totalDocs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load events on component mount, page change, or filter change
  useEffect(() => {
    fetchEvents(currentPage, filters.searchTerm);
  }, [currentPage, filters.status, filters.adminStatus, filters.dateRange.startDate, filters.dateRange.endDate]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchEvents(1, filters.searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  // Open confirmation modal
  const openConfirmationModal = (type: 'approve' | 'reject' | 'unpublish', eventId: string) => {
    setModalState({
      isOpen: true,
      type,
      eventId
    });
    setOpenDropdown(null);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      eventId: null
    });
  };

  // Handle event actions with confirmation
  const handleEventAction = async (reason?: string) => {
    if (!modalState.eventId || !modalState.type) return;

    try {
      setActionLoading(modalState.eventId);
      let response;
      
      switch (modalState.type) {
        case 'approve':
          response = await eventService.approveEvent(modalState.eventId);
          break;
        case 'reject':
          response = await eventService.rejectEvent(modalState.eventId, reason || '');
          break;
        case 'unpublish':
          response = await eventService.unpublishEvent(modalState.eventId);
          break;
      }
      
      // Update the selected event if it's currently being viewed
      if (selectedEvent && selectedEvent._id === modalState.eventId) {
        const updatedEvent = await eventService.getSingleEvent(modalState.eventId);
        setSelectedEvent(updatedEvent.results);
      }
      
      // Refresh events list
      await fetchEvents(currentPage, filters.searchTerm);
      
      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || `Event ${modalState.type}d successfully!`
      });
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalState.type} event`);
      console.error(`Error ${modalState.type}ing event:`, err);
      closeConfirmationModal();
    } finally {
      setActionLoading(null);
    }
  };

  // Handle stream start/end actions
  const handleStreamAction = async (eventId: string, session: 'stream-start' | 'stream-end') => {
    try {
      setActionLoading(eventId);
      const response = await eventService.updateEventSession(eventId, session);
      
      // Refresh events list
      await fetchEvents(currentPage, filters.searchTerm);
      
      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || `Stream ${session === 'stream-start' ? 'started' : 'ended'} successfully!`
      });
      
      setOpenDropdown(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${session === 'stream-start' ? 'start' : 'end'} stream`);
      console.error(`Error ${session === 'stream-start' ? 'starting' : 'ending'} stream:`, err);
    } finally {
      setActionLoading(null);
    }
  };
  // View single event
  const handleViewEvent = async (eventId: string) => {
    setOpenDropdown(null);
    navigate(`/events/${eventId}`);
  };

  const getStatusIcon = (adminStatus: string) => {
    switch (adminStatus) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (adminStatus: string) => {
    switch (adminStatus) {
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  // Get modal configuration based on action type
  const getModalConfig = () => {
    switch (modalState.type) {
      case 'approve':
        return {
          title: 'Approve Event',
          message: 'Are you sure you want to approve this event? This will make it visible to users.',
          confirmText: 'Approve Event',
          confirmColor: 'bg-green-600 hover:bg-green-700',
          showReasonInput: false
        };
      case 'reject':
        return {
          title: 'Reject Event',
          message: 'Are you sure you want to reject this event? Please provide a reason for rejection.',
          confirmText: 'Reject Event',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          showReasonInput: true
        };
      case 'unpublish':
        return {
          title: 'Unpublish Event',
          message: 'Are you sure you want to unpublish this event? This will hide it from users.',
          confirmText: 'Unpublish Event',
          confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
          showReasonInput: false
        };
      default:
        return {
          title: '',
          message: '',
          confirmText: '',
          confirmColor: '',
          showReasonInput: false
        };
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
    if (key === 'dateRange') {
      setFilters(prev => ({ ...prev, dateRange: JSON.parse(value) }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'All',
      adminStatus: 'All',
      dateRange: { startDate: null, endDate: null },
      searchTerm: ''
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Action dropdown component
  const getEventActionItems = (event: ApiEvent) => {
    const items = [
      {
        icon: Eye,
        label: 'View Details',
        onClick: () => handleViewEvent(event._id)
      },
      {
        icon: Edit3,
        label: 'Edit Event',
        onClick: () => {
          navigate(`/events/edit/${event._id}`);
          setOpenDropdown(null);
        }
      }
    ];

    if (event.adminStatus === 'Pending') {
      items.push(
        {
          icon: CheckCircle,
          label: 'Approve Event',
          onClick: () => openConfirmationModal('approve', event._id),
          disabled: actionLoading === event._id,
          className: 'text-green-700 dark:text-green-400'
        },
        {
          icon: AlertCircle,
          label: 'Reject Event',
          onClick: () => openConfirmationModal('reject', event._id),
          disabled: actionLoading === event._id,
          className: 'text-red-700 dark:text-red-400'
        }
      );
    }

    if (event.adminStatus === 'Approved') {
      if (event.status !== 'Past') {
        items.push({
          icon: Activity,
          label: event.status === 'Live' ? 'Stop Streaming' : 'Start Streaming',
          onClick: () => handleStreamAction(event._id, event.status === 'Live' ? 'stream-end' : 'stream-start'),
          disabled: actionLoading === event._id,
          className: 'text-blue-700 dark:text-blue-400'
        });
      }
      items.push({
        icon: Clock,
        label: 'Unpublish Event',
        onClick: () => openConfirmationModal('unpublish', event._id),
        disabled: actionLoading === event._id,
        className: 'text-yellow-700 dark:text-yellow-400'
      });
    }

    if (event.adminStatus === 'Rejected') {
      items.push({
        icon: CheckCircle,
        label: 'Approve Event',
        onClick: () => openConfirmationModal('approve', event._id),
        disabled: actionLoading === event._id,
        className: 'text-green-700 dark:text-green-400'
      });
    }

    return items;
  };

  // Filter configuration
  const filterConfigs = [
    {
      key: 'status',
      label: 'Event Status',
      value: filters.status,
      icon: Filter,
      options: [
        { value: 'All', label: 'All Status' },
        { value: 'Past', label: 'Past' },
        { value: 'Live', label: 'Live' },
        { value: 'Upcoming', label: 'Upcoming' }
      ]
    },
    {
      key: 'adminStatus',
      label: 'Admin Status',
      value: filters.adminStatus,
      options: [
        { value: 'All', label: 'All Admin Status' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      value: JSON.stringify(filters.dateRange),
      type: 'custom' as const,
      icon: Calendar,
      component: (
        <CustomDateRangePicker
          value={filters.dateRange}
          onChange={(dateRange) => 
            handleFilterChange('dateRange', JSON.stringify(dateRange))
          }
          placeholder="Select date range"
          className="h-10"
          showSearchButton={true}
          onSearch={(dateRange) => 
            handleFilterChange('dateRange', JSON.stringify(dateRange))
          }
        />
      )
    }
  ];

  // Single Event Detail View

  // Main Events List View
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Event Management</h1>
        <button 
          onClick={() => navigate('/events/create')}
          className="bg-primary-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        searchValue={filters.searchTerm}
        onSearchChange={(value) => handleFilterChange('searchTerm', value)}
        searchPlaceholder="Search events..."
      />

      {/* Events Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Admin Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.bannerUrl && (
                            <img
                              src={event.bannerUrl}
                              alt={event.name}
                              className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover mr-3 flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{event.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'Live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(event.adminStatus)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.adminStatus)}`}>
                            {event.adminStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-100">
                        {event.prices && event.prices.length > 0 ? formatCurrency(event.prices[0].amount, event.prices[0].currency) : 'Free'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <ActionDropdown
                          items={getEventActionItems(event)}
                          isOpen={openDropdown === event._id}
                          onToggle={() => setOpenDropdown(openDropdown === event._id ? null : event._id)}
                          isLoading={actionLoading === event._id}
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
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleEventAction}
        isLoading={actionLoading === modalState.eventId}
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

export default EventsPage;