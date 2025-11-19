import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';

/**
 * AdminLayout
 * - Top-level layout used by all admin pages.
 * - Renders a persistent desktop `Sidebar` on large screens and a
 *   `MobileSidebar` for smaller screens.
 * - Renders `Header` and an `<Outlet />` where route children are injected.
 * - Bypasses layout for authentication pages (login/reset) so those
 *   routes render without the admin chrome.
 */
const AdminLayout: React.FC = () => {
  // Determine whether the current route is an auth-related page. If so,
  // we don't render the admin layout and simply render the route's outlet.
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname.startsWith('/reset/');

  // Local state used to toggle the mobile sidebar on small screens.
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If the user is on an auth page (login/reset) render the route directly
  // without the surrounding admin navigation chrome.
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-200">
      {/* Desktop Sidebar: hidden on small screens, visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar: controlled via `isMobileSidebarOpen`; passed callbacks */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      {/* Main Content: includes the Header (which toggles the mobile sidebar)
          and the routed page content rendered inside <Outlet/>. */}
      <div className="lg:ml-64">
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;