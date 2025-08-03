import React, { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, UpdateProfileData, ChangePasswordData, ProfileFormErrors } from '../../types/profile';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { SuccessAlert } from '../../components/ui/success-alert';
import { ErrorAlert } from '../../components/ui/error-alert';

const SettingsPage: React.FC = () => {
  const { setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  
  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    oldPassword: '',
    newPassword: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<ProfileFormErrors>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Success alerts
  const [successAlert, setSuccessAlert] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = (await profileService.getProfile());
        setProfile(response);
        setProfileData({
          firstName: response.firstName,
          lastName: response.lastName
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Validation functions
  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) return `${fieldName} is required`;
    if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (password.length > 128) return 'Password is too long (max 128 characters)';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    return undefined;
  };

  // Handle profile form changes
  const handleProfileInputChange = (field: keyof UpdateProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle password form changes
  const handlePasswordInputChange = (field: keyof ChangePasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileErrors({});

    // Validate form
    const firstNameError = validateName(profileData.firstName, 'First name');
    const lastNameError = validateName(profileData.lastName, 'Last name');

    if (firstNameError || lastNameError) {
      setProfileErrors({
        firstName: firstNameError,
        lastName: lastNameError
      });
      setProfileSubmitting(false);
      return;
    }

    try {
      (await profileService.updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim()
      }));

      const response = await profileService.getProfile()

       setProfile(response);
        setProfileData({
          firstName: response.firstName,
          lastName: response.lastName
        });

      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: 'Profile updated successfully!'
      });
    } catch (err: any) {
      console.log(err)
      setProfileErrors({ 
        general: err.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordErrors({});

    // Validate form
    const oldPasswordError = !passwordData.oldPassword ? 'Current password is required' : undefined;
    const newPasswordError = validatePassword(passwordData.newPassword);

    if (oldPasswordError || newPasswordError) {
      setPasswordErrors({
        oldPassword: oldPasswordError,
        newPassword: newPasswordError
      });
      setPasswordSubmitting(false);
      return;
    }

    try {
      const response = await profileService.changePassword(passwordData);

      // Clear form
      setPasswordData({
        oldPassword: '',
        newPassword: ''
      });

      // Show success alert
      setSuccessAlert({
        isOpen: true,
        message: response.message || 'Password changed successfully!'
      });
    } catch (err: any) {
      setPasswordErrors({ 
        general: err.response?.data?.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Settings</h1>
        <ErrorAlert
          isOpen={true}
          message={error || 'Failed to load profile'}
          onClose={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">Settings</h1>

      {/* Error Message */}
      <ErrorAlert
        isOpen={!!error}
        message={error || ''}
        onClose={() => setError(null)}
      />

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden transition-colors duration-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="flex space-x-8 px-4 lg:px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">Profile Information</h2>
                <p className="text-gray-600 dark:text-dark-300">Update your personal information.</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                        profileErrors.firstName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter your first name"
                      disabled={profileSubmitting}
                    />
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {profileErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                        profileErrors.lastName ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter your last name"
                      disabled={profileSubmitting}
                    />
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {profileErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-700 rounded-lg bg-gray-50 dark:bg-dark-700 text-gray-500 dark:text-dark-400 cursor-not-allowed"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">Email address cannot be changed.</p>
                </div>

                {profileErrors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {profileErrors.general}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {profileSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Update Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">Change Password</h2>
                <p className="text-gray-600 dark:text-dark-300">Update your password to keep your account secure.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => handlePasswordInputChange('oldPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                        passwordErrors.oldPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter your current password"
                      disabled={passwordSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                        passwordErrors.newPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                      }`}
                      placeholder="Enter your new password"
                      disabled={passwordSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {passwordErrors.newPassword}
                    </p>
                  )}
                  <div className="mt-2 text-sm text-gray-500 dark:text-dark-400">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                </div>

                {passwordErrors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {passwordErrors.general}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {passwordSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      <SuccessAlert
        isOpen={successAlert.isOpen}
        message={successAlert.message}
        onClose={() => setSuccessAlert({ isOpen: false, message: '' })}
      />
    </div>
  );
};

export default SettingsPage;