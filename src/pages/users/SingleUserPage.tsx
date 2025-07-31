import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, User, Activity, CreditCard, Calendar, Mail, Filter, Search, Gift } from 'lucide-react';
import { userService, ApiUser } from '../../services/userService';
import { useUserStore } from '../../store/userStore';
import { useTransactionStore } from '../../store/transactionStore';
import { TransactionStatus, PaymentMethod } from '../../types/transaction';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Pagination } from '../../components/ui/pagination';
import { FilterBar } from '../../components/ui/filter-bar';

const SingleUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'events' | 'activities'>('overview');
  
  // Store actions
  const { actionLoading, lockUser, unlockUser } = useUserStore();
  
  // Transaction store
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    currentPage: transactionsCurrentPage,
    totalPages: transactionsTotalPages,
    totalDocs: transactionsTotalDocs,
    limit: transactionsLimit,
    filters: transactionFilters,
    setFilters: setTransactionFilters,
    setCurrentPage: setTransactionCurrentPage,
    fetchUserTransactions,
    clearError: clearTransactionError,
    resetStore: resetTransactionStore
  } = useTransactionStore();
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | null;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null
  });
  
  // Success alert state
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch single user
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await userService.getSingleUser(id);
        setUser(response.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch user details');
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Reset transaction store when component mounts or user changes
    resetTransactionStore();
  }, [id]);

  // Fetch transactions when transactions tab is active
  useEffect(() => {
    if (activeTab === 'transactions' && id) {
      fetchUserTransactions(id, transactionsCurrentPage, transactionFilters.searchTerm);
    }
  }, [activeTab, id, transactionsCurrentPage, transactionFilters.status, transactionFilters.giftStatus, transactionFilters.paymentMethod]);

  // Handle transaction search with debounce
  useEffect(() => {
    if (activeTab === 'transactions' && id) {
      const timeoutId = setTimeout(() => {
        if (transactionsCurrentPage === 1) {
          fetchUserTransactions(id, 1, transactionFilters.searchTerm);
        } else {
          setTransactionCurrentPage(1);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [transactionFilters.searchTerm]);

  // Open confirmation modal
  const openConfirmationModal = (type: 'lock' | 'unlock', userId: string, userName: string) => {
    setModalState({
      isOpen: true,
      type,
      userId,
      userName
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      userId: null,
      userName: null
    });
  };

  // Handle user lock/unlock with confirmation
  const handleUserAction = async () => {
    if (!modalState.userId || !modalState.type) return;

    try {
      let result;
      
      if (modalState.type === 'lock') {
        result = await lockUser(modalState.userId);
      } else {
        result = await unlockUser(modalState.userId);
      }
      
      if (result.success) {
        // Refresh user data
        if (id) {
          const updatedUser = await userService.getSingleUser(id);
          setUser(updatedUser.user);
        }
        
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `User ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalState.type} user`);
      console.error(`Error ${modalState.type}ing user:`, err);
      closeConfirmationModal();
    }
  };

  // Transaction pagination handlers
  const handleTransactionPreviousPage = () => {
    if (transactionsCurrentPage > 1) {
      setTransactionCurrentPage(transactionsCurrentPage - 1);
    }
  };

  const handleTransactionNextPage = () => {
    if (transactionsCurrentPage < transactionsTotalPages) {
      setTransactionCurrentPage(transactionsCurrentPage + 1);
    }
  };

  // Handle transaction filter changes
  const handleTransactionFilterChange = (key: string, value: string) => {
    setTransactionFilters({ [key]: value });
    if (transactionsCurrentPage !== 1) {
      setTransactionCurrentPage(1);
    }
  };

  // Clear transaction filters
  const clearTransactionFilters = () => {
    setTransactionFilters({
      status: 'All',
      giftStatus: 'All',
      paymentMethod: 'All',
      searchTerm: ''
    });
    if (transactionsCurrentPage !== 1) {
      setTransactionCurrentPage(1);
    }
  };

  const getTransactionStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESSFUL:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  // Get modal configuration based on action type
  const getModalConfig = () => {
    const { type, userName } = modalState;
    
    if (type === 'lock') {
      return {
        title: 'Lock User Account',
        message: `Are you sure you want to lock ${userName}'s account? They will not be able to access their account until it's unlocked.`,
        confirmText: 'Lock Account',
        confirmColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'Unlock User Account',
        message: `Are you sure you want to unlock ${userName}'s account? They will be able to access their account again.`,
        confirmText: 'Unlock Account',
        confirmColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Users</span>
          </button>
        </div>
        <ErrorAlert
          isOpen={true}
          message={error || 'User not found'}
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Users</span>
        </button>
      </div>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 dark:text-dark-300">@{user.username}</p>
                <p className="text-gray-600 dark:text-dark-300">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {user.status}
                  </span>
                  {user.locked && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                      Locked
                    </span>
                  )}
                  {user.isVerified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openConfirmationModal(
                  user.locked ? 'unlock' : 'lock',
                  user._id,
                  `${user.firstName} ${user.lastName}`
                )}
                disabled={actionLoading === user._id}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  user.locked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionLoading === user._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  user.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />
                )}
                <span>{actionLoading === user._id ? 'Processing...' : (user.locked ? 'Unlock' : 'Lock')} Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex space-x-8 px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'transactions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>User Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>User Events</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'activities'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>User Activities</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Email</p>
                        <p className="text-gray-900 dark:text-dark-100">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Member Since</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-500 dark:text-dark-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-dark-300">Last Login</p>
                        <p className="text-gray-900 dark:text-dark-100">{new Date(user.lastLogin).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Activity Summary</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-dark-300">Events Joined</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{user.eventsJoinedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Status</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Current account status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Email Verification</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Email verification status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-100">Account Lock</p>
                        <p className="text-xs text-gray-500 dark:text-dark-400">Account lock status</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.locked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {user.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Error Message */}
              <ErrorAlert
                isOpen={!!transactionsError}
                message={transactionsError || ''}
                onClose={clearTransactionError}
              />

              {/* Transaction Filters */}
              <FilterBar
                filters={[
                  {
                    key: 'status',
                    label: 'Status',
                    value: transactionFilters.status,
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
                    value: transactionFilters.giftStatus,
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
                    value: transactionFilters.paymentMethod,
                    icon: CreditCard,
                    options: [
                      { value: 'All', label: 'All Methods' },
                      { value: PaymentMethod.FLUTTERWAVE, label: 'Flutterwave' },
                      { value: PaymentMethod.STRIPE, label: 'Stripe' }
                    ]
                  }
                ]}
                onFilterChange={handleTransactionFilterChange}
                onClearFilters={clearTransactionFilters}
                searchValue={transactionFilters.searchTerm}
                onSearchChange={(value) => handleTransactionFilterChange('searchTerm', value)}
                searchPlaceholder="Search by event name, payment reference..."
              />

              {/* Transactions Table */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
                {transactionsLoading ? (
                  <LoadingSpinner />
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">No Transactions Found</h3>
                    <p className="text-gray-500 dark:text-dark-400">This user hasn't made any transactions yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-dark-700">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Payment Method
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                          {transactions.map((transaction) => (
                            <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200">
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-dark-100">
                                    {transaction.eventName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-dark-400">
                                    {new Date(transaction.eventDate).toLocaleDateString()} at {transaction.eventTime}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-100">
                                {formatCurrency(transaction.amount, transaction.currency)}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    transaction.paymentMethod === PaymentMethod.STRIPE ? 'bg-purple-500' : 'bg-blue-500'
                                  }`}></div>
                                  <span className="text-sm text-gray-900 dark:text-dark-100 capitalize">
                                    {transaction.paymentMethod}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  transaction.isGift 
                                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                }`}>
                                  {transaction.isGift ? 'Gift' : 'Purchase'}
                                </span>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-100">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </td>
                              
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={transactionsCurrentPage}
                      totalPages={transactionsTotalPages}
                      totalDocs={transactionsTotalDocs}
                      limit={transactionsLimit}
                      onPreviousPage={handleTransactionPreviousPage}
                      onNextPage={handleTransactionNextPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">User Events</h3>
              <p className="text-gray-500 dark:text-dark-400">Events joined by this user will be displayed here.</p>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100 mb-2">User Activities</h3>
              <p className="text-gray-500 dark:text-dark-400">User activity logs will be displayed here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleUserAction}
        isLoading={actionLoading === modalState.userId}
        {...getModalConfig()}
      />

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default SingleUserPage;