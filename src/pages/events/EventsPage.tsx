import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { eventService, ApiEvent } from '../../services/eventService';
import { EventsTable } from '../../components/events/EventsTable';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  
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
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  // Fetch events with search and filters
  const fetchEvents = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
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
  }, [currentPage, filters.status, filters.adminStatus, filters.startDate, filters.endDate]);

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
  // Handle view event
  const handleViewEvent = (eventId: string) => {
    setOpenDropdown(null);
    navigate(`/events/${eventId}`);
  };

  // Handle edit event
  const handleEditEvent = (eventId: string) => {
    setOpenDropdown(null);
    navigate(`/events/edit/${eventId}`);
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
      const dateRange = JSON.parse(value);
      setFilters(prev => ({ 
        ...prev, 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      }));
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

      {/* Events Table */}
      <EventsTable
        events={events}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalDocs={totalDocs}
        limit={limit}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        showActions={true}
        onViewEvent={handleViewEvent}
        onEditEvent={handleEditEvent}
        onApproveEvent={(eventId) => openConfirmationModal('approve', eventId)}
        onRejectEvent={(eventId) => openConfirmationModal('reject', eventId)}
        onUnpublishEvent={(eventId) => openConfirmationModal('unpublish', eventId)}
        onStreamAction={handleStreamAction}
        actionLoading={actionLoading}
        openDropdown={openDropdown}
        onToggleDropdown={setOpenDropdown}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        showFilters={true}
      />

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

