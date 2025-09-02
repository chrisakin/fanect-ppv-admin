import React, { useEffect } from 'react';
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
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useDetailedAnalyticsStore } from '../../store/detailedAnalyticsStore';
import { EventStatus, UserStatus } from '../../services/detailedAnalyticsService';
import { CustomDateRangePicker } from '../../components/ui/custom-date-range-picker';
import { availableCurrencies, currencyNames } from '../../constants/currencies';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { ErrorAlert } from '../../components/ui/error-alert';

const AnalyticsPage: React.FC = () => {
  const {
    analytics,
    loading,
    error,
    filters,
    setFilters,
    fetchDetailedAnalytics,
    clearError
  } = useDetailedAnalyticsStore();

  useEffect(() => {
    fetchDetailedAnalytics();
  }, [filters]);

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const handleDateRangeChange = (dateRange: { startDate: string | null; endDate: string | null }) => {
    setFilters({
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      const dateRange = JSON.parse(value);
      handleDateRangeChange(dateRange);
    } else {
      setFilters({ [key]: value === 'All' ? undefined : value });
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      currency: 'USD',
      eventStatus: undefined,
      userStatus: undefined
    });
  };

  // Prepare chart data
  const getFinancialStatusData = () => {
    if (!analytics?.financialMetrics.statusBreakdown) return [];
    
    const colors = {
      'Successful': '#10B981',
      'Pending': '#F59E0B',
      'Failed': '#EF4444'
    };
    
    return analytics.financialMetrics.statusBreakdown.map(item => ({
      name: item._id,
      value: item.count,
      amount: item.amount,
      color: colors[item._id as keyof typeof colors] || '#6B7280'
    }));
  };

  const getPaymentMethodData = () => {
    if (!analytics?.financialMetrics.paymentMethodBreakdown) return [];
    
    const colors = {
      'stripe': '#8B5CF6',
      'flutterwave': '#3B82F6'
    };
    
    return analytics.financialMetrics.paymentMethodBreakdown.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      amount: item.amount,
      color: colors[item._id as keyof typeof colors] || '#6B7280'
    }));
  };

  const getEventStatusData = () => {
    if (!analytics?.eventMetrics) return [];
    
    const { eventMetrics } = analytics;
    return [
      { name: 'Approved', value: eventMetrics.approved, color: '#10B981' },
      { name: 'Pending', value: eventMetrics.pending, color: '#F59E0B' },
      { name: 'Rejected', value: eventMetrics.rejected, color: '#EF4444' },
      { name: 'Live', value: eventMetrics.live, color: '#3B82F6' },
    ].filter(item => item.value > 0);
  };

  const getRatingData = () => {
    if (!analytics?.engagementMetrics.ratings) return [];
    
    return analytics.engagementMetrics.ratings.map(rating => ({
      rating: `${rating._id} Star${rating._id !== 1 ? 's' : ''}`,
      count: rating.count
    }));
  };

  const getViewsData = () => {
    if (!analytics?.engagementMetrics.views) return [];
    
    return analytics.engagementMetrics.views.map(view => ({
      type: view._id.charAt(0).toUpperCase() + view._id.slice(1),
      count: view.count
    }));
  };

  // Calculate totals for display
  const getTotalViews = () => {
    return analytics?.engagementMetrics.views.reduce((sum, view) => sum + view.count, 0) || 0;
  };

  const getTotalRatings = () => {
    return analytics?.engagementMetrics.ratings.reduce((sum, rating) => sum + rating.count, 0) || 0;
  };

  const getAverageRating = () => {
    if (!analytics?.engagementMetrics.ratings.length) return 0;
    
    const totalRatings = analytics.engagementMetrics.ratings.reduce((sum, rating) => sum + rating.count, 0);
    const weightedSum = analytics.engagementMetrics.ratings.reduce((sum, rating) => sum + (rating._id * rating.count), 0);
    
    return totalRatings > 0 ? (weightedSum / totalRatings) : 0;
  };

  if (loading && !analytics) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-100">Detailed Analytics</h1>
          <p className="text-gray-600 dark:text-dark-300 mt-1">Comprehensive insights into your platform performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div className="sm:col-span-2 relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">Date Range</label>
            <CustomDateRangePicker
              value={{
                startDate: filters.startDate || null,
                endDate: filters.endDate || null
              }}
              onChange={handleDateRangeChange}
              placeholder="Select date range"
              className="h-10"
              showSearchButton={true}
              onSearch={handleDateRangeChange}
            />
          </div>

          {/* Currency Filter */}
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">Currency</label>
              <select
                value={filters.currency || 'USD'}
                onChange={(e) => handleFilterChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 h-10"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency} - {currencyNames[currency]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Status Filter */}
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">Event Status</label>
              <select
                value={filters.eventStatus || 'All'}
                onChange={(e) => handleFilterChange('eventStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 transition-colors duration-200 h-10"
              >
                <option value="All">All Event Status</option>
                {Object.values(EventStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors duration-200 h-10"
            >
              Clear Filters
            </button>
          </div>
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
          {/* Platform Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-4">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Total Revenue</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">
                    {formatCurrency(analytics.platformMetrics.revenue, filters.currency || 'USD')}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.platformMetrics.transactions} transactions
                  </p>
                </div>
                <div className="bg-green-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <DollarSign className="w-3 h-3 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Total Events</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{analytics.platformMetrics.events}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.eventMetrics.live} currently live
                  </p>
                </div>
                <div className="bg-blue-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Total Users</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{analytics.platformMetrics.users.toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    {analytics.userMetrics.verified} verified
                  </p>
                </div>
                <div className="bg-purple-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300 truncate">Total Views</p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mt-1">{getTotalViews().toLocaleString()}</p>
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-dark-400 mt-1 truncate">
                    Conversion: {analytics.performanceMetrics.conversionRate}%
                  </p>
                </div>
                <div className="bg-orange-500 p-2 lg:p-3 rounded-lg flex-shrink-0 ml-3">
                  <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Transaction Status Breakdown */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Transaction Status</h3>
              <div className="h-64">
                {getFinancialStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getFinancialStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getFinancialStatusData().map((entry, index) => (
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
                        formatter={(value: number, name: string, props: any) => [
                          `${value} transactions (${formatCurrency(props.payload.amount, filters.currency || 'USD')})`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                    <div className="text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No transaction data available</p>
                    </div>
                  </div>
                )}
              </div>
              {getFinancialStatusData().length > 0 && (
                <div className="flex justify-center space-x-6 mt-4 flex-wrap">
                  {getFinancialStatusData().map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Payment Methods</h3>
              <div className="h-64">
                {getPaymentMethodData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPaymentMethodData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
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
                        formatter={(value: number, name: string, props: any) => [
                          `${value} transactions (${formatCurrency(props.payload.amount, filters.currency || 'USD')})`,
                          'Transactions'
                        ]}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                    <div className="text-center">
                      <CreditCard className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No payment method data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event and User Metrics */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {/* Event Status Distribution */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Status Distribution</h3>
              <div className="h-64">
                {getEventStatusData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getEventStatusData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getEventStatusData().map((entry, index) => (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No event data available</p>
                    </div>
                  </div>
                )}
              </div>
              {getEventStatusData().length > 0 && (
                <div className="flex justify-center space-x-6 mt-4 flex-wrap">
                  {getEventStatusData().map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Engagement */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">User Engagement</h3>
              <div className="space-y-4">
                {/* User Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.userMetrics.active}</p>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Active Users</p>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.userMetrics.verified}</p>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Verified Users</p>
                    </div>
                  </div>
                </div>

                {/* Views Breakdown */}
                {getViewsData().length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-dark-100 mb-3">Views Breakdown</h4>
                    <div className="space-y-2">
                      {getViewsData().map((view) => (
                        <div key={view.type} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-700 rounded">
                          <span className="text-sm text-gray-600 dark:text-dark-300">{view.type} Views</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{view.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Average Rating */}
                {getTotalRatings() > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{getAverageRating().toFixed(1)}/5</p>
                      <p className="text-sm text-gray-600 dark:text-dark-300">Average Rating</p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">{getTotalRatings()} total ratings</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ratings Distribution */}
          {getRatingData().length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Ratings Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getRatingData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="rating" 
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
                      formatter={(value: number) => [value, 'Count']}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event Metrics Card */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Event Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Approved</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventMetrics.approved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventMetrics.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Rejected</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventMetrics.rejected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Live</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventMetrics.live}</span>
                </div>
              </div>
            </div>

            {/* User Metrics Card */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                User Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Total Users</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.userMetrics.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Verified Users</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{analytics.userMetrics.verified}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Active Users</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{analytics.userMetrics.active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Locked Users</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">{analytics.userMetrics.locked}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-dark-300">Verification Rate</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                      {analytics.userMetrics.total > 0 ? Math.round((analytics.userMetrics.verified / analytics.userMetrics.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                Financial Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Total Revenue</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(analytics.platformMetrics.revenue, filters.currency || 'USD')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Total Transactions</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.platformMetrics.transactions}</span>
                </div>
                {analytics.financialMetrics.statusBreakdown.map((status) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-dark-300">{status._id} Transactions</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                      {status.count} ({formatCurrency(status.amount, filters.currency || 'USD')})
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200 dark:border-dark-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-dark-300">Avg Transaction</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                      {analytics.platformMetrics.transactions > 0 
                        ? formatCurrency(analytics.platformMetrics.revenue / analytics.platformMetrics.transactions, filters.currency || 'USD')
                        : formatCurrency(0, filters.currency || 'USD')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Performance</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Generated {formatCurrency(analytics.platformMetrics.revenue, filters.currency || 'USD')} from {analytics.platformMetrics.transactions} transaction{analytics.platformMetrics.transactions !== 1 ? 's' : ''} with a conversion rate of {analytics.performanceMetrics.conversionRate}%.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Event Success</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {analytics.eventMetrics.total > 0 
                    ? `${Math.round((analytics.eventMetrics.approved / analytics.eventMetrics.total) * 100)}% event approval rate`
                    : 'No events created yet'
                  } with {analytics.eventMetrics.live} event{analytics.eventMetrics.live !== 1 ? 's' : ''} currently live.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">User Engagement</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {analytics.userMetrics.total > 0 
                    ? `${Math.round((analytics.userMetrics.verified / analytics.userMetrics.total) * 100)}% user verification rate`
                    : 'No users registered yet'
                  } with {getTotalViews().toLocaleString()} total view{getTotalViews() !== 1 ? 's' : ''} across all events.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Conversion Rate</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{analytics.performanceMetrics.conversionRate}%</p>
                </div>
                <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Event Approval Rate</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.eventMetrics.total > 0 ? Math.round((analytics.eventMetrics.approved / analytics.eventMetrics.total) * 100) : 0}%
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">User Verification Rate</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.userMetrics.total > 0 ? Math.round((analytics.userMetrics.verified / analytics.userMetrics.total) * 100) : 0}%
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {getTotalRatings() > 0 ? getAverageRating().toFixed(1) : '0.0'}/5
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Performance */}
          {getPaymentMethodData().length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6 transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Payment Methods Performance</h3>
              <div className="space-y-6">
                {getPaymentMethodData().map((method, index) => {
                  const totalTransactions = analytics.platformMetrics.transactions;
                  const percentage = totalTransactions > 0 ? (method.value / totalTransactions) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            method.name === 'Stripe' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                          }`}>
                            <CreditCard className={`w-5 h-5 ${
                              method.name === 'Stripe' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{method.name}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-400">{method.value.toLocaleString()} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-dark-100">
                            {formatCurrency(method.amount, filters.currency || 'USD')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-400">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            method.name === 'Stripe' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range Information */}
          <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-dark-100">Analysis Period</h4>
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                  {analytics.dateRange.startDate && analytics.dateRange.endDate ? (
                    `${new Date(analytics.dateRange.startDate).toLocaleDateString()} - ${new Date(analytics.dateRange.endDate).toLocaleDateString()}`
                  ) : (
                    'Last 90 days (default)'
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Currency: {analytics.filters.currency}</p>
                <p className="text-xs text-gray-500 dark:text-dark-400">All amounts displayed in {analytics.filters.currency}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;