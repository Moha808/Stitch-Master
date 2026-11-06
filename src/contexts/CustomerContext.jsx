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
      // 1. Locate the customer record to gather details like email
      const customerToDelete = customers.find((c) => c.customerId === id || c.id === id);

      // 2. Optimistically remove from state immediately so it disappears from UI
      setCustomers((prev) => prev.filter((c) => c.customerId !== id && c.id !== id));

      // 3. Delete by primary doc id in customers collection
      try {
        await deleteDoc(doc(db, 'customers', id));
      } catch (e) {
        console.warn('Doc ID delete fallback:', e);
      }

      // 4. Fallback: also delete any matching document where field customerId == id
      const qCust = query(collection(db, 'customers'), where('customerId', '==', id));
      const querySnap = await getDocs(qCust);
      await Promise.all(querySnap.docs.map((d) => deleteDoc(d.ref)));

      // 5. CRITICAL: Also delete from 'users' collection if this customer has a linked user account in Firebase
      if (customerToDelete?.email) {
        const qUsers = query(collection(db, 'users'), where('email', '==', customerToDelete.email));
        const userSnap = await getDocs(qUsers);
        await Promise.all(userSnap.docs.map((d) => deleteDoc(d.ref)));
      }
      if (customerToDelete?.customerId) {
        const qUsersByCustId = query(collection(db, 'users'), where('customerId', '==', customerToDelete.customerId));
        const userSnap2 = await getDocs(qUsersByCustId);
        await Promise.all(userSnap2.docs.map((d) => deleteDoc(d.ref)));
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  const getCustomer = (id) => {
    if (!id) return null;
    return customers.find((c) => c.customerId === id || c.id === id);
  };

  const searchCustomers = (query) => {
    if (!query) return customers;
    const lowerQuery = query.toLowerCase();
    return customers.filter(
      (c) =>
        (c.fullName && c.fullName.toLowerCase().includes(lowerQuery)) ||
        (c.phone && c.phone.includes(lowerQuery)) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery))
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
