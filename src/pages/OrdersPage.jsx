import React, { useState, useMemo } from 'react';
import { HiPlus, HiPencil, HiTrash, HiPrinter, HiEye } from 'react-icons/hi2';
import { useOrders } from '../contexts/OrderContext';
import { useCustomers } from '../contexts/CustomerContext';
import { usePayments, usePayments as usePaymentContext } from '../contexts/PaymentContext';
import useAuth from '../hooks/useAuth';
import useSearch from '../hooks/useSearch';
import usePagination from '../hooks/usePagination';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ORDER_STATUSES, FABRIC_TYPES } from '../utils/constants';

const OrdersPage = () => {
  const { orders, addOrder, updateOrder, deleteOrder, updateOrderStatus } = useOrders();
  const { customers } = useCustomers();
  const { addPayment, getAmountPaidForOrder } = usePayments();
  const { isAdmin, isStaff, isCustomer, currentUser } = useAuth();
  const { addToast } = useToast();

  // Customer identification for strict customer data isolation
  const matchedCustomer = useMemo(() => {
    if (!isCustomer || !currentUser) return null;
    const userEmail = currentUser.email?.trim().toLowerCase();
    const userCustId = currentUser.customerId;
    return (
      customers.find(
        (c) =>
          (userCustId && (c.customerId === userCustId || c.id === userCustId)) ||
          (c.email && userEmail && c.email.trim().toLowerCase() === userEmail)
      ) || null
    );
  }, [customers, currentUser, isCustomer]);

  const activeCustomerId = matchedCustomer?.customerId || currentUser?.customerId;

  // Filter orders strictly if user role is customer
  const filteredOrdersByRole = useMemo(() => {
    if (isCustomer) {
      if (!activeCustomerId && !currentUser?.email) return [];
      const userEmail = currentUser?.email?.trim().toLowerCase();
      return orders.filter(
        (o) =>
          (activeCustomerId && o.customerId === activeCustomerId) ||
          (userEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === userEmail)
      );
    }
    return orders;
  }, [orders, activeCustomerId, currentUser, isCustomer]);

  // States
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, In Progress, Ready, Delivered
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [styleDescription, setStyleDescription] = useState('');
  const [fabricType, setFabricType] = useState('Cotton');
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Customer mapping
  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.customerId] = c;
    });
    return map;
  }, [customers]);

  // Tab Filtering
  const tabFilteredOrders = useMemo(() => {
    if (activeTab === 'All') return filteredOrdersByRole;
    return filteredOrdersByRole.filter((o) => o.status === activeTab);
  }, [filteredOrdersByRole, activeTab]);

  // Search hook
  // We want to search by Order ID, style description, fabric, and customer name.
  // Since customer name is nested/referenced by customerId, we'll augment our search items or search fields
  const searchableOrders = useMemo(() => {
    return tabFilteredOrders.map((o) => ({
      ...o,
      customerName: customerMap[o.customerId]?.fullName || '',
    }));
  }, [tabFilteredOrders, customerMap]);

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(searchableOrders, [
    'orderId',
    'customerName',
    'styleDescription',
    'fabricType',
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

  // Status counters for badges
  const statusCounts = useMemo(() => {
    const counts = {
      All: filteredOrdersByRole.length,
      Pending: filteredOrdersByRole.filter((o) => o.status === 'Pending').length,
      'In Progress': filteredOrdersByRole.filter((o) => o.status === 'In Progress').length,
      Ready: filteredOrdersByRole.filter((o) => o.status === 'Ready').length,
      Delivered: filteredOrdersByRole.filter((o) => o.status === 'Delivered').length,
    };
    return counts;
  }, [filteredOrdersByRole]);

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setSelectedCustomerId('');
    setStyleDescription('');
    setFabricType('Cotton');
    setQuantity(1);
    setTotalCost('');
    setDepositAmount('');
    setDeliveryDate('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setSelectedCustomerId(order.customerId);
    setStyleDescription(order.styleDescription);
    setFabricType(order.fabricType);
    setQuantity(order.quantity);
    setTotalCost(order.totalCost);
    setDepositAmount('');
    setDeliveryDate(order.deliveryDate);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !totalCost || !styleDescription) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    // Also store the customer's email on the order for reliable customer-side lookups
    const selectedCustomer = customerMap[selectedCustomerId];
    const payload = {
      customerId: selectedCustomerId,
      customerEmail: selectedCustomer?.email?.toLowerCase() || '',
      styleDescription,
      fabricType,
      quantity: Number(quantity),
      totalCost: Number(totalCost),
      deliveryDate,
    };

    if (editingOrder) {
      await updateOrder(editingOrder.orderId, payload);
      addToast('Order updated successfully.', 'success');
    } else {
      const created = await addOrder(payload);
      // If there's an initial deposit, record it in PaymentContext
      if (depositAmount && Number(depositAmount) > 0) {
        await addPayment({
          orderId: created.orderId,
          amountPaid: Number(depositAmount),
          balance: Number(totalCost) - Number(depositAmount),
        });
      } else {
        // Record zero payment to initialize balance ledger
        await addPayment({
          orderId: created.orderId,
          amountPaid: 0,
          balance: Number(totalCost),
        });
      }
      addToast('New order commission recorded.', 'success');
    }
    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteOrder(deleteId);
      addToast('Order record removed from system.', 'success');
      setDeleteId(null);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast(`Order status updated to ${newStatus}`, 'success');
  };

  const handleOpenInvoice = (order) => {
    setInvoiceOrder(order);
  };

  // Columns definition
  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (val) => <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-bold">{val}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{val}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{customerMap[row.customerId]?.phone}</p>
        </div>
      ),
    },
    {
      key: 'styleDescription',
      label: 'Style Description',
      render: (val) => <span className="max-w-[200px] truncate block text-sm text-gray-600 dark:text-slate-400">{val}</span>,
    },
    { key: 'fabricType', label: 'Fabric' },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val, row) => (
        <div>
          {isCustomer ? (
            <StatusBadge status={val} />
          ) : (
            <select
              value={val}
              onChange={(e) => handleStatusChange(row.orderId, e.target.value)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/10 cursor-pointer"
            >
              {Object.values(ORDER_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      render: (val) => <span className="font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(val)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenInvoice(row)}
            variant="ghost"
            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"
          >
            <HiEye className="w-4.5 h-4.5" />
          </Button>
          {!isCustomer && (
            <Button
              onClick={() => handleOpenEdit(row)}
              variant="ghost"
              className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"
            >
              <HiPencil className="w-4.5 h-4.5" />
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={() => setDeleteId(row.orderId)}
              variant="ghost"
              className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
            >
              <HiTrash className="w-4.5 h-4.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">Orders</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">Track custom sewing commissions and deliveries</p>
        </div>
        {!isCustomer && (
          <Button onClick={handleOpenAdd} variant="primary">
            <HiPlus className="w-5 h-5" />
            Create Order
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto pb-px transition-colors">
        {['All', 'Pending', 'In Progress', 'Ready', 'Delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 pb-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            {tab}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
              }`}
            >
              {statusCounts[tab] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search and summary panel */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-gray-100/80">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders by ID, style, customer..."
        />
        <div className="text-xs text-gray-400 font-medium">
          Showing {startIndex}-{endIndex} of {filteredItems.length} orders
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden border-gray-100/80 shadow-md">
        <Table columns={columns} data={paginatedItems} emptyMessage="No orders found matching the filter." />
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

      {/* Create / Edit Order Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? 'Edit Production Order' : 'Create Custom Sewing Order'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Customer Profile *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Style Description *</label>
            <textarea
              value={styleDescription}
              onChange={(e) => setStyleDescription(e.target.value)}
              rows="3"
              className="input-field"
              placeholder="e.g. Senator suit with short sleeve and gold lining design"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Fabric Type</label>
              <select
                value={fabricType}
                onChange={(e) => setFabricType(e.target.value)}
                className="input-field"
              >
                {FABRIC_TYPES.map((fab) => (
                  <option key={fab} value={fab}>
                    {fab}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Price (₦) *</label>
              <input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                className="input-field"
                placeholder="e.g. 45000"
                required
              />
            </div>

            {!editingOrder && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Initial Deposit (₦)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 20000"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Delivery Date *</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tailoring Order"
        message="Are you sure you want to delete this order? This will permanently erase the order record and any associated payment balances. This action is irreversible."
      />

      {/* Invoice Modal Preview */}
      {invoiceOrder && (
        <Modal
          isOpen={invoiceOrder !== null}
          onClose={() => setInvoiceOrder(null)}
          title="Order Receipt / Invoice"
          size="md"
        >
          <div className="space-y-6 p-2">
            <div id="invoice-print" className="bg-white dark:bg-slate-900 p-4 rounded-xl transition-colors">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400">STITCHMASTER</h2>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">High Fashion & Tailoring Services</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-slate-200">Invoice / Receipt</h3>
                  <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">{invoiceOrder.orderId}</p>
                </div>
              </div>

              {/* Customer details */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div>
                  <p className="font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Client Profile</p>
                  <p className="font-semibold text-gray-800 dark:text-slate-200 mt-1">{customerMap[invoiceOrder.customerId]?.fullName}</p>
                  <p className="text-gray-500 dark:text-slate-400 mt-0.5">{customerMap[invoiceOrder.customerId]?.phone}</p>
                  {customerMap[invoiceOrder.customerId]?.address && (
                    <p className="text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{customerMap[invoiceOrder.customerId]?.address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Details</p>
                  <p className="mt-1 text-gray-600 dark:text-slate-300">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Date Ordered:</span> {formatDate(invoiceOrder.createdAt)}
                  </p>
                  <p className="mt-0.5 text-gray-600 dark:text-slate-300">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Delivery Due:</span> {formatDate(invoiceOrder.deliveryDate)}
                  </p>
                  <p className="mt-0.5 text-gray-600 dark:text-slate-300">
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Status:</span> {invoiceOrder.status}
                  </p>
                </div>
              </div>

              {/* Details table */}
              <div className="border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden mb-6 transition-colors">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-bold">
                      <th className="py-2.5 px-3">Sewing Style / Spec details</th>
                      <th className="py-2.5 px-3">Fabric</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50 dark:border-slate-800">
                      <td className="py-3 px-3 font-semibold text-gray-700 dark:text-slate-300">{invoiceOrder.styleDescription}</td>
                      <td className="py-3 px-3 text-gray-600 dark:text-slate-400">{invoiceOrder.fabricType}</td>
                      <td className="py-3 px-3 text-center text-gray-600 dark:text-slate-400">{invoiceOrder.quantity}</td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-800 dark:text-slate-200">{formatCurrency(invoiceOrder.totalCost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Balance ledger calculation */}
              <div className="flex justify-end text-xs">
                <div className="w-48 space-y-2 border-t border-gray-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-400 dark:text-slate-500">Total Bill:</span>
                    <span className="text-gray-800 dark:text-slate-200">{formatCurrency(invoiceOrder.totalCost)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-400 dark:text-slate-500">Total Paid:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(getAmountPaidForOrder(invoiceOrder.orderId))}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-gray-200 dark:border-slate-700 pt-2 text-sm">
                    <span className="text-gray-700 dark:text-slate-300">Balance Owed:</span>
                    <span className={invoiceOrder.totalCost - getAmountPaidForOrder(invoiceOrder.orderId) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {formatCurrency(invoiceOrder.totalCost - getAmountPaidForOrder(invoiceOrder.orderId))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 no-print pt-4 border-t border-gray-200 dark:border-slate-800">
              <Button onClick={() => setInvoiceOrder(null)} variant="secondary">
                Close
              </Button>
              <Button onClick={() => window.print()} variant="primary">
                <HiPrinter className="w-4.5 h-4.5" />
                Print Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Print-only invoice layout */}
      {invoiceOrder && (
        <div className="hidden print:block text-black p-8 font-sans w-full">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide">STITCHMASTER TAILORS</h1>
              <p className="text-xs text-gray-500 mt-1">High Fashion & Bespoke Tailoring Services</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Invoice / Receipt</h2>
              <p className="text-xs font-mono font-bold mt-1">Order Ref: {invoiceOrder.orderId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-xs mb-8">
            <div>
              <p className="font-bold uppercase tracking-wider text-gray-500">Billed To</p>
              <p className="font-semibold text-lg mt-1">{customerMap[invoiceOrder.customerId]?.fullName}</p>
              <p className="mt-1">Phone: {customerMap[invoiceOrder.customerId]?.phone}</p>
              {customerMap[invoiceOrder.customerId]?.address && (
                <p className="mt-1">Address: {customerMap[invoiceOrder.customerId]?.address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold uppercase tracking-wider text-gray-500">Order Metadata</p>
              <p className="mt-1"><span className="font-semibold">Order Date:</span> {formatDate(invoiceOrder.createdAt)}</p>
              <p className="mt-1"><span className="font-semibold">Expected Delivery:</span> {formatDate(invoiceOrder.deliveryDate)}</p>
              <p className="mt-1"><span className="font-semibold">Work Progress:</span> {invoiceOrder.status}</p>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                  <th className="py-2.5 px-3">Description of Sew / Styling Specs</th>
                  <th className="py-2.5 px-3">Fabric</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-3 font-semibold">{invoiceOrder.styleDescription}</td>
                  <td className="py-4 px-3">{invoiceOrder.fabricType}</td>
                  <td className="py-4 px-3 text-center">{invoiceOrder.quantity}</td>
                  <td className="py-4 px-3 text-right font-semibold">{formatCurrency(invoiceOrder.totalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end text-sm">
            <div className="w-64 space-y-2 border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(invoiceOrder.totalCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600">
                <span className="text-gray-500">Total Payments:</span>
                <span>{formatCurrency(getAmountPaidForOrder(invoiceOrder.orderId))}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-double pt-2 text-lg">
                <span>Total Balance Due:</span>
                <span className={invoiceOrder.totalCost - getAmountPaidForOrder(invoiceOrder.orderId) > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {formatCurrency(invoiceOrder.totalCost - getAmountPaidForOrder(invoiceOrder.orderId))}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t pt-6 text-center text-[10px] text-gray-400">
            Thank you for your patronage! Deliveries are subject to terms and specifications stated.
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
