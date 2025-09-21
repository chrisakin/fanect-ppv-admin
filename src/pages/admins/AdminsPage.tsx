import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStatus } from '../../services/adminService';
import { useAdminStore } from '../../store/adminStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { CreateAdminModal } from '../../components/ui/create-admin-modal';
import { UserTable } from '../../components/ui/user-table';

const AdminsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
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

  // Sorting state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    fetchAdmins(currentPage, filters.searchTerm, sortBy, sortOrder);
  }, [currentPage, filters.status, filters.locked, filters.startDate, filters.endDate, sortBy, sortOrder]);

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

  const openConfirmationModal = (type: 'lock' | 'unlock', adminId: string, adminName: string) => {
    setModalState({
      isOpen: true,
      type,
      adminId,
      adminName
    });
  };

  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      adminId: null,
      adminName: null
    });
  };

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