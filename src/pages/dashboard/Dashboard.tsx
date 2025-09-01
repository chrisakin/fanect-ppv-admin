import React, { useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Calendar,
  Play,
  CheckCircle,
  DollarSign,
  Eye,
  Star,
  UserCheck,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useDashboardStore } from '../../store/dashboardStore';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorAlert } from '../../components/ui/error-alert';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    analytics,
    loading,
    error,
    timeframe,
    currency,
    setTimeframe,
    setCurrency,
    fetchDashboardAnalytics,
    clearError
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [timeframe, currency]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare chart data
  const userGrowthData = analytics?.charts.userGrowth.map(item => ({
    date: formatDate(item._id),
    users: item.count
  })) || [];

  const revenueGrowthData = analytics?.charts.revenueGrowth.map(item => ({
    date: formatDate(item._id),
    revenue: item.revenue,
    transactions: item.transactions
  })) || [];

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

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Past':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading && !analytics) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-dark-300 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm"
          >
            <option value="24h">Last 24 hrs</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm"
          >
            <option value="USD">USD</option>
            <option value="NGN">NGN</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={clearError}
      />

      {analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Live Events</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{analytics.eventStats.live}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.eventStats.new} new this period
                  </p>
                </div>
                <div className="bg-red-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <Play className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Total Revenue</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">
                    {formatCurrency(analytics.revenueStats.total, analytics.revenueStats.currency)}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.revenueStats.transactions} transactions
                  </p>
                </div>
                <div className="bg-green-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Active Users</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{analytics.userStats.active.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.userStats.verificationRate}% verified
                  </p>
                </div>
                <div className="bg-blue-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Event Approval Rate</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{analytics.eventStats.approvalRate}%</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.eventStats.approved} approved
                  </p>
                </div>
                <div className="bg-primary-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue Growth</h3>
              <div className="h-64 lg:h-80">
                {revenueGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
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
                        formatter={(value: number) => [formatCurrency(value, currency), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#1AAA65" fill="#1AAA65" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No revenue data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">User Growth</h3>
              <div className="h-64 lg:h-80">
                {userGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
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
                        formatter={(value: number) => [value, 'New Users']}
                      />
                      <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No user growth data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.engagementStats.totalViews.toLocaleString()}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Stream Passes Sold</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.engagementStats.streampassesSold}</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Average Rating</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.engagementStats.averageRating}/5</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < analytics.engagementStats.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Feedback</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.engagementStats.feedbacks}</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Top Events */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Events */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Recent Events</h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {analytics.recentActivity.recentEvents.slice(0, 5).map((event) => (
                  <div key={event._id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-dark-700 rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(event.adminStatus)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.adminStatus)}`}>
                          {event.adminStatus}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate" title={event.name}>
                          {event.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                ))}
                {analytics.recentActivity.recentEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No recent events</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Recent Users</h3>
                <button
                  onClick={() => navigate('/users')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {analytics.recentActivity.recentUsers.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 dark:bg-dark-700 rounded-lg transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isVerified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
                {analytics.recentActivity.recentUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-dark-400">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No recent users</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Events */}
          {analytics.topEvents.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Top Performing Events</h3>
                <button
                  onClick={() => navigate('/events')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {analytics.topEvents.slice(0, 5).map((event, index) => (
                  <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{event.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500 dark:text-dark-400">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(event.revenue, currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {event.viewCount} view{event.viewCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Performance</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Generated {formatCurrency(analytics.revenueStats.total, currency)} from {analytics.revenueStats.transactions} transaction{analytics.revenueStats.transactions !== 1 ? 's' : ''} with an average of {formatCurrency(analytics.revenueStats.average, currency)} per transaction.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">User Growth</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {analytics.userStats.new} new user{analytics.userStats.new !== 1 ? 's' : ''} joined this period. {analytics.userStats.verificationRate}% of all users are verified with {analytics.userStats.active} currently active.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Event Quality</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {analytics.eventStats.approvalRate}% event approval rate with {analytics.eventStats.live} currently live. Average rating of {analytics.engagementStats.averageRating}/5 from {analytics.engagementStats.feedbacks} feedback{analytics.engagementStats.feedbacks !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;