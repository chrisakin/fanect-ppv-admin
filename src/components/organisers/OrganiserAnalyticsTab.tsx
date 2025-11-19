import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Eye, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Activity, 
  Star, 
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  CreditCard,
  Gift
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { organiserAnalyticsService, OrganiserAnalytics } from '../../services/organiserAnalyticsService';
import { MonthYearPicker } from '../ui/month-year-picker';
import { availableCurrencies, currencyNames } from '../../constants/currencies';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';

interface OrganiserAnalyticsTabProps {
  organiserId: string;
}

/**
 * OrganiserAnalyticsTab
 *
 * Shows analytics for a single organiser. The component fetches data from
 * `organiserAnalyticsService` and renders overview cards, charts, lists and
 * insights. It accepts filter controls (month and currency) which trigger
 * a refresh when changed.
 */
export const OrganiserAnalyticsTab: React.FC<OrganiserAnalyticsTabProps> = ({ organiserId }) => {
  // Core data and UI state
  const [analytics, setAnalytics] = useState<OrganiserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters: month is stored as yyyy-MM and currency code (USD, NGN, etc.)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Fetch analytics when component mounts or filters change
  useEffect(() => {
    fetchAnalytics();
  }, [organiserId, selectedMonth, selectedCurrency]);

  /**
   * fetchAnalytics
   *
   * Calls the organiser analytics service with the current filters and
   * updates local state. Shows a loading spinner while the request is in
   * progress and surfaces API errors through `error`.
   */
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organiserAnalyticsService.getOrganiserAnalytics(organiserId, selectedMonth, selectedCurrency);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organiser analytics');
      console.error('Error fetching organiser analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * formatCurrency
   *
   * Helper to format numeric amounts into localized currency strings.
   */
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  /**
   * renderStars
   *
   * Render a 5-star rating visual using the `Star` icon. Filled stars are
   * shown for values less than the rating.
   */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  // Prepare event status data for pie chart
  const getEventStatusData = () => {
    if (!analytics?.eventStats) return [];
    
    const { eventStats } = analytics;
    return [
      { name: 'Approved', value: eventStats.approved, color: '#10B981' },
      { name: 'Pending', value: eventStats.pending, color: '#F59E0B' },
      { name: 'Rejected', value: eventStats.rejected, color: '#EF4444' },
      { name: 'Live', value: eventStats.live, color: '#3B82F6' },
      { name: 'Upcoming', value: eventStats.upcoming, color: '#8B5CF6' },
      { name: 'Past', value: eventStats.past, color: '#6B7280' },
    ].filter(item => item.value > 0);
  };

  // Prepare rating breakdown data for pie chart
  const getRatingBreakdownData = () => {
    if (!analytics?.ratings.ratingBreakdown) return [];
    
    const breakdown = analytics.ratings.ratingBreakdown;
    return [
      { name: '5 Stars', value: breakdown.fiveStars, color: '#10B981' },
      { name: '4 Stars', value: breakdown.fourStars, color: '#3B82F6' },
      { name: '3 Stars', value: breakdown.threeStars, color: '#F59E0B' },
      { name: '2 Stars', value: breakdown.twoStars, color: '#F97316' },
      { name: '1 Star', value: breakdown.oneStar, color: '#EF4444' },
    ].filter(item => item.value > 0);
  };

  // Prepare top events data for bar chart
  const getTopEventsChartData = () => {
    if (!analytics?.topEvents) return [];
    
    return analytics.topEvents.slice(0, 5).map(event => ({
      name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      fullName: event.name,
      revenue: event.revenue,
      views: event.views,
      streampassesSold: event.streampassesSold
    }));
  };

  const getEventStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'live':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Organiser Analytics</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-200">Month:</label>
              <MonthYearPicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Select month"
                className="w-48"
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-200">Currency:</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 transition-colors duration-200 text-sm"
              >
                {availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency} - {currencyNames[currency]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      {loading ? (
        <LoadingSpinner />
      ) : !analytics ? (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Analytics Available</h3>
          <p className="text-gray-500 dark:text-dark-400">No analytics data found for the selected period.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{analytics.eventStats.total}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Events created</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(analytics.revenue.total, selectedCurrency)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Total earnings</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.engagement.totalViews.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">All-time views</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Average Rating</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analytics.ratings.averageRating || 0}/5
                    </p>
                    <div className="flex items-center space-x-1">
                      {renderStars(analytics.ratings.averageRating || 0)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {analytics.ratings.totalRatings} rating{analytics.ratings.totalRatings !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.revenue.totalTransactions}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">All transactions</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Unique Viewers</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.engagement.uniqueViewers.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Distinct users</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Stream Passes Sold</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.engagement.totalStreampassesSold}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Premium access</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Gift Transactions</p>
                  <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{analytics.revenue.giftTransactions}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Gift purchases</p>
                </div>
                <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-lg">
                  <Gift className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Event Status Distribution */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
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
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No events data available</p>
                    </div>
                  </div>
                )}
              </div>
              {getEventStatusData().length > 0 && (
                <div className="flex justify-center space-x-4 mt-4 flex-wrap">
                  {getEventStatusData().map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Distribution */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Rating Distribution</h3>
              <div className="h-64">
                {getRatingBreakdownData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRatingBreakdownData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getRatingBreakdownData().map((entry, index) => (
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
                      <Star className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No ratings available</p>
                    </div>
                  </div>
                )}
              </div>
              {getRatingBreakdownData().length > 0 && (
                <div className="flex justify-center space-x-4 mt-4 flex-wrap">
                  {getRatingBreakdownData().map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-dark-300">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Events Performance */}
          {analytics.topEvents.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Top Events Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopEventsChartData()}>
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
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value, selectedCurrency), 'Revenue'];
                        }
                        return [value.toLocaleString(), name === 'views' ? 'Views' : 'Stream Passes'];
                      }}
                      labelFormatter={(label: string) => {
                        const event = getTopEventsChartData().find(e => e.name === label);
                        return event?.fullName || label;
                      }}
                    />
                    <Bar dataKey="revenue" fill="#1AAA65" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Statistics */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Event Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Approved Events</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventStats.approved}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Pending Events</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventStats.pending}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Rejected Events</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventStats.rejected}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Live Events</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventStats.live}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-dark-300">Upcoming Events</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.eventStats.upcoming}</span>
                </div>
              </div>
            </div>

            {/* Revenue & Engagement Breakdown */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue & Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Successful Transactions</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{analytics.revenue.successfulTransactions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Average Transaction Value</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                    {formatCurrency(analytics.revenue.averageTransactionValue, selectedCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Live Views</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.engagement.liveViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Replay Views</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.engagement.replayViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-dark-300">Total Ratings</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{analytics.ratings.totalRatings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Events List */}
          {analytics.topEvents.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Top Performing Events</h3>
              <div className="space-y-4">
                {analytics.topEvents.map((event, index) => (
                  <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getEventStatusIcon(event.status)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-100">{event.name}</div>
                          <div className="text-xs text-gray-500 dark:text-dark-400">
                            {new Date(event.date).toLocaleDateString()} • {event.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(event.revenue, selectedCurrency)}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-dark-400">
                        <span>{event.views.toLocaleString()} views</span>
                        <span>{event.streampassesSold} passes</span>
                        <span>{event.ratings} rating{event.ratings !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Performance</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Generated {formatCurrency(analytics.revenue.total, selectedCurrency)} from {analytics.revenue.totalTransactions} transaction{analytics.revenue.totalTransactions !== 1 ? 's' : ''} this period.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Event Success Rate</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {analytics.eventStats.total > 0 
                    ? `${Math.round((analytics.eventStats.approved / analytics.eventStats.total) * 100)}% of events approved`
                    : 'No events created yet'
                  } ({analytics.eventStats.approved} out of {analytics.eventStats.total}).
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Audience Engagement</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {analytics.engagement.totalViews > 0 
                    ? `Reached ${analytics.engagement.uniqueViewers.toLocaleString()} unique viewers with ${analytics.engagement.totalViews.toLocaleString()} total views.`
                    : 'No viewer engagement data available yet.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {analytics.eventStats.total > 0 ? Math.round((analytics.eventStats.approved / analytics.eventStats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-400">Approval Rate</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {analytics.revenue.totalTransactions > 0 
                    ? Math.round((analytics.revenue.successfulTransactions / analytics.revenue.totalTransactions) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-400">Success Rate</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {analytics.engagement.totalViews > 0 
                    ? Math.round((analytics.engagement.replayViews / analytics.engagement.totalViews) * 100) 
                    : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-400">Replay Rate</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {analytics.ratings.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 dark:text-dark-400">Avg Rating</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};