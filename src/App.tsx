import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import EventsPage from './components/events/EventsPage';
import UsersPage from './components/users/UsersPage';
import PaymentsPage from './components/payments/PaymentsPage';
import SupportPage from './components/support/SupportPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route path="/login" element={<LoginPage />} />
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
    </ThemeProvider>
  );
}

export default App;