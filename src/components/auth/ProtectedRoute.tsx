import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props for `ProtectedRoute`.
 * - `children`: The React node(s) to render when access is allowed.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * `ProtectedRoute` guards routes that require authentication.
 * Behavior:
 * - While auth state is loading it renders a centered loading indicator.
 * - If the user is not authenticated it redirects to `/login` and
 *   provides the attempted location in `state.from` so the app can
 *   navigate back after successful login.
 * - If authenticated it simply renders `children`.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // `useAuth` derives authentication state from `AuthContext`.
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Loading state: show a full-screen centered spinner while the
  // authentication check completes (e.g., fetching current user).
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: redirect to login page and store return location.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated: render protected content.
  return <>{children}</>;
};

export default ProtectedRoute;