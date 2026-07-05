import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { NAV_ITEMS } from '../../utils/constants';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Find page title from path
  const pageTitle = React.useMemo(() => {
    // Exact match
    const item = NAV_ITEMS.find((n) => n.path === location.pathname);
    if (item) return item.label;

    // Subpaths (e.g. /customers/:id)
    if (location.pathname.startsWith('/customers/')) {
      return 'Customer Details';
    }

    return 'StitchMaster';
  }, [location.pathname]);

  // Handle auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Sidebar - handles its own mobile overlays */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={[
          'flex flex-col flex-1 h-full overflow-hidden transition-all duration-300',
          // Offset for fixed sidebar on desktop
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        ].join(' ')}
      >
        <TopNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-surface dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
