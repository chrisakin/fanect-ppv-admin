import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, X, Activity } from 'lucide-react';
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

const SingleEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
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
  }, [id]);

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
      case 'stream-start':
        return {
          title: 'Start Stream',
          message: 'Are you sure you want to start the stream for this event?',
          confirmText: 'Start Stream',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          showReasonInput: false
        };
      case 'stream-end':
        return {
          title: 'End Stream',
          message: 'Are you sure you want to end the stream for this event?',
          confirmText: 'End Stream',
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
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error || 'Event not found'}
          </p>
        </div>
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
                      <button
                        onClick={() => openConfirmationModal(event.isStreaming ? 'stream-end' : 'stream-start', event._id)}
                        disabled={actionLoading === event._id}
                        className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm disabled:opacity-50 whitespace-nowrap flex items-center space-x-2"
                      >
                        <Activity className="w-4 h-4" />
                        <span>{actionLoading === event._id ? 'Processing...' : (event.isStreaming ? 'End Stream' : 'Start Stream')}</span>
                      </button>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
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
                    event.isStreaming ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {event.isStreaming ? 'Streaming' : 'Not Streaming'}
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
                {event.publishedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Published By:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-mono text-xs">{event.publishedBy}</span>
                  </div>
                )}
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
                      {event.ivsIngestEndpoint}
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

export default SingleEventPage;