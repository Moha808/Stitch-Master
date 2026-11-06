import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';

const MeasurementContext = createContext(null);

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    // Avoid composite index requirement by querying without orderBy and sorting in memory
    const q = query(collection(db, 'measurements'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setMeasurements(data);
      },
      (error) => {
        console.error('Error fetching measurements:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const addMeasurement = async (measurementData) => {
    const measurementId = generateId('MEA');
    const newMeasurement = {
      ...measurementData,
      id: measurementId,
      measurementId,
      createdAt: new Date().toISOString(),
    };
    try {
      // Optimistic state update so UI updates immediately
      setMeasurements((prev) => [newMeasurement, ...prev.filter((m) => m.measurementId !== measurementId)]);
      await setDoc(doc(db, 'measurements', measurementId), newMeasurement);
      return newMeasurement;
    } catch (error) {
      console.error('Error adding measurement:', error);
      throw error;
    }
  };

  const updateMeasurement = async (id, measurementData) => {
    try {
      setMeasurements((prev) =>
        prev.map((m) => (m.measurementId === id || m.id === id ? { ...m, ...measurementData } : m))
      );
      const docRef = doc(db, 'measurements', id);
      await updateDoc(docRef, measurementData);
    } catch (error) {
      console.error('Error updating measurement:', error);
      throw error;
    }
  };

  const deleteMeasurement = async (id) => {
    try {
      setMeasurements((prev) => prev.filter((m) => m.measurementId !== id && m.id !== id));
      await deleteDoc(doc(db, 'measurements', id));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      throw error;
    }
  };

  const getMeasurementsByCustomer = (customerId) => {
    return measurements
      .filter((m) => m.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  };

  const getLatestMeasurement = (customerId) => {
    const customerMeas = getMeasurementsByCustomer(customerId);
    return customerMeas.length > 0 ? customerMeas[0] : null;
  };

  return (
    <MeasurementContext.Provider
      value={{
        measurements,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        getMeasurementsByCustomer,
        getLatestMeasurement,
      }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurements = () => {
  const context = useContext(MeasurementContext);
  if (!context) {
    throw new Error('useMeasurements must be used within a MeasurementProvider');
  }
  return context;
};
