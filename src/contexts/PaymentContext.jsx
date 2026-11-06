import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId, formatCurrency } from '../utils/formatters';
import { useNotifications } from './NotificationContext';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Avoid composite index requirement by querying without orderBy and sorting in memory
    const q = query(collection(db, 'payments'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        data.sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0));
        setPayments(data);
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addPayment = async (paymentData) => {
    const paymentId = generateId('PAY');
    const newPayment = {
      ...paymentData,
      id: paymentId,
      paymentId,
      paymentDate: new Date().toISOString(),
    };
    try {
      // Optimistic update
      setPayments((prev) => [newPayment, ...prev.filter((p) => p.paymentId !== paymentId)]);
      await setDoc(doc(db, 'payments', paymentId), newPayment);

      if (newPayment.amountPaid > 0) {
        addNotification(
          'Payment Recorded',
          `Payment of ${formatCurrency(newPayment.amountPaid)} recorded for Order ${newPayment.orderId}.`,
          'success'
        );
      }

      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const deletePayment = async (id) => {
    try {
      setPayments((prev) => prev.filter((p) => p.paymentId !== id && p.id !== id));
      await deleteDoc(doc(db, 'payments', id));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  };

  const getPaymentsByOrder = (orderId) => {
    if (!orderId) return [];
    return payments.filter((p) => p.orderId === orderId);
  };

  const getAmountPaidForOrder = (orderId) => {
    return getPaymentsByOrder(orderId).reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);
  };

  const getPaymentHistory = (orderId) => {
    return payments
      .filter((p) => p.orderId === orderId)
      .sort((a, b) => new Date(a.paymentDate || 0) - new Date(b.paymentDate || 0));
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        addPayment,
        deletePayment,
        getPaymentsByOrder,
        getAmountPaidForOrder,
        getPaymentHistory,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};
