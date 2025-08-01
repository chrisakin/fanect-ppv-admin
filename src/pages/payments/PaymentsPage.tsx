import React, { useState } from 'react';
import { Search, Filter, RefreshCw, AlertTriangle, Calendar, DollarSign, Gift } from 'lucide-react';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { FilterBar } from '../../components/ui/filter-bar';
import { CustomDateRangePicker } from '../../components/ui/custom-date-range-picker';
import { UserTransaction, TransactionStatus, PaymentMethod } from '../../types/transaction';

const PaymentsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    giftStatus: 'All',
    paymentMethod: 'All',
    searchTerm: '',
    dateRange: { startDate: null as string | null, endDate: null as string | null }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading] = useState(false);

  // Mock data - replace with actual API call
  const transactions: UserTransaction[] = [
    {
      _id: 'txn_001',
      user: 'user_001',
      eventName: 'Tech Conference 2024',
      eventDate: '2024-01-15',
      eventTime: '10:30',
      eventStatus: 'Live',
      eventAdminStatus: 'Approved',
      eventId: 'event_001',
      amount: 49.99,
      currency: 'USD',
      paymentMethod: PaymentMethod.STRIPE,
      paymentReference: 'ref_001',
      status: TransactionStatus.SUCCESSFUL,
      isGift: false,
      createdAt: '2024-01-15T10:30:00',
      __v: 0
    },
    {
      _id: 'txn_002',
      user: 'user_002',
      eventName: 'Music Festival Live',
      eventDate: '2024-01-14',
      eventTime: '16:45',
      eventStatus: 'Upcoming',
      eventAdminStatus: 'Approved',
      eventId: 'event_002',
      amount: 29.99,
      currency: 'USD',
      paymentMethod: PaymentMethod.FLUTTERWAVE,
      paymentReference: 'ref_002',
      status: TransactionStatus.PENDING,
      isGift: false,
      createdAt: '2024-01-14T16:45:00',
      __v: 0
    },
    {
      _id: 'txn_003',
      user: 'user_003',
      eventName: 'Startup Pitch Night',
      eventDate: '2024-01-13',
      eventTime: '08:15',
      eventStatus: 'Past',
      eventAdminStatus: 'Approved',
      eventId: 'event_003',
      amount: 19.99,
      currency: 'USD',
      paymentMethod: PaymentMethod.STRIPE,
      paymentReference: 'ref_003',
      status: TransactionStatus.FAILED,
      isGift: true,
      createdAt: '2024-01-13T08:15:00',
      __v: 0
    },
    {
      _id: 'txn_004',
      user: 'user_004',
      eventName: 'Tech Conference 2024',
      eventDate: '2024-01-12',
      eventTime: '14:20',
      eventStatus: 'Live',
      eventAdminStatus: 'Approved',
      eventId: 'event_001',
      amount: 99.99,
      currency: 'USD',
      paymentMethod: PaymentMethod.FLUTTERWAVE,
      paymentReference: 'ref_004',
      status: TransactionStatus.SUCCESSFUL,
      isGift: false,
      createdAt: '2024-01-12T14:20:00',
      __v: 0
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.eventName.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || transaction.status === filters.status;
    const matchesGiftStatus = filters.giftStatus === 'All' || 
      (filters.giftStatus === 'gift' && transaction.isGift) ||
      (filters.giftStatus === 'not-gift' && !transaction.isGift);
    const matchesPaymentMethod = filters.paymentMethod === 'All' || transaction.paymentMethod === filters.paymentMethod;
    
    let matchesDateRange = true;
    if (filters.dateRange.startDate || filters.dateRange.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      if (filters.dateRange.startDate) {
        matchesDateRange = matchesDateRange && transactionDate >= new Date(filters.dateRange.startDate);
      }
      if (filters.dateRange.endDate) {
        matchesDateRange = matchesDateRange && transactionDate <= new Date(filters.dateRange.endDate);
      }
    }
    
    return matchesSearch && matchesStatus && matchesGiftStatus && matchesPaymentMethod && matchesDateRange;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.status === TransactionStatus.SUCCESSFUL)
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = filteredTransactions
    .filter(t => t.status === TransactionStatus.PENDING)
    .reduce((sum, t) => sum + t.amount, 0);

  const failedAmount = filteredTransactions
    .filter(t => t.status === TransactionStatus.FAILED)
    .reduce((sum, t) => sum + t.amount, 0);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'dateRange') {
      setFilters(prev => ({ ...prev, dateRange: JSON.parse(value) }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
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
      dateRange: { startDate: null, endDate: null }
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
    // Mock total pages - replace with actual pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / 10);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Filter configuration
  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      value: filters.status,
      icon: Filter,
      options: [
        { value: 'All', label: 'All Status' },
        { value: TransactionStatus.SUCCESSFUL, label: 'Successful' },
        { value: TransactionStatus.PENDING, label: 'Pending' },
        { value: TransactionStatus.FAILED, label: 'Failed' }
      ]
    },
    {
      key: 'giftStatus',
      label: 'Gift Status',
      value: filters.giftStatus,
      icon: Gift,
      options: [
        { value: 'All', label: 'All Types' },
        { value: 'gift', label: 'Gift' },
        { value: 'not-gift', label: 'Not Gift' }
      ]
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      value: filters.paymentMethod,
      options: [
        { value: 'All', label: 'All Methods' },
        { value: PaymentMethod.FLUTTERWAVE, label: 'Flutterwave' },
        { value: PaymentMethod.STRIPE, label: 'Stripe' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      value: JSON.stringify(filters.dateRange),
      type: 'custom' as const,
      icon: Calendar,
      component: (
        <CustomDateRangePicker
          value={filters.dateRange}
          onChange={(dateRange) => 
            handleFilterChange('dateRange', JSON.stringify(dateRange))
          }
          placeholder="Select date range"
          className="h-10"
          showSearchButton={true}
          onSearch={(dateRange) => 
            handleFilterChange('dateRange', JSON.stringify(dateRange))
          }
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payments & Transactions</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Export Transactions
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">${failedAmount.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        searchValue={filters.searchTerm}
        onSearchChange={(value) => handleFilterChange('searchTerm', value)}
        searchPlaceholder="Search transactions..."
      />

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <TransactionTable
          transactions={filteredTransactions}
          loading={loading}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredTransactions.length / 10)}
          totalDocs={filteredTransactions.length}
          limit={10}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          showUserColumn={true}
          emptyMessage="No Transactions Found"
          emptyDescription="No transactions match your current filters."
        />
      </div>
    </div>
  );
};

export default PaymentsPage;