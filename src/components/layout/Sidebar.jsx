import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiScissors,
  HiHome,
  HiUsers,
  HiClipboardDocumentList,
  HiShoppingBag,
  HiCreditCard,
  HiChartBar,
  HiCog6Tooth,
  HiArrowLeftOnRectangle,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiXMark,
} from 'react-icons/hi2';
import { AuthContext } from '../../contexts/AuthContext';
import { NAV_ITEMS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';

const iconMap = {
  Dashboard: HiHome,
  Customers: HiUsers,
  Measurements: HiClipboardDocumentList,
  Orders: HiShoppingBag,
  Payments: HiCreditCard,
  Reports: HiChartBar,
  Settings: HiCog6Tooth,
};

const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { currentUser, logout } = useContext(AuthContext);

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return item.roles.includes(currentUser?.role);
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={[
          'fixed top-0 left-0 h-full bg-white dark:bg-sidebar border-r border-slate-200 dark:border-slate-800/80 z-50',
          'flex flex-col shadow-2xl lg:shadow-sidebar transition-all duration-300 ease-in-out',
          // Mobile: slide in/out
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible at 0
          'lg:translate-x-0',
          // Width: on mobile always 72 (288px) or 64 (256px), on desktop depends on collapsed
          collapsed ? 'lg:w-20' : 'lg:w-64',
          'w-72 sm:w-64',
        ].join(' ')}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <HiScissors className="w-5 h-5 text-white" />
            </div>
            {/* Show brand name on mobile always, on desktop only if not collapsed */}
            <div className={`flex flex-col min-w-0 ${collapsed ? 'lg:hidden' : 'flex'}`}>
              <span className="text-base font-heading font-bold text-accent-500 dark:text-accent-400 tracking-wide truncate">
                StitchMaster
              </span>
              <span className="text-[10px] text-slate-400 dark:text-sidebar-text tracking-widest uppercase font-semibold">
                Tailoring OS
              </span>
            </div>
          </div>

          {/* Mobile close button (X) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-sidebar-text hover:bg-slate-100 dark:hover:bg-sidebar-hover hover:text-slate-800 dark:hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          {filteredNavItems.map((item) => {
            const Icon = iconMap[item.label] || HiHome;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'lg:justify-center lg:px-0' : '',
                    isActive
                      ? 'bg-primary-500/10 dark:bg-primary-600/15 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-sidebar-text hover:bg-slate-100 dark:hover:bg-sidebar-hover hover:text-slate-900 dark:hover:text-sidebar-text-active border-l-4 border-transparent',
                  ].join(' ')
                }
              >
                <Icon className="flex-shrink-0 w-5 h-5 transition-colors" />
                <span className={`truncate ${collapsed ? 'lg:hidden' : 'inline'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop Collapse toggle button */}
        <div className="hidden lg:flex px-3 pb-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-sidebar-text hover:bg-slate-100 dark:hover:bg-sidebar-hover hover:text-slate-900 dark:hover:text-sidebar-text-active transition-colors text-xs font-semibold"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <HiChevronDoubleRight className="w-4 h-4" />
            ) : (
              <>
                <HiChevronDoubleLeft className="w-4 h-4" />
                <span>Collapse Bar</span>
              </>
            )}
          </button>
        </div>

        {/* User Profile & Logout Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 flex-shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {getInitials(currentUser?.name || 'U')}
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : 'block'}`}>
              <p className="text-sm font-bold text-slate-800 dark:text-sidebar-text-active truncate">
                {currentUser?.name || 'User'}
              </p>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary-500/15 text-primary-600 dark:text-primary-400 mt-0.5">
                {currentUser?.role || 'user'}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={[
              'mt-3 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold',
              'text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors',
              collapsed ? 'lg:justify-center' : '',
            ].join(' ')}
          >
            <HiArrowLeftOnRectangle className="w-4 h-4 flex-shrink-0" />
            <span className={collapsed ? 'lg:hidden' : 'inline'}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
