import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStatus } from '../../services/adminService';
import { useAdminStore } from '../../store/adminStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { CreateAdminModal } from '../../components/ui/create-admin-modal';
import { UserTable } from '../../components/ui/user-table';

/**
 * AdminsPage
 *
 * Page component that displays and manages admin users. It composes
 * the `UserTable` UI component and provides callbacks for pagination,
 * filtering, sorting and admin actions (lock/unlock). It also shows
 * a create-admin modal and success/error messaging.
 */
const AdminsPage: React.FC = () => {
  const navigate = useNavigate();

  // Local UI state -------------------------------------------------------
  // Controls visibility of the "Create Admin" modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Pull state and actions from the admin store (Zustand/whatever store)
  // The store provides admins list, pagination data, filters and action
  // helpers such as `fetchAdmins`, `lockAdmin` and `unlockAdmin`.
  const {
    admins,
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
    fetchAdmins,
    lockAdmin,
    unlockAdmin,
    clearError
  } = useAdminStore();

  // Sorting state (column and direction)
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Confirmation modal state used for lock/unlock admin actions.
  // `type` indicates the intended action and `adminId/adminName` identify the target.
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | null;
    adminId: string | null;
    adminName: string | null;
  }>({
    isOpen: false,
    type: null,
    adminId: null,
    adminName: null
  });

  // Success alert shown after successful admin operations
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch admins when pagination, filters or sorting change.
  useEffect(() => {
    fetchAdmins(currentPage, filters.searchTerm, sortBy, sortOrder);
  }, [currentPage, filters.status, filters.locked, filters.startDate, filters.endDate, sortBy, sortOrder]);

  // Debounced refresh behavior for search and sorting changes. Resets to
  // page 1 when a new search or sort is performed to keep UX predictable.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchAdmins(1, filters.searchTerm, sortBy, sortOrder);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, sortBy, sortOrder]);

  // Open the confirmation modal for lock/unlock operations
  const openConfirmationModal = (type: 'lock' | 'unlock', adminId: string, adminName: string) => {
    setModalState({
      isOpen: true,
      type,
      adminId,
      adminName
    });
  };

  // Close the confirmation modal and clear its state
  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      adminId: null,
      adminName: null
    });
  };

  /**
   * handleAdminAction
   *
   * Performs the lock/unlock action for the selected admin using the
   * store-provided methods. Shows a success alert on success and always
   * closes the confirmation modal. Errors are logged and the modal is closed.
   */
  const handleAdminAction = async () => {
    if (!modalState.adminId || !modalState.type) return;

    try {
      let result;
      
      if (modalState.type === 'lock') {
        result = await lockAdmin(modalState.adminId);
      } else {
        result = await unlockAdmin(modalState.adminId);
      }
      
      if (result.success) {
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `Admin ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      console.error(`Error ${modalState.type}ing admin:`, err);
      closeConfirmationModal();
    }
  };

  // Pagination helpers used by the `UserTable` component
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

  /**
   * handleFilterChange
   *
   * Normalizes filter updates coming from the `UserTable` filter UI. Special
   * handling is needed for date ranges (serialized as JSON by the filter
   * component). After updating filters we reset pagination back to page 1.
   */
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

  // Clear all filter values and reset pagination to page 1
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

  // Handle sorting change from the table headers; reset to page 1
  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Return modal configuration based on current modal state (lock vs unlock)
  const getModalConfig = () => {
    const { type, adminName } = modalState;
    
    if (type === 'lock') {
      return {
        title: 'Lock Admin Account',
        message: `Are you sure you want to lock ${adminName}'s account? They will not be able to access their account until it's unlocked.`,
        confirmText: 'Lock Account',
        confirmColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'Unlock Admin Account',
        message: `Are you sure you want to unlock ${adminName}'s account? They will be able to access their account again.`,
        confirmText: 'Unlock Account',
        confirmColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: AdminStatus.ACTIVE, label: 'Active' },
    { value: AdminStatus.INACTIVE, label: 'Inactive' }
  ];

  return (
    <>
      <UserTable
        users={admins}
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
        onViewUser={(adminId) => navigate(`/admins/${adminId}`)}
        onLockUser={openConfirmationModal.bind(null, 'lock')}
        onUnlockUser={openConfirmationModal.bind(null, 'unlock')}
        clearError={clearError}
        userType="admin"
        statusOptions={statusOptions}
        searchPlaceholder="Search admins by name or email..."
        title="Admin Management"
        showRole={true}
        showCreateButton={true}
        onCreateUser={() => setIsCreateModalOpen(true)}
        createButtonText="Create Admin"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleAdminAction}
        isLoading={actionLoading === modalState.adminId}
        {...getModalConfig()}
      />

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(message) => {
          setSuccessAlert({ isOpen: true, message });
          // Refresh admins list
          fetchAdmins(currentPage, filters.searchTerm);
        }}
      />
    </>
  );
};

export default AdminsPage;