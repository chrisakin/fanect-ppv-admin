import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, MessageCircle, DollarSign, TrendingUp, Clock, Activity, Star, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { eventMetricsService, EventMetrics } from '../../services/eventMetricsService';
import { MonthYearPicker } from '../ui/month-year-picker';
import { availableCurrencies, currencyNames } from '../../constants/currencies';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';

interface EventMetricsTabProps {
  eventId: string;
}

export const EventMetricsTab: React.FC<EventMetricsTabProps> = ({ eventId }) => {
  const [metrics, setMetrics] = useState<EventMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Fetch metrics when component mounts or filters change
  useEffect(() => {
    fetchMetrics();
  }, [eventId, selectedMonth, selectedCurrency]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventMetricsService.getEventMetrics(eventId, selectedMonth, selectedCurrency);
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch event metrics');
      console.error('Error fetching event metrics:', err);
    } finally {
      setLoading(false);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  // Prepare chart data from transactions
  const getRevenueChartData = () => {
    if (!metrics?.earnings.transactions) return [];
    
    // Group transactions by date
    const groupedData = metrics.earnings.transactions.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = { date, revenue: 0 };
      }
      acc[date].revenue += transaction.amount;
      return acc;
    }, {} as Record<string, { date: string; revenue: number }>);
    
    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Prepare rating breakdown data for pie chart
  const getRatingBreakdownData = () => {
    if (!metrics?.ratings[0]?.breakdown) return [];
    
    const breakdown = metrics.ratings[0].breakdown;
    return [
      { name: '5 Stars', value: breakdown[5], color: '#10B981' },
      { name: '4 Stars', value: breakdown[4], color: '#3B82F6' },
      { name: '3 Stars', value: breakdown[3], color: '#F59E0B' },
      { name: '2 Stars', value: breakdown[2], color: '#F97316' },
      { name: '1 Star', value: breakdown[1], color: '#EF4444' },
    ].filter(item => item.value > 0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Event Metrics</h3>
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
      ) : !metrics ? (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Metrics Available</h3>
          <p className="text-gray-500 dark:text-dark-400">No metrics data found for the selected period.</p>
        </div>
      ) : (
        <>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.viewers.total.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Total viewers</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Replay Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.viewers.replay.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Replay viewers</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Peak Viewers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                {metrics.viewers.peak ? metrics.viewers.peak.toLocaleString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Maximum concurrent</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Chat Messages</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{metrics.chat.count.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Total messages</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
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
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(metrics.earnings.totalRevenue, selectedCurrency)}
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
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Transactions</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.earnings.totalTransactions.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-dark-400">Completed purchases</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Average Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {metrics.ratings[0]?.avg || 0}/5
                </p>
                <div className="flex items-center space-x-1">
                  {renderStars(metrics.ratings[0]?.avg || 0)}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                {metrics.ratings[0]?.count || 0} rating{(metrics.ratings[0]?.count || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue Over Time</h3>
          <div className="h-64">
            {getRevenueChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getRevenueChartData()}>
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
                    formatter={(value: number) => [formatCurrency(value, selectedCurrency), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1AAA65" fill="#1AAA65" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-dark-400">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Breakdown */}
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

      {/* Detailed Metrics */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-6">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rating Breakdown */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-dark-100 mb-4">Rating Breakdown</h4>
            <div className="space-y-3">
              {metrics.ratings[0]?.breakdown ? (
                Object.entries(metrics.ratings[0].breakdown)
                  .reverse()
                  .map(([rating, count]) => (
                    <div key={rating} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(parseInt(rating))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-dark-300">{rating} Star{rating !== '1' ? 's' : ''}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{count}</span>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-dark-400">No ratings available</p>
              )}
            </div>
          </div>

          {/* Viewer Statistics */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-dark-100 mb-4">Viewer Statistics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Total Views</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{metrics.viewers.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Replay Views</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{metrics.viewers.replay.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Peak Viewers</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                  {metrics.viewers.peak ? metrics.viewers.peak.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Chat Messages</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{metrics.chat.count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Revenue Statistics */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue Statistics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Total Revenue</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(metrics.earnings.totalRevenue, selectedCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Total Transactions</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{metrics.earnings.totalTransactions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Avg Transaction</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">
                  {metrics.earnings.totalTransactions > 0 
                    ? formatCurrency(metrics.earnings.totalRevenue / metrics.earnings.totalTransactions, selectedCurrency)
                    : formatCurrency(0, selectedCurrency)
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-300">Feedback Count</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-100">{metrics.feedback.length.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {metrics.feedback.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Recent Feedback</h3>
          <div className="space-y-3">
            {metrics.feedback.slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                      {feedback.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
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
              Generated {formatCurrency(metrics.earnings.totalRevenue, selectedCurrency)} from {metrics.earnings.totalTransactions} transaction{metrics.earnings.totalTransactions !== 1 ? 's' : ''} this month.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Viewer Engagement</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Attracted {metrics.viewers.total.toLocaleString()} total viewers with {metrics.viewers.replay.toLocaleString()} replay views.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Audience Satisfaction</h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {metrics.ratings[0]?.count > 0 
                ? `Average rating of ${metrics.ratings[0].avg}/5 from ${metrics.ratings[0].count} review${metrics.ratings[0].count !== 1 ? 's' : ''}.`
                : 'No ratings received yet.'
              }
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};