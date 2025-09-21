import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, BarChart3, RefreshCw } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';

interface RevenueData {
  currency: string;
  totalRevenue: number;
  totalStreampass: number;
}

interface RevenueReportTabProps {
  eventId: string;
}

export const RevenueReportTab: React.FC<RevenueReportTabProps> = ({ eventId }) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenue report when component mounts
  useEffect(() => {
    fetchRevenueReport();
  }, [eventId]);

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventRevenueReport(eventId);
      setRevenueData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue report');
      console.error('Error fetching revenue report:', err);
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

  // Calculate totals
  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  };

  const getTotalStreampass = () => {
    return revenueData.reduce((sum, item) => sum + item.totalStreampass, 0);
  };

  const getHighestRevenueCurrency = () => {
    if (revenueData.length === 0) return null;
    return revenueData.reduce((max, item) => 
      item.totalRevenue > max.totalRevenue ? item : max
    );
  };

  const getMostPopularCurrency = () => {
    if (revenueData.length === 0) return null;
    return revenueData.reduce((max, item) => 
      item.totalStreampass > max.totalStreampass ? item : max
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Revenue Report</h3>
        <button
          onClick={fetchRevenueReport}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      {loading ? (
        <LoadingSpinner />
      ) : revenueData.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Revenue Data</h3>
          <p className="text-gray-500 dark:text-dark-400">No revenue has been generated for this event yet.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Stream Passes</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getTotalStreampass()}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Across all currencies</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Currencies</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{revenueData.length}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-400">Different currencies</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Top Revenue Currency</p>
                  {getHighestRevenueCurrency() && (
                    <>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {getHighestRevenueCurrency()!.currency}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        {formatCurrency(getHighestRevenueCurrency()!.totalRevenue, getHighestRevenueCurrency()!.currency)}
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Most Popular Currency</p>
                  {getMostPopularCurrency() && (
                    <>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {getMostPopularCurrency()!.currency}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        {getMostPopularCurrency()!.totalStreampass} stream passes
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Revenue by Currency</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Stream Passes Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Average per Pass
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                      Revenue Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {revenueData
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map((item, index) => {
                      const averagePerPass = item.totalStreampass > 0 ? item.totalRevenue / item.totalStreampass : 0;
                      const totalRevenue = getTotalRevenue();
                      const revenueShare = totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0;
                      
                      return (
                        <tr key={item.currency} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                index === 0 ? 'bg-gold-100 text-gold-800' :
                                index === 1 ? 'bg-silver-100 text-silver-800' :
                                index === 2 ? 'bg-bronze-100 text-bronze-800' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                <span className="text-sm font-bold">#{index + 1}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                                  {item.currency}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-dark-400">
                                  Currency code
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(item.totalRevenue, item.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                              {item.totalStreampass.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-dark-100">
                              {formatCurrency(averagePerPass, item.currency)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${revenueShare}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-dark-100 min-w-[3rem]">
                                {revenueShare.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Revenue Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Revenue Performance</h5>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Generated revenue across {revenueData.length} different currenc{revenueData.length !== 1 ? 'ies' : 'y'} with {getTotalStreampass()} total stream passes sold.
                </p>
              </div>
              
              {getHighestRevenueCurrency() && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Top Revenue Currency</h5>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {getHighestRevenueCurrency()!.currency} generated the highest revenue with {formatCurrency(getHighestRevenueCurrency()!.totalRevenue, getHighestRevenueCurrency()!.currency)} from {getHighestRevenueCurrency()!.totalStreampass} stream passes.
                  </p>
                </div>
              )}

              {getMostPopularCurrency() && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Most Popular Currency</h5>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    {getMostPopularCurrency()!.currency} had the most stream pass sales with {getMostPopularCurrency()!.totalStreampass} purchases, generating {formatCurrency(getMostPopularCurrency()!.totalRevenue, getMostPopularCurrency()!.currency)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};