import React, { createContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (user) {
        // Listen in real-time to the user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        unsubUserDoc = onSnapshot(
          userDocRef,
          (userDocSnap) => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: userData.name || userData.fullName || user.displayName || 'User',
                role: userData.role || 'customer',
                customerId: userData.customerId || null,
                ...userData,
              });
            } else {
              // Safe fallback: new registrations start as 'customer' (NEVER admin!)
              // Admin role is reserved solely for verified admin records
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'Customer',
                role: 'customer',
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching user data:', error);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.email?.split('@')[0] || 'Customer',
              role: 'customer',
            });
            setLoading(false);
          }
        );
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      unsubscribeAuth();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw new Error(error.message || 'Failed to login. Please check your credentials.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';
  const isCustomer = currentUser?.role === 'customer';

  const hasPermission = (action) => {
    if (!currentUser) return false;
    if (isAdmin) return true;

    // Staff permissions
    if (isStaff) {
      const allowedActions = [
        'view_customers',
        'create_customers',
        'edit_customers',
        'view_measurements',
        'create_measurements',
        'edit_measurements',
        'view_orders',
        'create_orders',
        'edit_orders',
        'update_order_status',
        'view_payments',
        'create_payments',
        'edit_payments',
      ];
      return allowedActions.includes(action);
    }

    // Customer permissions
    if (isCustomer) {
      const allowedActions = ['view_own_orders', 'view_own_payments', 'create_own_payments'];
      return allowedActions.includes(action);
    }

    return false;
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAdmin,
    isStaff,
    isCustomer,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
