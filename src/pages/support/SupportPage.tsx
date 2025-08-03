import React, { useState } from 'react';
import { SupportTicket } from '../../types';
import { Search, Filter, Star, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const tickets: SupportTicket[] = [
    {
      id: 'ticket_001',
      userName: 'Alice Johnson',
      userEmail: 'alice@example.com',
      eventName: 'Tech Conference 2024',
      subject: 'Stream quality issues',
      message: 'The stream keeps buffering and the audio is out of sync. This is very frustrating.',
      status: 'Open',
      priority: 'High',
      createdAt: new Date('2024-01-15T10:30:00'),
      rating: 2
    },
    {
      id: 'ticket_002',
      userName: 'Bob Smith',
      userEmail: 'bob@example.com',
      eventName: 'Music Festival Live',
      subject: 'Payment not processed',
      message: 'I paid for the StreamPass but it shows as pending in my account.',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: new Date('2024-01-14T16:45:00')
    },
    {
      id: 'ticket_003',
      userName: 'Carol Williams',
      userEmail: 'carol@example.com',
      eventName: 'Startup Pitch Night',
      subject: 'Cannot access event',
      message: 'I purchased a ticket but cannot find the event in my account.',
      status: 'Resolved',
      priority: 'Low',
      createdAt: new Date('2024-01-13T08:15:00'),
      rating: 5
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    console.log('Updating ticket status:', ticketId, newStatus);
    // Implementation for updating ticket status
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Support Tickets
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  {selectedTicket.rating && (
                    <div className="flex items-center space-x-1">
                      {renderStars(selectedTicket.rating)}
                      <span className="text-sm text-gray-600">({selectedTicket.rating}/5)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">{selectedTicket.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{selectedTicket.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="text-gray-900">{selectedTicket.eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-900">{selectedTicket.createdAt.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{selectedTicket.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Feedback & Ratings</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1000px]">
            <colgroup>
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ticket.userName}</div>
                      <div className="text-sm text-gray-500">{ticket.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.eventName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.rating ? (
                      <div className="flex items-center space-x-1">
                        {renderStars(ticket.rating)}
                        <span className="text-sm text-gray-600">({ticket.rating})</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">No rating</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
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

export default SupportPage;