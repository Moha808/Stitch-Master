import React from 'react';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { MeasurementProvider } from './contexts/MeasurementContext';
import { OrderProvider } from './contexts/OrderContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <CustomerProvider>
              <MeasurementProvider>
                <OrderProvider>
                  <PaymentProvider>
                    <AppRouter />
                  </PaymentProvider>
                </OrderProvider>
              </MeasurementProvider>
            </CustomerProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
