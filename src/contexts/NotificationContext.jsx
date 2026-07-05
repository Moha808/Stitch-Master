import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ ...d.data(), _docId: d.id }));
      setNotifications(data);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  const addNotification = useCallback(async (title, message, type = 'info') => {
    const notifId = generateId('NTF');
    const newNotif = {
      id: notifId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
      return newNotif;
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach((n) => {
        const docRef = doc(db, 'notifications', n.id);
        batch.update(docRef, { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        const docRef = doc(db, 'notifications', n.id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
