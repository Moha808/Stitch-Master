import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { NAV_ITEMS } from '../../utils/constants';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Find page title from path
  const pageTitle = useMemo(() => {
    // Exact match
    const item = NAV_ITEMS.find((n) => n.path === location.pathname);
    if (item) return item.label;

    // Subpaths (e.g. /customers/:id)
    if (location.pathname.startsWith('/customers/')) {
      return 'Customer Details';
    }

    return 'StitchMaster';
  }, [location.pathname]);

  // Auto-close mobile sidebar whenever page location changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
          'flex flex-col flex-1 h-full min-w-0 overflow-hidden transition-all duration-300',
          // Offset for fixed sidebar strictly on desktop (lg: 1024px+)
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        ].join(' ')}
      >
        <TopNavbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          pageTitle={pageTitle}
        />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 bg-surface dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto animate-fade-in pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
