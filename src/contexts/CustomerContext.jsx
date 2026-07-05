import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => doc.data());
      setCustomers(customersData);
    }, (error) => {
      console.error("Error fetching customers:", error);
    });

    return () => unsubscribe();
  }, []);

  const addCustomer = async (customerData) => {
    const customerId = generateId('CUS');
    const newCustomer = {
      ...customerData,
      customerId,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'customers', customerId), newCustomer);
      return newCustomer;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, customerData);
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  };

  const getCustomer = (id) => {
    return customers.find((c) => c.customerId === id);
  };

  const searchCustomers = (query) => {
    if (!query) return customers;
    const lowerQuery = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        searchCustomers,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
