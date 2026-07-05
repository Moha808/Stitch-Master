import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl font-bold mb-4">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-800 font-heading">Access Denied</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          You do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
