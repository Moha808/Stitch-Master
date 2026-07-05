import React, { useState, useEffect } from 'react';
import { HiXMark, HiLockClosed, HiCheckCircle } from 'react-icons/hi2';
import { formatCurrency } from '../../utils/formatters';

const PaystackSimulator = ({ isOpen, onClose, onSuccess, amount, email }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setSuccess(false);
      setPaymentMethod('card');
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network request processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Auto-close and trigger success callback after showing success checkmark
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print font-sans">
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in relative">
        {/* Test Mode Badge */}
        <div className="absolute top-4 left-4 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase z-10">
          Test
        </div>

        {/* Close Button */}
        <button 
          onClick={!loading && !success ? onClose : undefined}
          className={`absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10 ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <HiXMark className="w-5 h-5" />
        </button>

        {success ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center p-12 text-center h-[450px]">
            <HiCheckCircle className="w-20 h-20 text-[#3bb75e] animate-scale-in" />
            <h3 className="text-xl font-bold text-gray-800 mt-4">Payment Successful</h3>
            <p className="text-sm text-gray-500 mt-2">You paid {formatCurrency(amount)}</p>
          </div>
        ) : (
          /* Payment Form */
          <div className="flex flex-col h-[500px]">
            {/* Header section (Mock Paystack Header) */}
            <div className="bg-[#f2fcf5] px-6 py-8 text-center border-b border-gray-100">
              <div className="mx-auto w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-[#0ba4db]">S</span>
              </div>
              <p className="text-sm text-gray-500">{email}</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">Pay {formatCurrency(amount)}</h2>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Methods */}
              <div className="w-24 bg-[#f9fafb] border-r border-gray-100 flex flex-col py-4">
                <button 
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center py-4 px-2 gap-2 text-xs transition-colors ${paymentMethod === 'card' ? 'bg-white border-l-2 border-[#3bb75e] text-[#3bb75e] font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Card
                </button>
                <button 
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col items-center justify-center py-4 px-2 gap-2 text-xs transition-colors ${paymentMethod === 'bank' ? 'bg-white border-l-2 border-[#3bb75e] text-[#3bb75e] font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                  Bank
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-sm font-semibold text-gray-800 mb-4">Enter your card details to pay</p>
                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength="19"
                        placeholder="0000 0000 0000 0000" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#3bb75e] focus:ring-1 focus:ring-[#3bb75e]"
                        required
                        disabled={loading}
                      />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M2 8.5C2 7.11929 3.11929 6 4.5 6H19.5C20.8807 6 22 7.11929 22 8.5V10H2V8.5ZM2 12V15.5C2 16.8807 3.11929 18 4.5 18H19.5C20.8807 18 22 16.8807 22 15.5V12H2ZM6 14.5C6 14.2239 6.22386 14 6.5 14H9.5C9.77614 14 10 14.2239 10 14.5C10 14.7761 9.77614 15 9.5 15H6.5C6.22386 15 6 14.7761 6 14.5Z" /></svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Card Expiry</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        maxLength="5"
                        value={expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) val = val.slice(0, 2) + ' / ' + val.slice(2);
                          setExpiry(val);
                        }}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#3bb75e] focus:ring-1 focus:ring-[#3bb75e]"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                      <input 
                        type="password" 
                        placeholder="123" 
                        maxLength="3"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#3bb75e] focus:ring-1 focus:ring-[#3bb75e]"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !cardNumber || !expiry || !cvv}
                    className="w-full mt-4 bg-[#3bb75e] hover:bg-[#2d964b] text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      `Pay NGN ${amount.toLocaleString('en-US')}`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f9fafb] p-3 text-center border-t border-gray-100 flex items-center justify-center gap-1">
              <HiLockClosed className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-medium text-gray-500">Secured by Paystack</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaystackSimulator;
