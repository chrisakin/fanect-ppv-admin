import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, DollarSign, Loader2, CreditCard, Gift, TrendingUp } from 'lucide-react';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { useAllTransactionStore } from '../../store/allTransactionStore';
import { CurrencyFilterDropdown } from '../../components/ui/currency-filter-dropdown';
import { ErrorAlert } from '../../components/ui/error-alert';

const PaymentsPage: React.FC = () => {
  const {
    transactions,
    stats,
    loading,
    statsLoading,
    error,
    currentPage,
    totalPages,
    totalDocs,
    limit,
    filters,
    setFilters,
    setCurrentPage,
    fetchAllTransactions,
    fetchTransactionStats,
    clearError
  } = useAllTransactionStore();

  // Load transactions and stats on component mount
  useEffect(() => {
    fetchAllTransactions(currentPage, filters.searchTerm);
    fetchTransactionStats();
  }, [currentPage, filters.status, filters.giftStatus, filters.paymentMethod, filters.startDate, filters.endDate, filters.currency]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchAllTransactions(1, filters.searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  // Refresh stats when currency filter changes
  useEffect(() => {
    fetchTransactionStats();
  }, [filters.currency, filters.startDate, filters.endDate]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      const dateRange = JSON.parse(value);
      setFilters({ 
        startDate: dateRange.startDate || '',
        endDate: dateRange.endDate || ''
      });
    } else {
      setFilters({ [key]: value });
    }
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'All',
      giftStatus: 'All',
      paymentMethod: 'All',
      searchTerm: '',
      startDate: '',
      endDate: '',
      currency: []
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle currency filter change
  const handleCurrencyFilterChange = (currencies: string[]) => {
    setFilters({ currency: currencies });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  // Convert filters to the format expected by TransactionTable  
  const transactionFilters = {
    status: filters.status,
    giftStatus: filters.giftStatus,
    paymentMethod: filters.paymentMethod,
    searchTerm: filters.searchTerm,
    startDate: filters.startDate,
    endDate: filters.endDate
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
        <div className="flex items-center space-x-3">
          <CurrencyFilterDropdown
            selectedCurrencies={filters.currency}
            onChange={handleCurrencyFilterChange}
            placeholder="Filter by currencies"
            className="w-64"
          />
        </div>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={clearError}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Revenue</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalAmount ? formatCurrency(stats.totalAmount, stats.currency || 'USD') : 'N.A'}
                </p>
              )}
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Total Transactions</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats ? stats.totalTransactions.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Successful Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Successful</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats ? stats.successful.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Pending</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats ? stats.pending.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Failed Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Failed</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats ? stats.failed.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Gift Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Gift Transactions</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {stats ? stats.giftTransactions.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-lg">
              <Gift className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        {/* Regular Transactions */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Regular Purchases</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats ? stats.nonGiftTransactions.toLocaleString() : '0'}
                </p>
              )}
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-dark-300">Payment Methods</p>
              {statsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-400">Loading...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Flutterwave:</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {stats ? stats.flutterwaveCount.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-dark-400">Stripe:</span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      {stats ? stats.stripeCount.toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table with Filters */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalDocs={totalDocs}
        limit={limit}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        showUserColumn={true}
        emptyMessage="No Transactions Found"
        emptyDescription="No transactions match your current filters."
        filters={transactionFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        showFilters={true}
      />
    </div>
  );
};

export default PaymentsPage;