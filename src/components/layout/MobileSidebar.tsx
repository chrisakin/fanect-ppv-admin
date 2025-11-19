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
  X
} from 'lucide-react';

/**
 * Props for the mobile sidebar component
 * - `isOpen`: whether the sidebar overlay/drawer is visible
 * - `onClose`: callback to close the sidebar (also invoked on navigation)
 */
interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MobileSidebar
 * - Renders a slide-in drawer navigation for small screens.
 * - When `isOpen` it shows an overlay and the sidebar; closing the
 *   overlay or clicking a nav link will call `onClose`.
 */
const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  // Auth helper used for logging out the current user
  const { logout } = useAuth();
  
  // navItems: an array of navigation entries rendered inside the sidebar
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Events', path: '/events' },
     { icon: Users, label: 'Users', path: '/users' },
     { icon: UserCheck, label: 'Organizers', path: '/organisers' },
     { icon: Shield, label: 'Admins', path: '/admins' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: HeadphonesIcon, label: 'Feedbacks', path: '/feedbacks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // handleLogout: wrapper to call auth logout then close the sidebar
  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      {/* Overlay: dark semi-transparent layer behind the drawer. Clicking it closes the drawer. */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Drawer: slides in from the left using CSS transform. Hidden on large screens. */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white dark:bg-dark-950 shadow-lg border-r border-gray-200 dark:border-dark-800 
        transition-transform duration-300 z-50 lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header: brand and close button */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            {/* Optional brand icon could go here */}
            <div>
              <h1 className="text-xl font-bold text-green-600">FaNect</h1>
              <p className="text-sm text-green-600">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-dark-300" />
          </button>
        </div>
        
        {/* Navigation links: maps `navItems` to <NavLink> entries. Each link closes the drawer when clicked. */}
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border-r-2 border-primary-700 dark:border-primary-400'
                      : 'text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-dark-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Button: anchored to the bottom of the drawer */}
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
    </>
  );
};

export default MobileSidebar;