import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStatus } from '../../services/userService';
import { useUserStore } from '../../store/userStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { UserTable } from '../../components/ui/user-table';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Store state
  const {
    users,
    loading,
    error,
    actionLoading,
    currentPage,
    totalPages,
    totalDocs,
    limit,
    filters,
    setFilters,
    setCurrentPage,
    fetchUsers,
    lockUser,
    unlockUser,
    clearError
  } = useUserStore();

  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    fetchUsers(currentPage, filters.searchTerm, sortBy, sortOrder);
  }, [currentPage, filters.status, filters.locked, filters.startDate, filters.endDate, sortBy, sortOrder]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers(1, filters.searchTerm, sortBy, sortOrder);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, sortBy, sortOrder]);

  const openConfirmationModal = (type: 'lock' | 'unlock', userId: string, userName: string) => {
    setModalState({
      isOpen: true,
      type,
      userId,
      userName
    });
  };

  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      userId: null,
      userName: null
    });
  };

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
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `User ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      console.error(`Error ${modalState.type}ing user:`, err);
      closeConfirmationModal();
    }
  };

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

  const clearFilters = () => {
    setFilters({
      status: 'All',
      locked: 'All',
      searchTerm: '',
      startDate: '',
      endDate: ''
    });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Handle sorting
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

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

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: UserStatus.ACTIVE, label: 'Active' },
    { value: UserStatus.INACTIVE, label: 'Inactive' }
  ];

  return (
    <>
      <UserTable
        users={users}
        loading={loading}
        error={error}
        actionLoading={actionLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalDocs={totalDocs}
        limit={limit}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onViewUser={(userId) => navigate(`/users/${userId}`)}
        onLockUser={openConfirmationModal.bind(null, 'lock')}
        onUnlockUser={openConfirmationModal.bind(null, 'unlock')}
        clearError={clearError}
        userType="user"
        statusOptions={statusOptions}
        searchPlaceholder="Search users by name, username, or email..."
        title="User Management"
        showUsername={true}
        showEventsJoined={true}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

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
    </>
  );
};

export default UsersPage;