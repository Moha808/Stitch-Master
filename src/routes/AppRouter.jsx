import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import DashboardPage from '../pages/DashboardPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerDetailPage from '../pages/CustomerDetailPage';
import MeasurementsPage from '../pages/MeasurementsPage';
import OrdersPage from '../pages/OrdersPage';
import PaymentsPage from '../pages/PaymentsPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ROLES } from '../utils/constants';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Dashboard/App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin & Staff */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.STAFF]}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]}>
                <CustomerDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/measurements"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.STAFF]}>
                <MeasurementsPage />
              </ProtectedRoute>
            }
          />

          {/* All Roles (Orders) */}
          <Route path="/orders" element={<OrdersPage />} />

          {/* Admin, Staff, Customer (Payments) */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN, ROLES.STAFF, ROLES.CUSTOMER]}>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Only */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* NotFound for any subpaths */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* NotFound for direct root paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
