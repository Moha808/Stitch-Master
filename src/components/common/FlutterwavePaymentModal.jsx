import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import Modal from './Modal';
import Button from './Button';

const FlutterwavePaymentModal = ({ isOpen, onClose, onSuccess, amount, email, name }) => {
  const config = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `SM-TX-${Date.now()}`,
    amount: amount || 0,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
    customer: {
      email: email || 'customer@stitchmaster.com',
      name: name || 'Valued Customer',
    },
    customizations: {
      title: 'StitchMaster',
      description: 'Payment for Tailoring Services',
      logo: 'https://cdn-icons-png.flaticon.com/512/3103/3103446.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Options" size="sm">
      <div className="space-y-4 p-2 text-center">
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
          Flutterwave's test server appears to be timing out. You can try the real gateway, or use the bypass below to instantly simulate a successful payment.
        </p>

        <Button 
          fullWidth 
          variant="primary" 
          onClick={() => {
            handleFlutterPayment({
              callback: (response) => {
                 if (response.status === 'successful') {
                   onSuccess(response);
                   closePaymentModal();
                 }
              },
              onClose: () => {
                // Do nothing, just close Flutterwave overlay
              },
            });
          }}
        >
          Try Real Flutterwave Gateway
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        </div>

        <Button 
          fullWidth 
          variant="ghost" 
          className="border-2 border-dashed border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
          onClick={() => {
            // Bypass logic
            onSuccess({
              status: 'successful',
              tx_ref: `BYPASS-TX-${Date.now()}`,
              transaction_id: `SIMULATED-${Math.floor(Math.random() * 1000000)}`
            });
          }}
        >
          Force Payment Success (Bypass)
        </Button>
      </div>
    </Modal>
  );
};

export default FlutterwavePaymentModal;
