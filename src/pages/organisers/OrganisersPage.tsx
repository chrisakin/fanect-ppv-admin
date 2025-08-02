import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganiserStatus } from '../../services/organiserService';
import { useOrganiserStore } from '../../store/organiserStore';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { SuccessAlert } from '../../components/ui/success-alert';
import { UserTable } from '../../components/ui/user-table';

const OrganisersPage: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    organisers,
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
    fetchOrganisers,
    lockOrganiser,
    unlockOrganiser,
    clearError
  } = useOrganiserStore();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'lock' | 'unlock' | null;
    organiserId: string | null;
    organiserName: string | null;
  }>({
    isOpen: false,
    type: null,
    organiserId: null,
    organiserName: null
  });

  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    fetchOrganisers(currentPage, filters.searchTerm);
  }, [currentPage, filters.status, filters.locked, filters.startDate, filters.endDate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchOrganisers(1, filters.searchTerm);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  const openConfirmationModal = (type: 'lock' | 'unlock', organiserId: string, organiserName: string) => {
    setModalState({
      isOpen: true,
      type,
      organiserId,
      organiserName
    });
  };

  const closeConfirmationModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      organiserId: null,
      organiserName: null
    });
  };

  const handleOrganiserAction = async () => {
    if (!modalState.organiserId || !modalState.type) return;

    try {
      let result;
      
      if (modalState.type === 'lock') {
        result = await lockOrganiser(modalState.organiserId);
      } else {
        result = await unlockOrganiser(modalState.organiserId);
      }
      
      if (result.success) {
        // Show success alert
        setSuccessAlert({
          isOpen: true,
          message: result.message || `Organiser ${modalState.type}ed successfully!`
        });
      }
      
      // Close modal
      closeConfirmationModal();
      
    } catch (err: any) {
      console.error(`Error ${modalState.type}ing organiser:`, err);
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

  const getModalConfig = () => {
    const { type, organiserName } = modalState;
    
    if (type === 'lock') {
      return {
        title: 'Lock Organiser Account',
        message: `Are you sure you want to lock ${organiserName}'s account? They will not be able to access their account until it's unlocked.`,
        confirmText: 'Lock Account',
        confirmColor: 'bg-red-600 hover:bg-red-700'
      };
    } else {
      return {
        title: 'Unlock Organiser Account',
        message: `Are you sure you want to unlock ${organiserName}'s account? They will be able to access their account again.`,
        confirmText: 'Unlock Account',
        confirmColor: 'bg-green-600 hover:bg-green-700'
      };
    }
  };

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: OrganiserStatus.ACTIVE, label: 'Active' },
    { value: OrganiserStatus.INACTIVE, label: 'Inactive' }
  ];

  return (
    <>
      <UserTable
        users={organisers}
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
        onViewUser={(organiserId) => navigate(`/organisers/${organiserId}`)}
        onLockUser={openConfirmationModal.bind(null, 'lock')}
        onUnlockUser={openConfirmationModal.bind(null, 'unlock')}
        clearError={clearError}
        userType="organiser"
        statusOptions={statusOptions}
        searchPlaceholder="Search organisers by name, username, or email..."
        title="Organiser Management"
        showUsername={true}
        showEventsCreated={true}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleOrganiserAction}
        isLoading={actionLoading === modalState.organiserId}
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

export default OrganisersPage;