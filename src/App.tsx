import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/dashboard/Dashboard';
import EventsPage from './pages/events/EventsPage';
import SingleEventPage from './pages/events/SingleEventPage';
import CreateEventPage from './pages/events/CreateEventPage';
import UsersPage from './pages/users/UsersPage';
import SingleUserPage from './pages/users/SingleUserPage';
import OrganisersPage from './pages/organisers/OrganisersPage';
import SingleOrganiserPage from './pages/organisers/SingleOrganiserPage';
import AdminsPage from './pages/admins/AdminsPage';
import SingleAdminPage from './pages/admins/SingleAdminPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import SupportPage from './pages/support/SupportPage';
import SettingsPage from './pages/settings/SettingsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

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
              <Route path="/events/create" element={<CreateEventPage />} />
              <Route path="/events/edit/:id" element={<CreateEventPage />} />
              <Route path="/events/:id" element={<SingleEventPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<SingleUserPage />} />
              <Route path="/organisers/:id" element={<SingleOrganiserPage />} />
              <Route path="/admins" element={<AdminsPage />} />
              <Route path="/admins/:id" element={<SingleAdminPage />} />
              <Route path="/organisers" element={<OrganisersPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/feedbacks" element={<SupportPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;