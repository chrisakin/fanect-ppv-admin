import React, { useState } from 'react';
import { Calendar, Filter, Search, Eye, Edit3, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Event } from '../../types';

const EventsPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Conference 2024',
      organizer: 'John Doe',
      scheduledTime: new Date('2024-03-15T10:00:00'),
      status: 'Live',
      totalViews: 12450,
      avgWatchTime: 45,
      chatCount: 892,
      streamPassPurchases: 234,
      revenue: 15600,
      thumbnailUrl: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: '2',
      title: 'Music Festival Live',
      organizer: 'Sarah Wilson',
      scheduledTime: new Date('2024-03-18T18:00:00'),
      status: 'Pending',
      totalViews: 0,
      avgWatchTime: 0,
      chatCount: 0,
      streamPassPurchases: 0,
      revenue: 0
    },
    {
      id: '3',
      title: 'Startup Pitch Night',
      organizer: 'Mike Johnson',
      scheduledTime: new Date('2024-03-10T19:00:00'),
      status: 'Completed',
      totalViews: 8920,
      avgWatchTime: 38,
      chatCount: 567,
      streamPassPurchases: 189,
      revenue: 9450
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Live':
        return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter !== 'All' && event.status !== filter) return false;
    if (dateFilter && !event.scheduledTime.toISOString().startsWith(dateFilter)) return false;
    return true;
  });

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
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100">{selectedEvent.title}</h1>
                <p className="text-gray-600 dark:text-dark-300 mt-1">Organized by {selectedEvent.organizer}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <button className="px-3 lg:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm">
                  Approve
                </button>
                <button className="px-3 lg:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm">
                  Pending
                </button>
                <button className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm">
                  Reject
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-dark-300">Scheduled:</span>
                    <span className="text-gray-900 dark:text-dark-100 text-right text-sm">{selectedEvent.scheduledTime.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-dark-300">Revenue:</span>
                    <span className="text-gray-900 dark:text-dark-100 font-semibold">${selectedEvent.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Actions</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-dark-300 sm:w-32">Currency:</label>
                    <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200">
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-dark-300 sm:w-32">Date:</label>
                    <input
                      type="datetime-local"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
                      defaultValue={selectedEvent.scheduledTime.toISOString().slice(0, 16)}
                    />
                  </div>
                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 lg:p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-dark-300">Total Views</p>
                    <p className="text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedEvent.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 lg:p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-dark-300">Avg. Watch Time</p>
                    <p className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">{selectedEvent.avgWatchTime}min</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 lg:p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-dark-300">Chat Messages</p>
                    <p className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedEvent.chatCount}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 lg:p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-dark-300">StreamPass Sales</p>
                    <p className="text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{selectedEvent.streamPassPurchases}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Technical Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Buffering Ratio:</span>
                    <span className="text-green-600 dark:text-green-400">2.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Crash Rate:</span>
                    <span className="text-green-600 dark:text-green-400">0.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Support Tickets:</span>
                    <span className="text-gray-900 dark:text-dark-100">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-300">Stream Health:</span>
                    <span className="text-green-600 dark:text-green-400">Excellent</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Event Management</h1>
        <button className="bg-primary-600 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 transition-colors duration-200">
          <Calendar className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-dark-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-dark-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {event.thumbnailUrl && (
                        <img
                          src={event.thumbnailUrl}
                          alt={event.title}
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover mr-3 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">{event.title}</div>
                        <div className="text-sm text-gray-500 dark:text-dark-400">{event.totalViews.toLocaleString()} views</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                    {event.organizer}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                    {event.scheduledTime.toLocaleDateString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-100">
                    ${event.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 transition-colors duration-200">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;