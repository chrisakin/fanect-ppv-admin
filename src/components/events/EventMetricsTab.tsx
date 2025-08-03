import React from 'react';
import { BarChart3, Users, Eye, MessageCircle, DollarSign, TrendingUp, Clock, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface EventMetricsTabProps {
  eventId: string;
}

export const EventMetricsTab: React.FC<EventMetricsTabProps> = ({ eventId }) => {
  // Mock data - in real implementation, this would come from API
  const metrics = {
    totalViews: 15420,
    uniqueViewers: 8750,
    avgWatchTime: '24m 35s',
    peakViewers: 3200,
    totalRevenue: 45680,
    ticketsSold: 1250,
    chatMessages: 5680,
    feedbackCount: 89,
    avgRating: 4.6
  };

  const viewershipData = [
    { time: '00:00', viewers: 0 },
    { time: '00:15', viewers: 450 },
    { time: '00:30', viewers: 1200 },
    { time: '00:45', viewers: 2100 },
    { time: '01:00', viewers: 3200 },
    { time: '01:15', viewers: 2800 },
    { time: '01:30', viewers: 2400 },
    { time: '01:45', viewers: 1800 },
    { time: '02:00', viewers: 1200 },
    { time: '02:15', viewers: 800 },
    { time: '02:30', viewers: 400 },
    { time: '02:45', viewers: 150 },
  ];

  const revenueData = [
    { period: 'Week 1', revenue: 8500 },
    { period: 'Week 2', revenue: 12300 },
    { period: 'Week 3', revenue: 15600 },
    { period: 'Week 4', revenue: 9280 },
  ];

  const audienceData = [
    { name: 'Desktop', value: 65, color: '#1AAA65' },
    { name: 'Mobile', value: 30, color: '#3B82F6' },
    { name: 'Tablet', value: 5, color: '#F59E0B' },
  ];

  const engagementData = [
    { metric: 'Chat Messages', value: 5680, change: '+12%' },
    { metric: 'Reactions', value: 2340, change: '+8%' },
    { metric: 'Shares', value: 890, change: '+25%' },
    { metric: 'Downloads', value: 456, change: '+5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.totalViews.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+15% from last event</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Unique Viewers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.uniqueViewers.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+8% from last event</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Avg Watch Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.avgWatchTime}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+3m from last event</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Peak Viewers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.peakViewers.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+22% from last event</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+18% from last event</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Tickets Sold</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.ticketsSold.toLocaleString()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+12% from last event</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics.avgRating}/5</p>
              <p className="text-sm text-green-600 dark:text-green-400">+0.3 from last event</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Viewership Over Time */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Viewership Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewershipData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Area type="monotone" dataKey="viewers" stroke="#1AAA65" fill="#1AAA65" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue by Week</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={8}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
                <Bar dataKey="revenue" fill="#1AAA65" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audience and Engagement */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Audience Breakdown */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Audience by Device</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {audienceData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            {engagementData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{item.metric}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{item.value.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">{item.change}</span>
                  <p className="text-xs text-gray-500 dark:text-dark-400">vs last event</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Peak Performance</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Highest viewership occurred at 1:00 PM with 3,200 concurrent viewers, likely due to lunch break timing.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Success</h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              Revenue exceeded expectations by 18%, with strong performance in premium ticket sales.
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Audience Engagement</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              High chat activity with 5,680 messages indicates strong audience engagement throughout the event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};