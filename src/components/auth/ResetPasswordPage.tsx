import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'New password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (password.length > 128) return 'Password is too long (max 128 characters)';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    if (passwordError || confirmPasswordError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmPasswordError
      });
      setIsLoading(false);
      return;
    }

    if (!token) {
      setErrors({ general: 'Invalid reset token. Please request a new password reset.' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, formData.password);
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setErrors({ general: result.message || 'Failed to reset password. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 flex items-center justify-center transition-colors duration-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 lg:space-y-8 p-6 lg:p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">FaNect</h1>
                <p className="text-sm text-gray-500 dark:text-dark-400">Admin Portal</p>
              </div>
            </div>
            
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100 mb-2">
                Password Reset Successful
              </h2>
              <p className="text-gray-600 dark:text-dark-300">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 flex items-center justify-center transition-colors duration-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 lg:space-y-8 p-6 lg:p-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-100">FaNect</h1>
              <p className="text-sm text-gray-500 dark:text-dark-400">Admin Portal</p>
            </div>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-dark-100">
            Reset Your Password
          </h2>
          <p className="text-gray-600 dark:text-dark-300 mt-2 text-sm lg:text-base">
            Enter your new password below
          </p>
        </div>

        <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                  errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                  errors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.general}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 py-2 transition-colors duration-200"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;