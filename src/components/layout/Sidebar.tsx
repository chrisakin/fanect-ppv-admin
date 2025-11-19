import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Shield,
  CreditCard,
  BarChart3,
  Settings,
  HeadphonesIcon,
  LogOut,
} from 'lucide-react';

/**
 * Sidebar component
 *
 * Renders the left-hand navigation for the admin portal. This component
 * is a presentational, stateless component that relies on the app's
 * routing (react-router) for navigation links and the Auth context for
 * the `logout` action.
 *
 * Behavior notes:
 * - `navItems` defines the list of navigation entries (icon, label, path).
 * - Each entry is rendered as a `NavLink` so the active route receives
 *   an active style via the `isActive` prop.
 * - The logout button at the bottom calls `logout()` from `useAuth()`.
 */
const Sidebar: React.FC = () => {
  // Pull the `logout` function from the Auth context. This will typically
  // clear tokens and redirect the user to the login page (behavior is
  // implemented inside the context's `logout` function).
  const { logout } = useAuth();

  // Navigation configuration. Each object contains the icon component,
  // a label shown in the nav, and the route `path` to link to. This is
  // intentionally simple so items can be mapped into JSX below.
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Events', path: '/events' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: UserCheck, label: 'Organisers', path: '/organisers' },
    { icon: Shield, label: 'Admins', path: '/admins' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: HeadphonesIcon, label: 'Feedbacks', path: '/feedbacks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  /**
   * handleLogout
   *
   * Simple wrapper that awaits the Auth context's `logout` function. Any
   * navigation or side-effects after logout are handled within the
   * AuthContext implementation.
   */
  const handleLogout = async () => {
    await logout();
  };

  return (
    // Fixed sidebar container: occupies the full height of the viewport
    // and provides a left-aligned column for navigation.
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-dark-950 shadow-lg border-r border-gray-200 dark:border-dark-800 transition-colors duration-200">
      {/* Branding / logo area */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          {/* Optional logo/avatar placeholder (commented out). If you add
              a small brand icon, it can be placed in the div below.
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          */}
          <div>
            <h1 className="text-xl font-bold text-green-600">FaNect</h1>
            <p className="text-sm text-green-600">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation list: items are mapped from `navItems`. Using
          `NavLink` from react-router gives us an `isActive` flag we use to
          toggle active styles (background, text color, and a right border).
      */}
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-700 dark:border-primary-400'
                    : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100'
                }`
              }
            >
              {/* Icon component passed in via the `navItems` config. */}
              <item.icon className="w-5 h-5" />
              {/* Visible label for the route. */}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom area: logout button. Kept fixed to the bottom using absolute
          positioning so navigation stays scrollable above it when needed. */}
      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;