import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  Eye,
  MessageCircle,
  CreditCard,
  UserCheck,
  Filter
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data - in real implementation, this would come from API
  const overviewStats = [
    {
      label: 'Total Revenue',
      value: '$284,590',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Total Events',
      value: '156',
      change: '+8.2%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      label: 'Active Users',
      value: '24,891',
      change: '+15.3%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      label: 'Total Views',
      value: '1.2M',
      change: '+18.7%',
      changeType: 'positive',
      icon: Eye,
      color: 'bg-orange-500'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45000, events: 12, users: 1200 },
    { month: 'Feb', revenue: 52000, events: 15, users: 1450 },
    { month: 'Mar', revenue: 48000, events: 13, users: 1380 },
    { month: 'Apr', revenue: 61000, events: 18, users: 1650 },
    { month: 'May', revenue: 55000, events: 16, users: 1520 },
    { month: 'Jun', revenue: 67000, events: 20, users: 1800 },
    { month: 'Jul', revenue: 72000, events: 22, users: 1950 },
    { month: 'Aug', revenue: 68000, events: 19, users: 1820 },
    { month: 'Sep', revenue: 75000, events: 24, users: 2100 },
    { month: 'Oct', revenue: 82000, events: 26, users: 2250 },
    { month: 'Nov', revenue: 78000, events: 23, users: 2180 },
    { month: 'Dec', revenue: 85000, events: 28, users: 2400 }
  ];

  const eventStatusData = [
    { name: 'Completed', value: 65, color: '#1AAA65' },
    { name: 'Live', value: 8, color: '#EF4444' },
    { name: 'Upcoming', value: 20, color: '#3B82F6' },
    { name: 'Cancelled', value: 7, color: '#6B7280' },
  ];

  const topEvents = [
    { name: 'Tech Conference 2024', revenue: 45600, attendees: 2400, rating: 4.8 },
    { name: 'Digital Marketing Summit', revenue: 38200, attendees: 1950, rating: 4.6 },
    { name: 'AI & Machine Learning Workshop', revenue: 32800, attendees: 1680, rating: 4.9 },
    { name: 'Startup Pitch Competition', revenue: 28500, attendees: 1420, rating: 4.5 },
    { name: 'Web Development Bootcamp', revenue: 25300, attendees: 1280, rating: 4.7 },
  ];

  const userGrowthData = [
    { week: 'Week 1', newUsers: 245, totalUsers: 18500 },
    { week: 'Week 2', newUsers: 312, totalUsers: 18812 },
    { week: 'Week 3', newUsers: 428, totalUsers: 19240 },
    { week: 'Week 4', newUsers: 356, totalUsers: 19596 },
    { week: 'Week 5', newUsers: 489, totalUsers: 20085 },
    { week: 'Week 6', newUsers: 523, totalUsers: 20608 },
    { week: 'Week 7', newUsers: 445, totalUsers: 21053 },
    { week: 'Week 8', newUsers: 567, totalUsers: 21620 },
  ];

  const paymentMethodData = [
    { method: 'Stripe', transactions: 1250, revenue: 125000 },
    { method: 'Flutterwave', transactions: 890, revenue: 89000 },
  ];

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'revenue':
        return revenueData.map(item => ({ ...item, value: item.revenue }));
      case 'events':
        return revenueData.map(item => ({ ...item, value: item.events }));
      case 'users':
        return revenueData.map(item => ({ ...item, value: item.users }));
      default:
        return revenueData.map(item => ({ ...item, value: item.revenue }));
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue':
        return 'Revenue ($)';
      case 'events':
        return 'Events Count';
      case 'users':
        return 'Active Users';
      default:
        return 'Revenue ($)';
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-dark-300 mt-1">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {overviewStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">{stat.label}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{stat.value}</p>
                <p className={`text-xs lg:text-sm mt-1 truncate ${
                  stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change} from last period
                </p>
              </div>
              <div className={`${stat.color} p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3`}>
                <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Performance Trends</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-dark-400" />
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm"
            >
              <option value="revenue">Revenue</option>
              <option value="events">Events</option>
              <option value="users">Active Users</option>
            </select>
          </div>
        </div>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getMetricData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280" 
                fontSize={12}
                tickMargin={8}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickMargin={8}
                label={{ value: getMetricLabel(), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--tooltip-bg)', 
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }} 
              />
              <Area type="monotone" dataKey="value" stroke="#1AAA65" fill="#1AAA65" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Event Status Distribution */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {eventStatusData.map((entry, index) => (
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
            {eventStatusData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="week" 
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
                <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Events and Payment Methods */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Top Performing Events */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Top Performing Events</h3>
          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{event.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">{event.attendees.toLocaleString()} attendees</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">${event.revenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-dark-400">★ {event.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Performance */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Payment Methods Performance</h3>
          <div className="space-y-6">
            {paymentMethodData.map((method, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      method.method === 'Stripe' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        method.method === 'Stripe' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{method.method}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">{method.transactions.toLocaleString()} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-dark-100">${method.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      {((method.revenue / paymentMethodData.reduce((sum, m) => sum + m.revenue, 0)) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      method.method === 'Stripe' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${(method.revenue / paymentMethodData.reduce((sum, m) => sum + m.revenue, 0)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Insights */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Growth</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Revenue has increased by 12.5% compared to the previous period, driven by higher ticket sales and premium event offerings.
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">User Engagement</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                User engagement is at an all-time high with 15.3% growth in active users and improved retention rates.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Event Quality</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Average event rating has improved to 4.7/5, indicating high satisfaction levels among attendees.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm text-gray-600 dark:text-dark-300">Live Events</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">12</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm text-gray-600 dark:text-dark-300">Active Organizers</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">89</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm text-gray-600 dark:text-dark-300">Avg Feedback Rating</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">4.6/5</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm text-gray-600 dark:text-dark-300">Conversion Rate</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">8.4%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm text-gray-600 dark:text-dark-300">Avg Watch Time</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">28m 45s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;