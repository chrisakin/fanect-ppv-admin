import React from 'react';
import { Calendar, Filter, Eye, Edit3, CheckCircle, Clock, AlertCircle, Activity } from 'lucide-react';
import { ApiEvent } from '../../services/eventService';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Pagination } from '../ui/pagination';
import { FilterBar } from '../ui/filter-bar';
import { CustomDateRangePicker } from '../ui/custom-date-range-picker';
import { ActionDropdown } from '../ui/action-dropdown';

interface EventFilters {
  status: string;
  adminStatus: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}

interface EventsTableProps {
  events: ApiEvent[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  showActions?: boolean;
  showFullActions?: boolean;
  onViewEvent?: (eventId: string) => void;
  onEditEvent?: (eventId: string) => void;
  onApproveEvent?: (eventId: string) => void;
  onRejectEvent?: (eventId: string) => void;
  onUnpublishEvent?: (eventId: string) => void;
  onPublishEvent?: (eventId: string) => void;
  onStreamAction?: (eventId: string, action: 'stream-start' | 'stream-end') => void;
  actionLoading?: string | null;
  openDropdown?: string | null;
  onToggleDropdown?: (eventId: string | null) => void;
  // Filter props
  filters?: EventFilters;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showFilters?: boolean;
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading,
  currentPage,
  totalPages,
  totalDocs,
  limit,
  onPreviousPage,
  onNextPage,
  emptyMessage = "No Events Found",
  emptyDescription = "No events have been created yet.",
  showActions = false,
  showFullActions = true,
  onViewEvent,
  onEditEvent,
  onApproveEvent,
  onRejectEvent,
  onUnpublishEvent,
  onPublishEvent,
  onStreamAction,
  actionLoading,
  openDropdown,
  onToggleDropdown,
  filters,
  onFilterChange,
  onClearFilters,
  showFilters = false
}) => {
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

  // Action dropdown component
  const getEventActionItems = (event: ApiEvent) => {
    const items = [];

    if (onViewEvent) {
      items.push({
        icon: Eye,
        label: 'View Details',
        onClick: () => onViewEvent(event._id)
      });
    }

    if (onEditEvent) {
      items.push({
        icon: Edit3,
        label: 'Edit Event',
        onClick: () => onEditEvent(event._id)
      });
    }

    // Only show full actions if showFullActions is true
    if (!showFullActions) {
      return items;
    }

    if (event.adminStatus === 'Pending') {
      if (onApproveEvent) {
        items.push({
          icon: CheckCircle,
          label: 'Approve Event',
          onClick: () => onApproveEvent(event._id),
          disabled: actionLoading === event._id,
          className: 'text-green-700 dark:text-green-400'
        });
      }
      if (onRejectEvent) {
        items.push({
          icon: AlertCircle,
          label: 'Reject Event',
          onClick: () => onRejectEvent(event._id),
          disabled: actionLoading === event._id,
          className: 'text-red-700 dark:text-red-400'
        });
      }
    }

    if (event.adminStatus === 'Approved') {
      if (event.status !== 'Past' && onStreamAction) {
        items.push({
          icon: Activity,
          label: event.status === 'Live' ? 'Stop Streaming' : 'Start Streaming',
          onClick: () => onStreamAction(event._id, event.status === 'Live' ? 'stream-end' : 'stream-start'),
          disabled: actionLoading === event._id,
          className: 'text-blue-700 dark:text-blue-400'
        });
      }
      if (event.published && onUnpublishEvent) {
        items.push({
          icon: Clock,
          label: 'Unpublish Event',
          onClick: () => onUnpublishEvent(event._id),
          disabled: actionLoading === event._id,
          className: 'text-yellow-700 dark:text-yellow-400'
        });
      }
      if (!event.published && onPublishEvent) {
        items.push({
          icon: CheckCircle,
          label: 'Publish Event',
          onClick: () => onPublishEvent(event._id),
          disabled: actionLoading === event._id,
          className: 'text-green-700 dark:text-green-400'
        });
      }
    }

    if (event.adminStatus === 'Rejected' && onApproveEvent) {
      items.push({
        icon: CheckCircle,
        label: 'Approve Event',
        onClick: () => onApproveEvent(event._id),
        disabled: actionLoading === event._id,
        className: 'text-green-700 dark:text-green-400'
      });
    }

    return items;
  };

  // Filter configuration
  const filterConfigs = filters && onFilterChange && onClearFilters ? [
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
        { value: 'All', label: 'All Approval Status' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      value: JSON.stringify({
        startDate: filters.startDate || null,
        endDate: filters.endDate || null
      }),
      type: 'custom' as const,
      icon: Calendar,
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
      )
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && filters && onFilterChange && onClearFilters && (
        <FilterBar
          filters={filterConfigs as any}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          searchValue={filters.searchTerm}
          onSearchChange={(value) => onFilterChange('searchTerm', value)}
          searchPlaceholder="Search events..."
        />
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[300px]">
        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">{emptyMessage}</h3>
            <p className="text-gray-500 dark:text-dark-400">{emptyDescription}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full table-fixed min-w-[800px]">
                <colgroup>
                  <col className="w-[320px]" />
                  <col className="w-[180px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  <col className="w-[120px]" />
                  {showActions && <col className="w-[100px]" />}
                </colgroup>
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Approval Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Price
                    </th>
                    {showActions && (
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                      <td className="px-4 lg:px-6 py-4">
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
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate" title={event.name}>
                              {event.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-dark-100">
                        <div className="truncate">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-dark-100">
                        <div className="truncate">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          event.status === 'Live' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                          event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(event.adminStatus)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(event.adminStatus)}`}>
                            {event.adminStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900 dark:text-dark-100">
                        <div className="truncate">
                          {event.prices && event.prices.length > 0 ? formatCurrency(event.prices[0].amount, event.prices[0].currency) : 'Free'}
                        </div>
                      </td>
                      {showActions && (
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                          <ActionDropdown
                            items={getEventActionItems(event)}
                            isOpen={openDropdown === event._id}
                            onToggle={() => onToggleDropdown?.(openDropdown === event._id ? null : event._id)}
                            isLoading={actionLoading === event._id}
                            onClickOutside={() => onToggleDropdown?.(null)}
                          />
                        </td>
                      )}
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