import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId, formatCurrency } from '../utils/formatters';
import { useNotifications } from './NotificationContext';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      setPayments(data);
    }, (error) => {
      console.error("Error fetching payments:", error);
    });

    return () => unsubscribe();
  }, []);

  const addPayment = async (paymentData) => {
    const paymentId = generateId('PAY');
    const newPayment = {
      ...paymentData,
      paymentId,
      paymentDate: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'payments', paymentId), newPayment);

      if (newPayment.amountPaid > 0) {
        addNotification('Payment Recorded', `Payment of ${formatCurrency(newPayment.amountPaid)} recorded for Order ${newPayment.orderId}.`, 'success');
      }

      return newPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const getPaymentsByOrder = (orderId) => {
    return payments.filter((p) => p.orderId === orderId);
  };

  const getAmountPaidForOrder = (orderId) => {
    return getPaymentsByOrder(orderId).reduce((sum, p) => sum + p.amountPaid, 0);
  };

  const getPaymentHistory = (orderId) => {
    return payments
      .filter((p) => p.orderId === orderId)
      .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        addPayment,
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
