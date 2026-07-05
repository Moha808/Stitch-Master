import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiUser,
  HiClipboardDocumentList,
  HiShoppingBag,
  HiCreditCard,
  HiPrinter,
  HiPlus,
  HiPencil,
} from 'react-icons/hi2';
import { useCustomers } from '../contexts/CustomerContext';
import { useMeasurements } from '../contexts/MeasurementContext';
import { useOrders } from '../contexts/OrderContext';
import { usePayments } from '../contexts/PaymentContext';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import FlutterwavePaymentModal from '../components/common/FlutterwavePaymentModal';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate, getInitials } from '../utils/formatters';
import { MALE_MEASUREMENTS, FEMALE_MEASUREMENTS } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer } = useCustomers();
  const { getMeasurementsByCustomer, addMeasurement, updateMeasurement } = useMeasurements();
  const { getOrdersByCustomer } = useOrders();
  const { payments, getAmountPaidForOrder, addPayment } = usePayments();
  const { addToast } = useToast();
  const { currentUser, isCustomer } = useAuth();

  const customer = getCustomer(id);

  // States
  const [activeTab, setActiveTab] = useState('measurements');
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [gender, setGender] = useState('male'); // male or female

  // Payment States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentErrors, setPaymentErrors] = useState({});

  // Ownership validation
  const isViewingSelf = useMemo(() => {
    if (!isCustomer) return true;
    return customer?.email?.toLowerCase() === currentUser?.email?.toLowerCase();
  }, [isCustomer, customer, currentUser]);

  // Measurement form state
  const [measForm, setMeasForm] = useState({
    neck: 0,
    chest: 0,
    waist: 0,
    hip: 0,
    shoulder: 0,
    sleeveLength: 0,
    trouserLength: 0,
    bust: 0,
  });

  const [editingMeasId, setEditingMeasId] = useState(null);

  // Get data
  const customerMeasurements = getMeasurementsByCustomer(id);
  const customerOrders = getOrdersByCustomer(id);

  const customerPayments = useMemo(() => {
    const orderIds = customerOrders.map((o) => o.orderId);
    return payments.filter((p) => orderIds.includes(p.orderId));
  }, [customerOrders, payments]);

  // Eligible customer orders (outstanding balance > 0)
  const unpaidOrders = useMemo(() => {
    return customerOrders.map((order) => {
      const paid = getAmountPaidForOrder(order.orderId);
      return {
        ...order,
        paidSoFar: paid,
        remainingBalance: Math.max(0, order.totalCost - paid),
      };
    }).filter((o) => o.remainingBalance > 0);
  }, [customerOrders, getAmountPaidForOrder]);

  const selectedPaymentOrderDetails = useMemo(() => {
    if (!paymentOrderId) return null;
    const order = customerOrders.find((o) => o.orderId === paymentOrderId);
    if (!order) return null;
    const paid = getAmountPaidForOrder(paymentOrderId);
    return {
      ...order,
      paidSoFar: paid,
      balance: Math.max(0, order.totalCost - paid),
    };
  }, [paymentOrderId, customerOrders, getAmountPaidForOrder]);

  const handleOpenPaymentModal = () => {
    setPaymentOrderId('');
    setPaymentAmountInput('');
    setPaymentErrors({});
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    const errors = {};
    if (!paymentOrderId) errors.orderId = 'Order selection is required.';
    if (!paymentAmountInput || Number(paymentAmountInput) <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    }
    if (selectedPaymentOrderDetails && Number(paymentAmountInput) > selectedPaymentOrderDetails.balance) {
      errors.amount = `Amount cannot exceed outstanding balance of ${formatCurrency(selectedPaymentOrderDetails.balance)}`;
    }

    if (Object.keys(errors).length > 0) {
      setPaymentErrors(errors);
      return;
    }

    if (isCustomer) {
      setPaymentModalOpen(false);
      setGatewayOpen(true);
      return;
    }

    addPayment({
      orderId: paymentOrderId,
      amountPaid: Number(paymentAmountInput),
      balance: selectedPaymentOrderDetails.balance - Number(paymentAmountInput),
    });

    addToast('Payment transaction recorded successfully.', 'success');
    setPaymentModalOpen(false);
  };

  const handlePaymentSuccess = (response) => {
    addPayment({
      orderId: paymentOrderId,
      amountPaid: Number(paymentAmountInput),
      balance: selectedPaymentOrderDetails.balance - Number(paymentAmountInput),
      transactionRef: response.tx_ref,
      gatewayId: response.transaction_id,
    });
    addToast('Payment successfully processed via Flutterwave!', 'success');
    setGatewayOpen(false);
  };

  const latestMeas = customerMeasurements[0] || null;

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Customer not found.</h3>
        <Link to="/customers" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to customers list
        </Link>
      </div>
    );
  }

  if (!isViewingSelf) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mt-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-450 text-2xl font-bold mb-4">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-850 dark:text-white font-heading">Access Denied</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-md">
          You do not have permission to access other customer profile sheets.
        </p>
      </div>
    );
  }

  const handleOpenAddMeasurement = () => {
    setEditingMeasId(null);
    if (latestMeas) {
      setGender(latestMeas.bust > 0 ? 'female' : 'male');
      setMeasForm({
        neck: latestMeas.neck,
        chest: latestMeas.chest,
        waist: latestMeas.waist,
        hip: latestMeas.hip,
        shoulder: latestMeas.shoulder,
        sleeveLength: latestMeas.sleeveLength,
        trouserLength: latestMeas.trouserLength,
        bust: latestMeas.bust,
      });
    } else {
      setGender('male');
      setMeasForm({
        neck: '',
        chest: '',
        waist: '',
        hip: '',
        shoulder: '',
        sleeveLength: '',
        trouserLength: '',
        bust: '',
      });
    }
    setMeasurementModalOpen(true);
  };

  const handleOpenEditMeasurement = (meas) => {
    setEditingMeasId(meas.measurementId);
    setGender(meas.bust > 0 ? 'female' : 'male');
    setMeasForm({
      neck: meas.neck,
      chest: meas.chest,
      waist: meas.waist,
      hip: meas.hip,
      shoulder: meas.shoulder,
      sleeveLength: meas.sleeveLength,
      trouserLength: meas.trouserLength,
      bust: meas.bust,
    });
    setMeasurementModalOpen(true);
  };

  const handleSaveMeasurement = (e) => {
    e.preventDefault();
    const payload = {
      customerId: id,
      neck: gender === 'male' ? Number(measForm.neck) || 0 : 0,
      chest: gender === 'male' ? Number(measForm.chest) || 0 : 0,
      waist: Number(measForm.waist) || 0,
      hip: Number(measForm.hip) || 0,
      shoulder: Number(measForm.shoulder) || 0,
      sleeveLength: Number(measForm.sleeveLength) || 0,
      trouserLength: gender === 'male' ? Number(measForm.trouserLength) || 0 : 0,
      bust: gender === 'female' ? Number(measForm.bust) || 0 : 0,
    };

    if (editingMeasId) {
      updateMeasurement(editingMeasId, payload);
      addToast('Measurement record updated.', 'success');
    } else {
      addMeasurement(payload);
      addToast('New measurement record logged.', 'success');
    }
    setMeasurementModalOpen(false);
  };

  const handlePrintMeasurements = () => {
    window.print();
  };

  // Orders table columns
  const orderColumns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (val) => <span className="font-mono text-xs text-primary-600 font-bold">{val}</span>,
    },
    { key: 'styleDescription', label: 'Style Description' },
    { key: 'fabricType', label: 'Fabric' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'balance',
      label: 'Balance Owed',
      render: (_, row) => {
        const paid = getAmountPaidForOrder(row.orderId);
        return (
          <span className={`font-semibold ${row.totalCost - paid > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(row.totalCost - paid)}
          </span>
        );
      },
    },
  ];

  // Payments table columns
  const paymentColumns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (val) => <span className="font-mono text-xs text-gray-500">{val}</span>,
    },
    {
      key: 'orderId',
      label: 'Order ID',
      render: (val) => <span className="font-mono text-xs text-primary-600 font-bold">{val}</span>,
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      render: (val) => <span className="font-semibold text-emerald-600">{formatCurrency(val)}</span>,
    },
    {
      key: 'paymentDate',
      label: 'Date Paid',
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {!isCustomer && (
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors no-print"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Customers
        </button>
      )}

      {/* Customer Header card */}
      <Card className="p-6 relative border-gray-100/80 dark:border-slate-850 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white text-xl font-bold flex items-center justify-center shadow-md uppercase">
              {getInitials(customer.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-heading text-gray-800 dark:text-white">{customer.fullName}</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">ID: {customer.customerId}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <Button variant="secondary" onClick={handlePrintMeasurements}>
              <HiPrinter className="w-4.5 h-4.5" />
              Print Specs
            </Button>
          </div>
        </div>

        {/* Info detail block */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-105 dark:border-slate-800 mt-6 pt-6 text-sm">
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Phone Number</span>
            <span className="text-gray-700 dark:text-slate-350 font-medium mt-1 block">{customer.phone}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
            <span className="text-gray-700 dark:text-slate-350 font-medium mt-1 block">{customer.email || 'None'}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Delivery Address</span>
            <span className="text-gray-700 dark:text-slate-350 font-medium mt-1 block">{customer.address || 'None'}</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 no-print">
        {[
          { id: 'measurements', label: 'Body Measurements', icon: HiClipboardDocumentList },
          { id: 'orders', label: 'Order History', icon: HiShoppingBag },
          { id: 'payments', label: 'Payment History', icon: HiCreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all ${
                active
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-400 dark:text-slate-550 hover:text-gray-650 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'measurements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Latest Measurements Summary */}
            <div className="lg:col-span-2">
              <Card className="p-6 h-full border-gray-100/80 dark:border-slate-850 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Standard Specifications</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Latest recorded size profile (in inches)</p>
                  </div>
                  {!isCustomer && (
                    <Button onClick={handleOpenAddMeasurement} variant="primary" size="sm" className="no-print">
                      <HiPlus className="w-4 h-4" />
                      Record New
                    </Button>
                  )}
                </div>

                {latestMeas ? (
                  <div>
                    {latestMeas.bust > 0 ? (
                      /* Female measurements layout */
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {FEMALE_MEASUREMENTS.map((m) => (
                          <div key={m.key} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 text-center hover:shadow-sm transition-all">
                            <span className="text-xs text-gray-400 dark:text-slate-550 font-semibold uppercase block">{m.label}</span>
                            <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400 mt-1 block">
                              {latestMeas[m.key] || '0'}"
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Male measurements layout */
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {MALE_MEASUREMENTS.map((m) => (
                          <div key={m.key} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 text-center hover:shadow-sm transition-all">
                            <span className="text-xs text-gray-400 dark:text-slate-550 font-semibold uppercase block">{m.label}</span>
                            <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400 mt-1 block">
                              {latestMeas[m.key] || '0'}"
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-450 dark:text-slate-500">
                    No measurements recorded. Please record measurements first.
                  </div>
                )}
              </Card>
            </div>

            {/* Measurement Log History */}
            <div>
              <Card className="p-6 h-full border-gray-100/80 dark:border-slate-850 shadow-md">
                <div className="mb-4">
                  <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Historical Logs</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Previously recorded logs</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {customerMeasurements.map((m) => (
                    <div
                      key={m.measurementId}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-350">{formatDate(m.createdAt)}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-550 block mt-0.5">
                          {m.bust > 0 ? 'Female (Bust: ' + m.bust + '")' : 'Male (Neck: ' + m.neck + '")'}
                        </span>
                      </div>
                      {!isCustomer && (
                        <Button onClick={() => handleOpenEditMeasurement(m)} variant="ghost" size="sm" className="p-1.5 no-print text-primary-600 dark:text-primary-400">
                          <HiPencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {customerMeasurements.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-450 dark:text-slate-500">No logs found.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <Card className="overflow-hidden border-gray-100/80 dark:border-slate-850 shadow-md">
            <Table columns={orderColumns} data={customerOrders} emptyMessage="No orders placed by this customer." />
          </Card>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4 animate-fade-in">
            {unpaidOrders.length > 0 && (
              <div className="flex justify-end no-print">
                <Button onClick={handleOpenPaymentModal} variant="primary">
                  <HiCreditCard className="w-5 h-5" />
                  {isCustomer ? 'Make Payment' : 'Record Payment'}
                </Button>
              </div>
            )}
            <Card className="overflow-hidden border-gray-100/80 dark:border-slate-850 shadow-md">
              <Table columns={paymentColumns} data={customerPayments} emptyMessage="No payment history logged for this customer." />
            </Card>
          </div>
        )}
      </div>

      {/* Add/Edit Measurement Modal */}
      <Modal
        isOpen={measurementModalOpen}
        onClose={() => setMeasurementModalOpen(false)}
        title={editingMeasId ? 'Edit Measurement Spec' : 'Log New Body Specs'}
        size="lg"
      >
        <form onSubmit={handleSaveMeasurement} className="space-y-4">
          {/* Gender selection */}
          <div className="flex items-center gap-4 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-450 pl-2">Customer Profile Mode</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                Male (Trouser, Neck)
              </label>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">
                <input
                  type="radio"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                Female (Bust, Gown)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gender === 'male' ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Neck (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measForm.neck}
                    onChange={(e) => setMeasForm({ ...measForm, neck: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Chest (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measForm.chest}
                    onChange={(e) => setMeasForm({ ...measForm, chest: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Trouser Length (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measForm.trouserLength}
                    onChange={(e) => setMeasForm({ ...measForm, trouserLength: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Bust (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measForm.bust}
                  onChange={(e) => setMeasForm({ ...measForm, bust: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            )}

            {/* Common fields */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Waist (inches)</label>
              <input
                type="number"
                step="0.1"
                value={measForm.waist}
                onChange={(e) => setMeasForm({ ...measForm, waist: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Hip (inches)</label>
              <input
                type="number"
                step="0.1"
                value={measForm.hip}
                onChange={(e) => setMeasForm({ ...measForm, hip: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Shoulder (inches)</label>
              <input
                type="number"
                step="0.1"
                value={measForm.shoulder}
                onChange={(e) => setMeasForm({ ...measForm, shoulder: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-450">Sleeve Length (inches)</label>
              <input
                type="number"
                step="0.1"
                value={measForm.sleeveLength}
                onChange={(e) => setMeasForm({ ...measForm, sleeveLength: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setMeasurementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Specifications
            </Button>
          </div>
        </form>
      </Modal>

      {/* Online Payment Modal Simulator */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title={isCustomer ? "Secure Online Payment Gateway" : "Record Invoice Payment"} size="md">
        <form onSubmit={handleSavePayment} className="space-y-4">
          {isCustomer && (
            <div className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 p-3 rounded-xl border border-indigo-150 dark:border-indigo-900/60 text-xs">
              <p className="font-bold">🔒 Secure Paystack Flutterwave Simulation</p>
              <p className="mt-1">This simulation handles dummy debit card authorization and bank transfers for your tailoring orders.</p>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Select Invoice Order *</label>
            <select
              value={paymentOrderId}
              onChange={(e) => setPaymentOrderId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Choose Order --</option>
              {unpaidOrders.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderId} - {o.styleDescription} (Owes {formatCurrency(o.remainingBalance)})
                </option>
              ))}
            </select>
          </div>

          {selectedPaymentOrderDetails && (
            <div className="bg-gray-50 dark:bg-slate-850 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400 dark:text-slate-550">Total Sew Bill:</span>
                <span className="text-gray-750 dark:text-slate-200 font-bold">{formatCurrency(selectedPaymentOrderDetails.totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400 dark:text-slate-550">Paid to Date:</span>
                <span className="text-emerald-600 dark:text-emerald-450 font-semibold">{formatCurrency(selectedPaymentOrderDetails.paidSoFar)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 dark:border-slate-700 pt-2">
                <span className="font-bold text-gray-700 dark:text-slate-250">Outstanding Balance:</span>
                <span className="text-rose-500 dark:text-rose-450 font-bold">{formatCurrency(selectedPaymentOrderDetails.balance)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Payment Amount (₦) *</label>
            <input
              type="number"
              value={paymentAmountInput}
              onChange={(e) => setPaymentAmountInput(e.target.value)}
              className="input-field"
              placeholder="e.g. 15000"
              required
            />
            {paymentErrors.amount && <p className="text-xs text-rose-500 font-medium mt-1">{paymentErrors.amount}</p>}
          </div>

          {selectedPaymentOrderDetails && paymentAmountInput && !paymentErrors.amount && (
            <div className="flex justify-between items-center text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/65">
              <span className="font-semibold">Calculated New Balance:</span>
              <span className="font-extrabold text-sm">
                {formatCurrency(Math.max(0, selectedPaymentOrderDetails.balance - Number(paymentAmountInput)))}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isCustomer ? 'Pay Online' : 'Record Cash'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Flutterwave Payment Modal */}
      <FlutterwavePaymentModal 
        isOpen={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={Number(paymentAmountInput)}
        email={currentUser?.email}
        name={currentUser?.name}
      />

      {/* Print-only View Layout */}
      <div className="hidden print:block text-black p-8 font-sans">
        <h1 className="text-3xl font-extrabold text-center border-b-2 border-gray-800 pb-4">STITCHMASTER CUSTOMER SPECS</h1>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="font-bold">Customer: <span className="font-medium">{customer.fullName}</span></p>
            <p className="font-bold mt-1">Phone: <span className="font-medium">{customer.phone}</span></p>
          </div>
          <div className="text-right">
            <p className="font-bold">Date printed: <span className="font-medium">{formatDate(new Date())}</span></p>
            <p className="font-bold mt-1">Customer ID: <span className="font-medium">{customer.customerId}</span></p>
          </div>
        </div>

        {latestMeas ? (
          <div className="mt-8 border border-gray-300 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-bold uppercase tracking-wider text-center border-b pb-3 mb-6 bg-gray-50">Body Measurement Specifications</h2>
            <div className="grid grid-cols-3 gap-6 text-center text-lg">
              {latestMeas.bust > 0 ? (
                FEMALE_MEASUREMENTS.map((m) => (
                  <div key={m.key} className="border-b pb-2">
                    <span className="text-xs uppercase text-gray-500 font-bold block">{m.label}</span>
                    <span className="text-2xl font-bold mt-1 block">{latestMeas[m.key] || '0'}"</span>
                  </div>
                ))
              ) : (
                MALE_MEASUREMENTS.map((m) => (
                  <div key={m.key} className="border-b pb-2">
                    <span className="text-xs uppercase text-gray-500 font-bold block">{m.label}</span>
                    <span className="text-2xl font-bold mt-1 block">{latestMeas[m.key] || '0'}"</span>
                  </div>
                ))
              )}
            </div>
            {customer.address && (
              <div className="mt-8 pt-4 border-t">
                <span className="font-bold text-sm text-gray-500 uppercase block">Delivery Address:</span>
                <p className="mt-1 font-medium">{customer.address}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center mt-12 text-gray-400">No measurements logged in system yet.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailPage;
