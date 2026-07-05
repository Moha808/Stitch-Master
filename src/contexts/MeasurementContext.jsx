import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateId } from '../utils/formatters';

const MeasurementContext = createContext(null);

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'measurements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => d.data());
      setMeasurements(data);
    }, (error) => {
      console.error("Error fetching measurements:", error);
    });

    return () => unsubscribe();
  }, []);

  const addMeasurement = async (measurementData) => {
    const measurementId = generateId('MEA');
    const newMeasurement = {
      ...measurementData,
      measurementId,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'measurements', measurementId), newMeasurement);
      return newMeasurement;
    } catch (error) {
      console.error("Error adding measurement:", error);
      throw error;
    }
  };

  const updateMeasurement = async (id, measurementData) => {
    try {
      const docRef = doc(db, 'measurements', id);
      await updateDoc(docRef, measurementData);
    } catch (error) {
      console.error("Error updating measurement:", error);
      throw error;
    }
  };

  const getMeasurementsByCustomer = (customerId) => {
    return measurements
      .filter((m) => m.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
