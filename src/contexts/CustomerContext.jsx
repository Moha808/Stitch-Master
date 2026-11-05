import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'customers'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const customersData = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            customerId: data.customerId || d.id,
            ...data,
          };
        });
        // Sort descending by creation date in memory to avoid index requirements
        customersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setCustomers(customersData);
      },
      (error) => {
        console.error('Error fetching customers:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCustomer = async (customerData) => {
    const customerId = generateId('CUS');
    const newCustomer = {
      ...customerData,
      id: customerId,
      customerId,
      createdAt: new Date().toISOString(),
    };
    try {
      // Optimistic state update so Dashboard and Customer table update instantly
      setCustomers((prev) => [newCustomer, ...prev.filter((c) => c.customerId !== customerId)]);
      await setDoc(doc(db, 'customers', customerId), newCustomer);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      setCustomers((prev) =>
        prev.map((c) => (c.customerId === id || c.id === id ? { ...c, ...customerData } : c))
      );
      const docRef = doc(db, 'customers', id);
      await updateDoc(docRef, customerData);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      // 1. Optimistically remove from state immediately so it disappears from UI
      setCustomers((prev) => prev.filter((c) => c.customerId !== id && c.id !== id));

      // 2. Delete by primary doc id
      await deleteDoc(doc(db, 'customers', id));

      // 3. Fallback: also delete any matching document where field customerId == id
      const q = query(collection(db, 'customers'), where('customerId', '==', id));
      const querySnap = await getDocs(q);
      const deletePromises = querySnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting customer:', error);
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
