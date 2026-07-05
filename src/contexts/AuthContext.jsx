import React, { createContext, useState, useEffect, useContext } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user role from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setCurrentUser({ uid: user.uid, email: user.email, ...userDocSnap.data() });
          } else {
            // Fallback for newly created users without a Firestore doc
            setCurrentUser({ uid: user.uid, email: user.email, role: 'admin', name: 'Admin' });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user and loading state
    } catch (error) {
      setLoading(false);
      throw new Error(error.message || 'Failed to login. Please check your credentials.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to logout:", error);
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
        'view_customers', 'create_customers', 'edit_customers',
        'view_measurements', 'create_measurements', 'edit_measurements',
        'view_orders', 'create_orders', 'edit_orders', 'update_order_status',
        'view_payments', 'create_payments', 'edit_payments'
      ];
      return allowedActions.includes(action);
    }

    // Customer permissions
    if (isCustomer) {
      const allowedActions = [
        'view_own_orders', 'view_own_payments', 'create_own_payments'
      ];
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
    hasPermission
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
