import React, { useState, useMemo } from 'react';
import { HiPlus, HiCreditCard, HiExclamationTriangle, HiBanknotes } from 'react-icons/hi2';
import { usePayments } from '../contexts/PaymentContext';
import { useOrders } from '../contexts/OrderContext';
import { useCustomers } from '../contexts/CustomerContext';
import useSearch from '../hooks/useSearch';
import useAuth from '../hooks/useAuth';
import usePagination from '../hooks/usePagination';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import FlutterwavePaymentModal from '../components/common/FlutterwavePaymentModal';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const PaymentsPage = () => {
  const { payments, addPayment, getAmountPaidForOrder } = usePayments();
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { currentUser, isCustomer } = useAuth();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Customer mapping
  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.customerId] = c;
    });
    return map;
  }, [customers]);

  // Order mapping
  const orderMap = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      map[o.orderId] = o;
    });
    return map;
  }, [orders]);

  // Financial aggregates
  const financialTotals = useMemo(() => {
    // Total Revenue is sum of totalCost of all orders
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalCost, 0);

    // Total Collected is sum of amountPaid in all payment entries
    const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    // Outstanding Balance is totalRevenue - totalCollected
    const outstanding = Math.max(0, totalRevenue - totalCollected);

    return { totalRevenue, totalCollected, outstanding };
  }, [orders, payments]);

  // Filter orders and payments if customer role
  const dashboardOrders = useMemo(() => {
    if (isCustomer && currentUser) {
      const userEmail = currentUser.email?.toLowerCase();
      const userName = currentUser.name?.toLowerCase() || currentUser.fullName?.toLowerCase();
      
      const matchingCustomerIds = customers
        .filter(c => 
          (c.email && c.email.toLowerCase() === userEmail) || 
          (c.fullName && userName && c.fullName.toLowerCase() === userName)
        )
        .map(c => c.customerId);

      return orders.filter((o) => 
        matchingCustomerIds.includes(o.customerId) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === userEmail)
      );
    }
    return orders;
  }, [orders, customers, currentUser, isCustomer]);

  const dashboardPayments = useMemo(() => {
    if (isCustomer) {
      const customer = customers.find((c) => c.email?.toLowerCase() === currentUser?.email?.toLowerCase());
      if (!customer) return [];
      const customerOrderIds = dashboardOrders.map(o => o.orderId);
      return payments.filter(p => customerOrderIds.includes(p.orderId));
    }
    return payments;
  }, [payments, dashboardOrders, customers, currentUser, isCustomer]);

  // Orders that are eligible for payment (have outstanding balance > 0)
  const eligibleOrdersForPayment = useMemo(() => {
    return dashboardOrders
      .map((order) => {
        const paid = getAmountPaidForOrder(order.orderId);
        const bal = Math.max(0, order.totalCost - paid);
        return {
          ...order,
          amountPaidSoFar: paid,
          remainingBalance: bal,
        };
      })
      .filter((o) => o.remainingBalance > 0);
  }, [orders, getAmountPaidForOrder]);

  const selectedOrderDetails = useMemo(() => {
    if (!selectedOrderId) return null;
    const order = orderMap[selectedOrderId];
    if (!order) return null;
    const paid = getAmountPaidForOrder(selectedOrderId);
    return {
      ...order,
      paidSoFar: paid,
      balance: Math.max(0, order.totalCost - paid),
    };
  }, [selectedOrderId, orderMap, getAmountPaidForOrder]);

  // Search hook over payment entries
  const searchablePayments = useMemo(() => {
    return dashboardPayments.map((p) => {
      const order = orderMap[p.orderId];
      const customer = order ? customerMap[order.customerId] : null;
      return {
        ...p,
        customerName: customer ? customer.fullName : 'Guest',
        styleDescription: order ? order.styleDescription : '',
      };
    });
  }, [payments, orderMap, customerMap]);

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(searchablePayments, [
    'paymentId',
    'orderId',
    'customerName',
  ]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    startIndex,
    endIndex,
  } = usePagination(filteredItems, 10);

  const handleOpenAdd = () => {
    setSelectedOrderId('');
    setAmountPaidInput('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!selectedOrderId) errors.orderId = 'Order selection is required.';
    if (!amountPaidInput || Number(amountPaidInput) <= 0) errors.amount = 'Amount to pay must be greater than zero.';
    if (selectedOrderDetails && Number(amountPaidInput) > selectedOrderDetails.balance) {
      errors.amount = `Amount to pay cannot exceed outstanding balance of ${formatCurrency(selectedOrderDetails.balance)}`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (isCustomer) {
      setModalOpen(false);
      setGatewayOpen(true);
      return;
    }

    // Add payment transaction
    addPayment({
      orderId: selectedOrderId,
      amountPaid: Number(amountPaidInput),
      balance: selectedOrderDetails.balance - Number(amountPaidInput),
    });

    addToast('Payment transaction recorded successfully.', 'success');
    setModalOpen(false);
  };

  const handlePaymentSuccess = (response) => {
    addPayment({
      orderId: selectedOrderId,
      amountPaid: Number(amountPaidInput),
      balance: selectedOrderDetails.balance - Number(amountPaidInput),
      transactionRef: response.tx_ref,
      gatewayId: response.transaction_id,
    });
    addToast('Payment successfully processed via Flutterwave!', 'success');
    setGatewayOpen(false);
  };

  const columns = [
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (val) => <span className="font-mono text-xs text-gray-500 dark:text-slate-400">{val}</span>,
    },
    {
      key: 'orderId',
      label: 'Order ID',
      render: (val) => <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-bold">{val}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      render: (val) => <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{val}</span>,
    },
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      render: (val) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(val)}</span>,
    },
    {
      key: 'balance',
      label: 'Remaining Balance',
      render: (val) => (
        <span className={`font-semibold ${val > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Date Paid',
      render: (val) => <span className="text-gray-600 dark:text-slate-400">{formatDate(val)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">
            {isCustomer ? 'My Payments' : 'Payments Ledger'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
            {isCustomer ? 'View your payment history and outstanding balances' : 'Record payments and audit outstanding balances'}
          </p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary">
          {isCustomer ? <HiCreditCard className="w-5 h-5" /> : <HiPlus className="w-5 h-5" />}
          {isCustomer ? 'Pay Online' : 'Record Payment'}
        </Button>
      </div>

      {/* Financial Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-2xl shrink-0">
            <HiBanknotes />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Total Billings</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white font-heading block mt-0.5">
              {formatCurrency(financialTotals.totalRevenue)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 text-2xl shrink-0">
            <HiCreditCard />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Payments Collected</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-heading block mt-0.5">
              {formatCurrency(financialTotals.totalCollected)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 rounded-xl flex items-center justify-center text-rose-500 dark:text-rose-400 text-2xl shrink-0">
            <HiExclamationTriangle />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Outstanding Owed</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400 font-heading block mt-0.5">
              {formatCurrency(financialTotals.outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-gray-100/80">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search payment logs by ID, order reference, customer..."
        />
        <div className="text-xs text-gray-400 font-medium">
          Showing {startIndex}-{endIndex} of {filteredItems.length} transactions
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden border-gray-100/80 shadow-md">
        <Table columns={columns} data={paginatedItems} emptyMessage="No payment transactions logged." />
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 transition-colors">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={filteredItems.length}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isCustomer ? 'Secure Online Payment Gateway' : 'Record Cash Transaction'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Select Order Reference *</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Choose Order --</option>
              {eligibleOrdersForPayment.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderId} - {customerMap[o.customerId]?.fullName} (Owes {formatCurrency(o.remainingBalance)})
                </option>
              ))}
            </select>
          </div>

          {selectedOrderDetails && (
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-xs space-y-2 transition-colors">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400 dark:text-slate-500">Sewing Style:</span>
                <span className="text-gray-700 dark:text-slate-300 font-medium">{selectedOrderDetails.styleDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400 dark:text-slate-500">Total Sewing Bill:</span>
                <span className="text-gray-700 dark:text-slate-200 font-bold">{formatCurrency(selectedOrderDetails.totalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400 dark:text-slate-500">Amount Paid So Far:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(selectedOrderDetails.paidSoFar)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 dark:border-slate-700 pt-2">
                <span className="font-bold text-gray-700 dark:text-slate-300">Outstanding Balance:</span>
                <span className="text-rose-500 dark:text-rose-400 font-bold">{formatCurrency(selectedOrderDetails.balance)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Amount Paid (₦) *</label>
            <input
              type="number"
              value={amountPaidInput}
              onChange={(e) => setAmountPaidInput(e.target.value)}
              className="input-field"
              placeholder="e.g. 15000"
              required
            />
            {formErrors.amount && <p className="text-xs text-rose-500 font-medium mt-1">{formErrors.amount}</p>}
          </div>

          {selectedOrderDetails && amountPaidInput && !formErrors.amount && (
            <div className="flex justify-between items-center text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 transition-colors">
              <span className="font-semibold">Calculated New Balance:</span>
              <span className="font-extrabold text-sm">
                {formatCurrency(Math.max(0, selectedOrderDetails.balance - Number(amountPaidInput)))}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isCustomer ? 'Pay Now' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Flutterwave Payment Modal */}
      <FlutterwavePaymentModal 
        isOpen={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={Number(amountPaidInput)}
        email={currentUser?.email}
        name={currentUser?.name}
      />
    </div>
  );
};

export default PaymentsPage;
