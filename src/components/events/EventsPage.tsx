import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Filter, Search, Eye, CheckCircle, Clock, AlertCircle, ArrowLeft, Plus, ChevronLeft, ChevronRight, MoreVertical, X } from 'lucide-react';
import { eventService, ApiEvent } from '../../services/eventService';

// Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
  showReasonInput?: boolean;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor,
  showReasonInput = false,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">{title}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-dark-300 mb-6">{message}</p>
          
          {showReasonInput && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this event..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 resize-none"
                rows={4}
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (showReasonInput && !reason.trim())}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${confirmColor}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const EventsPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
    startDate: '',
    endDate: '',
    searchTerm: ''
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

  // Fetch events with search and filters
  const fetchEvents = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
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
          response = await eventService.rejectEvent(modalState.eventId, reason);
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

  // View single event
  const handleViewEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setOpenDropdown(null);
      const response = await eventService.getSingleEvent(eventId);
      setSelectedEvent(response.results);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event details');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
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
    setFilters(prev => ({ ...prev, [key]: value }));
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'All',
      adminStatus: 'All',
      startDate: '',
      endDate: '',
      searchTerm: ''
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Action dropdown component
  const ActionDropdown: React.FC<{ event: ApiEvent }> = ({ event }) => {
    const isOpen = openDropdown === event._id;
    const isLoading = actionLoading === event._id;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : event._id)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
          disabled={isLoading}
        >
          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-dark-400" />
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-50"
          >
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewEvent(event._id);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-3" />
                View Details
              </button>
              
              {event.adminStatus === 'Pending' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirmationModal('approve', event._id);
                    }}
                    disabled={isLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-3" />
                    Approve Event
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirmationModal('reject', event._id);
                    }}
                    disabled={isLoading}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-3" />
                    Reject Event
                  </button>
                </>
              )}
              
              {event.adminStatus === 'Approved' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmationModal('unpublish', event._id);
                  }}
                  disabled={isLoading}
                  className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <Clock className="w-4 h-4 mr-3" />
                  Unpublish Event
                </button>
              )}

              {event.adminStatus === 'Rejected' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmationModal('approve', event._id);
                  }}
                  disabled={isLoading}
                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-3" />
                  Approve Event
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Single Event Detail View
  if (selectedEvent) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedEvent(null)}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Events</span>
          </button>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
          {/* Header with improved layout */}
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 break-words">
                      {selectedEvent.name}
                    </h1>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusIcon(selectedEvent.adminStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.adminStatus)}`}>
                        {selectedEvent.adminStatus}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons aligned with title */}
                  <div className="flex flex-wrap gap-2 lg:gap-3 flex-shrink-0">
                    {selectedEvent.adminStatus === 'Pending' && (
                      <>
                        <button
                          onClick={() => openConfirmationModal('approve', selectedEvent._id)}
                          disabled={actionLoading === selectedEvent._id}
                          className="px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                        >
                          {actionLoading === selectedEvent._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => openConfirmationModal('reject', selectedEvent._id)}
                          disabled={actionLoading === selectedEvent._id}
                          className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                        >
                          {actionLoading === selectedEvent._id ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {selectedEvent.adminStatus === 'Approved' && (
                      <button
                        onClick={() => openConfirmationModal('unpublish', selectedEvent._id)}
                        disabled={actionLoading === selectedEvent._id}
                        className="px-3 lg:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === selectedEvent._id ? 'Processing...' : 'Unpublish'}
                      </button>
                    )}
                    {selectedEvent.adminStatus === 'Rejected' && (
                      <button
                        onClick={() => openConfirmationModal('approve', selectedEvent._id)}
                        disabled={actionLoading === selectedEvent._id}
                        className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === selectedEvent._id ? 'Processing...' : 'Approve'}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Description below the title and buttons */}
                {selectedEvent.description && (
                  <p className="text-gray-600 dark:text-dark-300 mt-4 break-words">
                    {selectedEvent.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Admin Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.adminStatus)}`}>
                      {selectedEvent.adminStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-dark-300">Scheduled:</span>
                    <span className="text-gray-900 dark:text-dark-100 text-right text-sm">
                      {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Event Status:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">{selectedEvent.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Published:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">
                      {selectedEvent.published ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Broadcast Software:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">{selectedEvent.broadcastSoftware}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Can Watch Saved Stream:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">
                      {selectedEvent.canWatchSavedStream ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Broadcast Room:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">
                      {selectedEvent.haveBroadcastRoom ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Pricing</h3>
                <div className="space-y-2">
                  {selectedEvent.prices && selectedEvent.prices.length > 0 ? (
                    selectedEvent.prices.map((price, index) => (
                      <div key={price._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <span className="text-gray-600 dark:text-dark-300">Price {index + 1}:</span>
                        <span className="text-gray-900 dark:text-dark-100 font-semibold">
                          {formatCurrency(price.amount, price.currency)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <span className="text-gray-900 dark:text-dark-100 font-semibold">Free Event</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Creator Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Created By:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-mono text-xs">{selectedEvent.createdBy}</span>
                  </div>
                  {selectedEvent.publishedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-300">Published By:</span>
                      <span className="text-gray-900 dark:text-dark-100 font-mono text-xs">{selectedEvent.publishedBy}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Created:</span>
                    <span className="text-gray-900 dark:text-dark-100">
                      {new Date(selectedEvent.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Last Updated:</span>
                    <span className="text-gray-900 dark:text-dark-100">
                      {new Date(selectedEvent.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedEvent.scheduledTestDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-dark-300">Test Date:</span>
                      <span className="text-gray-900 dark:text-dark-100">
                        {new Date(selectedEvent.scheduledTestDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {selectedEvent.bannerUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Banner</h3>
                  <img
                    src={selectedEvent.bannerUrl}
                    alt={selectedEvent.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Streaming Details</h3>
                <div className="space-y-3 text-sm">
                  {selectedEvent.ivsChannelArn && (
                    <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Channel ARN:</span>
                      </div>
                      <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                        {selectedEvent.ivsChannelArn}
                      </span>
                    </div>
                  )}
                  
                  {selectedEvent.ivsChatRoomArn && (
                    <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Chat Room ARN:</span>
                      </div>
                      <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                        {selectedEvent.ivsChatRoomArn}
                      </span>
                    </div>
                  )}
                  
                  {selectedEvent.ivsPlaybackUrl && (
                    <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Playback URL:</span>
                      </div>
                      <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                        {selectedEvent.ivsPlaybackUrl}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
  }

  // Main Events List View
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Event Management</h1>
        <button className="bg-primary-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200">
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200"
            />
          </div>

          {/* Event Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-dark-400 flex-shrink-0" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
            >
              <option value="All">All Status</option>
              <option value="Past">Past</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          {/* Admin Status Filter */}
          <div>
            <select
              value={filters.adminStatus}
              onChange={(e) => handleFilterChange('adminStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
            >
              <option value="All">All Admin Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-dark-400 flex-shrink-0" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
              placeholder="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events Table */}
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
                        <ActionDropdown event={event} />
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