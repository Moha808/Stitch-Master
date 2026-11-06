import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiBars3,
  HiBell,
  HiMagnifyingGlass,
  HiArrowLeftOnRectangle,
  HiUser,
  HiCog6Tooth,
  HiSun,
  HiMoon,
} from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { getInitials, formatDate } from '../../utils/formatters';
import { useNotifications } from '../../contexts/NotificationContext';
import { useCustomers } from '../../contexts/CustomerContext';

const TopNavbar = ({ onMenuToggle, pageTitle }) => {
  const { currentUser, logout, isAdmin, isCustomer } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications();
  const { customers } = useCustomers();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const customerProfileId = useMemo(() => {
    if (currentUser?.role === 'customer') {
      const match = customers.find(
        (c) => c.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      return match ? match.customerId : null;
    }
    return null;
  }, [currentUser, customers]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm no-print transition-colors duration-200">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 text-gray-500 dark:text-slate-400 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <HiBars3 className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white font-heading capitalize transition-colors">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Notifications, Theme Toggle & User Menu */}
      <div className="flex items-center gap-4">
        {/* Search placeholder */}
        <div className="relative hidden sm:block">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            disabled
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <HiSun className="w-5.5 h-5.5 text-amber-500" />
          ) : (
            <HiMoon className="w-5.5 h-5.5" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 text-gray-400 dark:text-slate-400 rounded-lg hover:bg-gray-55 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
            aria-label="Toggle notifications"
          >
            <HiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse-soft"></span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg py-1 animate-scale-in z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                <span className="font-heading font-semibold text-sm text-gray-800 dark:text-slate-200">
                  Notifications ({unreadCount} new)
                </span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline font-bold"
                    >
                      Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[10px] text-rose-500 hover:underline font-bold"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto scrollbar-thin divide-y divide-gray-50 dark:divide-slate-800/40">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all ${
                      !notif.read ? 'bg-primary-50/10 dark:bg-primary-950/5' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${
                          !notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-gray-400 dark:text-slate-500 shrink-0">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 leading-normal ${
                        !notif.read ? 'text-gray-700 dark:text-slate-250 font-medium' : 'text-gray-550 dark:text-slate-450'
                      }`}>
                        {notif.message}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full mt-1.5 shrink-0" />
                    )}
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700"></div>

        {/* User Dropdown */}
        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary text-white text-xs font-semibold uppercase shadow-sm">
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200 leading-none mb-0.5 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-400 capitalize leading-none">
                  {currentUser.role}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-lg py-1 animate-scale-in z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 md:hidden">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-none">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize mt-1">
                    {currentUser.role}
                  </p>
                </div>
                {isCustomer && customerProfileId && (
                  <Link
                    to={`/customers/${customerProfileId}`}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <HiUser className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    My Profile
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <HiCog6Tooth className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    Settings
                  </Link>
                )}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <HiArrowLeftOnRectangle className="w-4 h-4 text-rose-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
