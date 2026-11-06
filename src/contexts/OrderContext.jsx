import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';
import { useNotifications } from './NotificationContext';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Avoid composite index requirement by querying without orderBy and sorting in memory
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(data);
      },
      (error) => {
        console.error('Error fetching orders:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData) => {
    const orderId = generateId('ORD');
    const newOrder = {
      status: 'Pending',
      ...orderData,
      id: orderId,
      orderId,
      createdAt: new Date().toISOString(),
    };
    try {
      // Optimistic update
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.orderId !== orderId)]);
      await setDoc(doc(db, 'orders', orderId), newOrder);
      addNotification(
        'New Order Commissioned',
        `Order ${newOrder.orderId} (${newOrder.styleDescription}) has been created.`,
        'info'
      );
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (id, orderData) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id || o.id === id ? { ...o, ...orderData } : o))
      );
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, orderData);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id) => {
    try {
      setOrders((prev) => prev.filter((o) => o.orderId !== id && o.id !== id));
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === id || o.id === id ? { ...o, status } : o))
      );
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
      addNotification('Order Status Updated', `Order ${id} is now ${status}.`, 'info');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getOrdersByCustomer = (customerId) => {
    if (!customerId) return [];
    return orders.filter((o) => o.customerId === customerId);
  };

  const getOrdersByStatus = (status) => {
    return orders.filter((o) => o.status === status);
  };

  // Computed stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const inProgressOrders = orders.filter((o) => o.status === 'In Progress').length;
  const readyOrders = orders.filter((o) => o.status === 'Ready').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        updateOrderStatus,
        getOrdersByCustomer,
        getOrdersByStatus,
        totalOrders,
        pendingOrders,
        inProgressOrders,
        readyOrders,
        deliveredOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
