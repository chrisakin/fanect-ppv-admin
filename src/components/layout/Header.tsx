import React from 'react';
import { Bell, Search, User, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-dark-950 shadow-sm border-b border-gray-200 dark:border-dark-800 transition-colors duration-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-dark-300" />
          </button>
          
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-400" />
            <input
              type="text"
              placeholder="Search events, users, or transactions..."
              className="pl-10 pr-4 py-2 w-64 lg:w-96 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200">
            <Search className="w-5 h-5 text-gray-600 dark:text-dark-300" />
          </button>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-primary-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 dark:text-dark-300 cursor-pointer hover:text-gray-900 dark:hover:text-dark-100 transition-colors duration-200" />
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              {user?.name ? (
                <span className="text-white text-sm font-bold">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100">{user?.firstName + ' ' + user?.lastName || 'Admin User'}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400">{user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;