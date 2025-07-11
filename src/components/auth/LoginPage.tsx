import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Mail, Lock, Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

type LoginStep = 'credentials' | 'otp' | 'forgot-password' | 'reset-success';

interface FormData {
  email: string;
  password: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return undefined;
  };

  const validateOTP = (otp: string): string | undefined => {
    if (!otp) return 'OTP is required';
    if (otp.length !== 6) return 'OTP must be 6 digits';
    if (!/^\d+$/.test(otp)) return 'OTP must contain only numbers';
    return undefined;
  };

  const validateNewPassword = (password: string): string | undefined => {
    if (!password) return 'New password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, newPassword: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== newPassword) return 'Passwords do not match';
    return undefined;
  };

  // Timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (loginStep === 'credentials') {
        // Validate credentials
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        if (emailError || passwordError) {
          setErrors({
            email: emailError,
            password: passwordError
          });
          setIsLoading(false);
          return;
        }

        // Simulate API call for login
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if credentials are valid (simulate)
        if (formData.email === 'admin@fanect.com' && formData.password === 'password123') {
          setLoginStep('otp');
          setOtpTimer(60); // Start 60 second timer
        } else {
          setErrors({ general: 'Invalid email or password' });
        }
      } else if (loginStep === 'otp') {
        // Validate OTP
        const otpError = validateOTP(formData.otp);
        
        if (otpError) {
          setErrors({ otp: otpError });
          setIsLoading(false);
          return;
        }

        // Simulate OTP verification
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (formData.otp === '123456') {
          navigate('/');
        } else {
          setErrors({ otp: 'Invalid OTP. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate sending reset email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoginStep('otp');
      setOtpTimer(60);
    } catch (error) {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newPasswordError = validateNewPassword(formData.newPassword);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.newPassword);

    if (newPasswordError || confirmPasswordError) {
      setErrors({
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError
      });
      setIsLoading(false);
      return;
    }

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoginStep('reset-success');
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpTimer(60);
      setFormData(prev => ({ ...prev, otp: '' }));
      setErrors(prev => ({ ...prev, otp: undefined }));
    } catch (error) {
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCredentialsForm = () => (
    <form className="space-y-4 lg:space-y-6" onSubmit={handleLogin}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
          Admin Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
              errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
            }`}
            placeholder="admin@fanect.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
          Password
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
            placeholder="Enter your password"
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setLoginStep('forgot-password')}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200"
        >
          Forgot password?
        </button>
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
          'Continue'
        )}
      </button>
    </form>
  );

  const renderOTPForm = () => (
    <form className="space-y-4 lg:space-y-6" onSubmit={loginStep === 'forgot-password' ? handlePasswordReset : handleLogin}>
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
          One-Time Password
        </label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
          <input
            id="otp"
            type="text"
            required
            value={formData.otp}
            onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center tracking-widest bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
              errors.otp ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
            }`}
            placeholder="000000"
            maxLength={6}
          />
        </div>
        {errors.otp && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.otp}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-dark-400">
            Didn't receive the code?
          </span>
          <button 
            type="button" 
            onClick={handleResendOTP}
            disabled={otpTimer > 0 || isLoading}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      {loginStep === 'forgot-password' && (
        <>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
                  errors.newPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors duration-200"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.newPassword}
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
        </>
      )}

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
          loginStep === 'forgot-password' ? 'Reset Password' : 'Sign In'
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setLoginStep('credentials');
          setFormData(prev => ({ ...prev, otp: '', newPassword: '', confirmPassword: '' }));
          setErrors({});
        }}
        className="w-full text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 py-2 transition-colors duration-200"
      >
        Back to login
      </button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form className="space-y-4 lg:space-y-6" onSubmit={handleForgotPassword}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
          Admin Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-400" />
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200 ${
              errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-dark-700'
            }`}
            placeholder="admin@fanect.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email}
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
          'Send Reset Code'
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setLoginStep('credentials');
          setErrors({});
        }}
        className="w-full text-gray-600 dark:text-dark-300 hover:text-gray-800 dark:hover:text-dark-100 py-2 transition-colors duration-200 flex items-center justify-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </button>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100 mb-2">
          Password Reset Successful
        </h3>
        <p className="text-gray-600 dark:text-dark-300">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>
      <button
        onClick={() => {
          setLoginStep('credentials');
          setFormData({
            email: '',
            password: '',
            otp: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({});
        }}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Continue to Login
      </button>
    </div>
  );

  const getStepTitle = () => {
    switch (loginStep) {
      case 'credentials':
        return 'Welcome Back';
      case 'otp':
        return 'Verify Your Identity';
      case 'forgot-password':
        return 'Reset Password';
      case 'reset-success':
        return 'Success!';
      default:
        return 'Welcome Back';
    }
  };

  const getStepDescription = () => {
    switch (loginStep) {
      case 'credentials':
        return 'Sign in to your admin account';
      case 'otp':
        return 'Enter the OTP sent to your email';
      case 'forgot-password':
        return 'Enter your email to receive a reset code';
      case 'reset-success':
        return '';
      default:
        return 'Sign in to your admin account';
    }
  };

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
            {getStepTitle()}
          </h2>
          {getStepDescription() && (
            <p className="text-gray-600 dark:text-dark-300 mt-2 text-sm lg:text-base">
              {getStepDescription()}
            </p>
          )}
        </div>

        {loginStep === 'credentials' && renderCredentialsForm()}
        {loginStep === 'otp' && renderOTPForm()}
        {loginStep === 'forgot-password' && renderForgotPasswordForm()}
        {loginStep === 'reset-success' && renderSuccessMessage()}
      </div>
    </div>
  );
};

export default LoginPage;