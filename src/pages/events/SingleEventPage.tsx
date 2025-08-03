import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Activity, Edit3, Play, Info, CreditCard, MessageCircle } from 'lucide-react';
import { eventService, ApiEvent } from '../../services/eventService';
import { useEventTransactionStore } from '../../store/eventTransactionStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import LiveStreamPlayer from '../../components/events/LiveStreamPlayer';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { FeedbackTable } from '../../components/feedback/FeedbackTable';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

const SingleEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'live' | 'transactions' | 'feedback'>('details');
  
  // Event Transaction store
  const {
    transactions: eventTransactions,
    loading: eventTransactionsLoading,
    error: eventTransactionsError,
    currentPage: eventTransactionsCurrentPage,
    totalPages: eventTransactionsTotalPages,
    totalDocs: eventTransactionsTotalDocs,
    limit: eventTransactionsLimit,
    filters: eventTransactionFilters,
    setFilters: setEventTransactionFilters,
    setCurrentPage: setEventTransactionCurrentPage,
    fetchEventTransactions,
    clearError: clearEventTransactionError,
    resetStore: resetEventTransactionStore
  } = useEventTransactionStore();
  
  // Event Feedback store
  const {
    feedbacks: eventFeedbacks,
    loading: eventFeedbacksLoading,
    error: eventFeedbacksError,
    currentPage: eventFeedbacksCurrentPage,
    totalPages: eventFeedbacksTotalPages,
    totalDocs: eventFeedbacksTotalDocs,
    limit: eventFeedbacksLimit,
    filters: eventFeedbackFilters,
    setFilters: setEventFeedbackFilters,
    setCurrentPage: setEventFeedbackCurrentPage,
    fetchEventFeedbacks,
    clearError: clearEventFeedbackError,
    resetStore: resetEventFeedbackStore
  } = useFeedbackStore();
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'unpublish' | 'stream-start' | 'stream-end' | null;
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

  // Fetch single event
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getSingleEvent(id);
        setEvent(response.results);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch event details');
        console.error('Error fetching event details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    
    // Reset event transaction store when component mounts or event changes
    resetEventTransactionStore();
    // Reset event feedback store when component mounts or event changes
    resetEventFeedbackStore();
  }, [id]);

  // Fetch event transactions when transactions tab is active
  useEffect(() => {
    if (activeTab === 'transactions' && id) {
      fetchEventTransactions(id, eventTransactionsCurrentPage, eventTransactionFilters.searchTerm);
    }
  }, [activeTab, id, eventTransactionsCurrentPage, eventTransactionFilters.status, eventTransactionFilters.giftStatus, eventTransactionFilters.paymentMethod, eventTransactionFilters.startDate, eventTransactionFilters.endDate, eventTransactionFilters.currency]);

  // Handle event transaction search with debounce
  useEffect(() => {
    if (activeTab === 'transactions' && id) {
      const timeoutId = setTimeout(() => {
        if (eventTransactionsCurrentPage === 1) {
          fetchEventTransactions(id, 1, eventTransactionFilters.searchTerm);
        } else {
          setEventTransactionCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [eventTransactionFilters.searchTerm]);

  // Fetch event feedbacks when feedback tab is active
  useEffect(() => {
    if (activeTab === 'feedback' && id) {
      fetchEventFeedbacks(id, eventFeedbacksCurrentPage, eventFeedbackFilters.searchTerm);
    }
  }, [activeTab, id, eventFeedbacksCurrentPage, eventFeedbackFilters.startDate, eventFeedbackFilters.endDate]);

  // Handle event feedback search with debounce
  useEffect(() => {
    if (activeTab === 'feedback' && id) {
      const timeoutId = setTimeout(() => {
        if (eventFeedbacksCurrentPage === 1) {
          fetchEventFeedbacks(id, 1, eventFeedbackFilters.searchTerm);
        } else {
          setEventFeedbackCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [eventFeedbackFilters.searchTerm]);

  // Open confirmation modal
  const openConfirmationModal = (type: 'approve' | 'reject' | 'unpublish' | 'stream-start' | 'stream-end', eventId: string) => {
    setModalState({
      isOpen: true,
      type,
      eventId
    });
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
        case 'stream-start':
        case 'stream-end':
          response = await eventService.updateEventSession(modalState.eventId, modalState.type);
          break;
      }
      
      // Refresh event data
      if (id) {
        const updatedEvent = await eventService.getSingleEvent(id);
        setEvent(updatedEvent.results);
      }
      
      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || `Event ${modalState.type.replace('-', ' ')}d successfully!`
      });
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalState.type.replace('-', ' ')} event`);
      console.error(`Error ${modalState.type.replace('-', ' ')}ing event:`, err);
      closeConfirmationModal();
    } finally {
      setActionLoading(null);
    }
  };

  // Event Transaction pagination handlers
  const handleEventTransactionPreviousPage = () => {
    if (eventTransactionsCurrentPage > 1) {
      setEventTransactionCurrentPage(eventTransactionsCurrentPage - 1);
    }
  };

  const handleEventTransactionNextPage = () => {
    if (eventTransactionsCurrentPage < eventTransactionsTotalPages) {
      setEventTransactionCurrentPage(eventTransactionsCurrentPage + 1);
    }
  };

  // Handle event transaction filter changes
  const handleEventTransactionFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      // Handle date range separately
      const dateRange = JSON.parse(value);
      setEventTransactionFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setEventTransactionFilters({ [key]: value });
    }
    if (eventTransactionsCurrentPage !== 1) {
      setEventTransactionCurrentPage(1);
    }
  };

  // Clear event transaction filters
  const clearEventTransactionFilters = () => {
    setEventTransactionFilters({
      status: 'All',
      giftStatus: 'All',
      paymentMethod: 'All',
      searchTerm: '',
      startDate: '',
      endDate: '',
      currency: []
    });
    if (eventTransactionsCurrentPage !== 1) {
      setEventTransactionCurrentPage(1);
    }
  };

  // Handle currency filter change
  const handleEventTransactionCurrencyFilterChange = (currencies: string[]) => {
    setEventTransactionFilters({ currency: currencies });
    if (eventTransactionsCurrentPage !== 1) {
      setEventTransactionCurrentPage(1);
    }
  };

  // Event Feedback pagination handlers
  const handleEventFeedbackPreviousPage = () => {
    if (eventFeedbacksCurrentPage > 1) {
      setEventFeedbackCurrentPage(eventFeedbacksCurrentPage - 1);
    }
  };

  const handleEventFeedbackNextPage = () => {
    if (eventFeedbacksCurrentPage < eventFeedbacksTotalPages) {
      setEventFeedbackCurrentPage(eventFeedbacksCurrentPage + 1);
    }
  };

  // Handle event feedback filter changes
  const handleEventFeedbackFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      // Handle date range separately
      const dateRange = JSON.parse(value);
      setEventFeedbackFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setEventFeedbackFilters({ [key]: value });
    }
    if (eventFeedbacksCurrentPage !== 1) {
      setEventFeedbackCurrentPage(1);
    }
  };

  // Clear event feedback filters
  const clearEventFeedbackFilters = () => {
    setEventFeedbackFilters({
      searchTerm: '',
      startDate: '',
      endDate: ''
    });
    if (eventFeedbacksCurrentPage !== 1) {
      setEventFeedbackCurrentPage(1);
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
      currency: currency,
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
      case 'stream-start':
        return {
          title: 'Start Streaming',
          message: 'Are you sure you want to start streaming for this event?',
          confirmText: 'Start Streaming',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          showReasonInput: false
        };
      case 'stream-end':
        return {
          title: 'Stop Streaming',
          message: 'Are you sure you want to stop streaming for this event?',
          confirmText: 'Stop Streaming',
          confirmColor: 'bg-red-600 hover:bg-red-700',
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

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Events</span>
          </button>
        </div>
        <ErrorAlert
          isOpen={true}
          message={error || 'Event not found'}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
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
                    {event.name}
                  </h1>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(event.adminStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.adminStatus)}`}>
                      {event.adminStatus}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons aligned with title */}
                <div className="flex flex-wrap gap-2 lg:gap-3 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/events/edit/${event._id}`)}
                    className="px-3 lg:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm whitespace-nowrap flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Event</span>
                  </button>
                  {event.adminStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => openConfirmationModal('approve', event._id)}
                        disabled={actionLoading === event._id}
                        className="px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === event._id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openConfirmationModal('reject', event._id)}
                        disabled={actionLoading === event._id}
                        className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === event._id ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {event.adminStatus === 'Approved' && (
                    <>
                      {event.status !== 'Past' && (
                        <button
                        onClick={() => openConfirmationModal(event.status == 'Live' ? 'stream-end' : 'stream-start', event._id)}
                        disabled={actionLoading === event._id}
                        className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap flex items-center space-x-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>{actionLoading === event._id ? 'Processing...' : (event.status == 'Live' ? 'End Stream' : 'Start Stream')}</span>
                      </button>
                      )}
                      <button
                        onClick={() => openConfirmationModal('unpublish', event._id)}
                        disabled={actionLoading === event._id}
                        className="px-3 lg:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {actionLoading === event._id ? 'Processing...' : 'Unpublish'}
                      </button>
                    </>
                  )}
                  {event.adminStatus === 'Rejected' && (
                    <button
                      onClick={() => openConfirmationModal('approve', event._id)}
                      disabled={actionLoading === event._id}
                      className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap"
                    >
                      {actionLoading === event._id ? 'Processing...' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Description below the title and buttons */}
              {event.description && (
                <p className="text-gray-600 dark:text-dark-300 mt-4 break-words">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex space-x-8 px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Event Details</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'live'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Live Stream</span>
                {event.status === 'Live' && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'transactions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'feedback'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Feedback</span>
              </div>
            </button>
          </nav>
        </div>
        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Admin Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.adminStatus)}`}>
                    {event.adminStatus}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 dark:text-dark-300">Scheduled:</span>
                  <span className="text-gray-900 dark:text-dark-100 text-right text-sm">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Event Status:</span>
                  <span className="text-gray-900 dark:text-dark-100 font-semibold">{event.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Stream Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'Live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {event.status === 'Live' ? 'Streaming' : 'Not Streaming'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Published:</span>
                  <span className="text-gray-900 dark:text-dark-100 font-semibold">
                    {event.published ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Broadcast Software:</span>
                  <span className="text-gray-900 dark:text-dark-100 font-semibold">{event.broadcastSoftware}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Can Watch Saved Stream:</span>
                  <span className="text-gray-900 dark:text-dark-100 font-semibold">
                    {event.canWatchSavedStream ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-dark-300">Broadcast Room:</span>
                  <span className="text-gray-900 dark:text-dark-100 font-semibold">
                    {event.haveBroadcastRoom ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Pricing</h3>
              <div className="space-y-2">
                {event.prices && event.prices.length > 0 ? (
                  event.prices.map((price, index) => (
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
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-dark-100 font-medium text-sm">
                      {event.createdBy.firstName} {event.createdBy.lastName}
                    </div>
                    <div className="text-gray-600 dark:text-dark-300 text-xs">
                      @{event.createdBy.username}
                    </div>
                    <div className="text-gray-500 dark:text-dark-400 text-xs">
                      {event.createdBy.email}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-300">Created:</span>
                  <span className="text-gray-900 dark:text-dark-100">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-300">Last Updated:</span>
                  <span className="text-gray-900 dark:text-dark-100">
                    {new Date(event.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {event.scheduledTestDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Test Date:</span>
                    <span className="text-gray-900 dark:text-dark-100">
                      {new Date(event.scheduledTestDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {event.bannerUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Banner</h3>
                <img
                  src={event.bannerUrl}
                  alt={event.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {event.watermarkUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Watermark</h3>
                <img
                  src={event.watermarkUrl}
                  alt="Event Watermark"
                  className="w-full h-32 object-contain rounded-lg bg-gray-50 dark:bg-dark-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {event.trailerUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Trailer</h3>
                <video
                  src={event.trailerUrl}
                  controls
                  className="w-full h-48 rounded-lg bg-gray-50 dark:bg-dark-700"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Technical Details</h3>
              <div className="space-y-3 text-sm">
                {event.ivsChannelArn && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Channel ARN:</span>
                    </div>
                    <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                      {event.ivsChannelArn}
                    </span>
                  </div>
                )}
                
                {event.ivsChatRoomArn && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Chat Room ARN:</span>
                    </div>
                    <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                      {event.ivsChatRoomArn}
                    </span>
                  </div>
                )}
                
                {event.ivsPlaybackUrl && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Playback URL:</span>
                    </div>
                    <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                      {event.ivsPlaybackUrl}
                    </span>
                  </div>
                )}

                {event.ivsIngestEndpoint && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Ingest Endpoint:</span>
                    </div>
                    <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                      {`rtmps://${event.ivsIngestEndpoint}:443/app/`}
                    </span>
                  </div>
                )}

                {event.ivsIngestStreamKey && (
                  <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-dark-300 font-medium">IVS Ingest Stream Key:</span>
                    </div>
                    <span className="text-gray-900 dark:text-dark-100 text-xs font-mono break-all">
                      {event.ivsIngestStreamKey}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          )}

          {activeTab === 'live' && (
            <LiveStreamPlayer playbackUrl={event.ivsPlaybackUrl as string} />
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Error Message */}
              <ErrorAlert
                isOpen={!!eventTransactionsError}
                message={eventTransactionsError || ''}
                onClose={clearEventTransactionError}
              />

              {/* Event Transactions Table with Filters */}
              <TransactionTable
                transactions={eventTransactions}
                loading={eventTransactionsLoading}
                currentPage={eventTransactionsCurrentPage}
                totalPages={eventTransactionsTotalPages}
                totalDocs={eventTransactionsTotalDocs}
                limit={eventTransactionsLimit}
                onPreviousPage={handleEventTransactionPreviousPage}
                onNextPage={handleEventTransactionNextPage}
                showUserColumn={true}
                emptyMessage="No Transactions Found"
                emptyDescription="No transactions have been made for this event yet."
                filters={{
                  status: eventTransactionFilters.status,
                  giftStatus: eventTransactionFilters.giftStatus,
                  paymentMethod: eventTransactionFilters.paymentMethod,
                  searchTerm: eventTransactionFilters.searchTerm,
                  startDate: eventTransactionFilters.startDate,
                  endDate: eventTransactionFilters.endDate
                }}
                onFilterChange={handleEventTransactionFilterChange}
                onClearFilters={clearEventTransactionFilters}
                showFilters={true}
                showCurrencyFilter={true}
                selectedCurrencies={eventTransactionFilters.currency}
                onCurrencyFilterChange={handleEventTransactionCurrencyFilterChange}
              />
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Error Message */}
              <ErrorAlert
                isOpen={!!eventFeedbacksError}
                message={eventFeedbacksError || ''}
                onClose={clearEventFeedbackError}
              />

              {/* Event Feedback Table with Filters */}
              <FeedbackTable
                feedbacks={eventFeedbacks}
                loading={eventFeedbacksLoading}
                currentPage={eventFeedbacksCurrentPage}
                totalPages={eventFeedbacksTotalPages}
                totalDocs={eventFeedbacksTotalDocs}
                limit={eventFeedbacksLimit}
                onPreviousPage={handleEventFeedbackPreviousPage}
                onNextPage={handleEventFeedbackNextPage}
                showEventColumn={false}
                emptyMessage="No Feedback Found"
                emptyDescription="No feedback has been submitted for this event yet."
                filters={eventFeedbackFilters}
                onFilterChange={handleEventFeedbackFilterChange}
                onClearFilters={clearEventFeedbackFilters}
                showFilters={true}
              />
            </div>
          )}
        </div>
      </div>

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

export default SingleEventPage;