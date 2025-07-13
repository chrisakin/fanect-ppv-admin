import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/dashboard/Dashboard';
import EventsPage from './pages/events/EventsPage';
import UsersPage from './pages/users/UsersPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import SupportPage from './pages/support/SupportPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset/:token" element={<ResetPasswordPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/organizers" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">Organizers - Coming Soon</h1></div>} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">Analytics - Coming Soon</h1></div>} />
              <Route path="/settings" element={<div className="p-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100">Settings - Coming Soon</h1></div>} />
              <Route path="/support" element={<SupportPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;