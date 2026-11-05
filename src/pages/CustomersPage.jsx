import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiUser } from 'react-icons/hi2';
import { useCustomers } from '../contexts/CustomerContext';
import { useOrders } from '../contexts/OrderContext';
import useAuth from '../hooks/useAuth';
import useSearch from '../hooks/useSearch';
import usePagination from '../hooks/usePagination';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import { useToast } from '../contexts/ToastContext';
import { getInitials, formatDate } from '../utils/formatters';

const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { orders } = useOrders();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Modals & States
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Search hook
  const { searchQuery, setSearchQuery, filteredItems } = useSearch(customers, ['fullName', 'phone', 'email', 'address']);

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

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFullName(customer.fullName);
    setPhone(customer.phone);
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = 'Full Name is required.';
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full Name must be at least 2 characters.';
    }

    const trimmedPhone = phone.trim();
    const phoneRegex = /^[+]?[\d\s-]{10,16}$/;
    if (!trimmedPhone) {
      errors.phone = 'Phone Number is required.';
    } else if (!phoneRegex.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid phone number (e.g. +2348031234567 or 08012345678).';
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. client@example.com).';
    }

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      errors.address = 'Residential Address is required.';
    } else if (trimmedAddress.length < 5) {
      errors.address = 'Address must be at least 5 characters for accurate delivery.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      fullName: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      address: trimmedAddress,
    };

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.customerId, payload);
        addToast('Customer profile updated successfully!', 'success');
      } else {
        await addCustomer(payload);
        addToast('New customer profile registered! Updated on dashboard.', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Failed to save customer.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteCustomer(deleteId);
        addToast('Customer record deleted successfully.', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to delete customer.', 'error');
      } finally {
        setDeleteId(null);
      }
    }
  };

  // Columns definition
  const columns = [
    {
      key: 'fullName',
      label: 'Customer Name',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/customers/${row.customerId}`)}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center shadow-sm uppercase group-hover:scale-105 transition-transform">
            {getInitials(value)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {value}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{row.customerId}</p>
          </div>
        </button>
      ),
    },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email', render: (val) => val || <span className="text-gray-400 dark:text-slate-500 italic">None</span> },
    {
      key: 'ordersCount',
      label: 'Total Orders',
      render: (_, row) => {
        const count = orders.filter((o) => o.customerId === row.customerId).length;
        return <span className="font-semibold text-gray-700 dark:text-slate-350">{count}</span>;
      },
    },
    {
      key: 'createdAt',
      label: 'Registered On',
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenEditModal(row)}
            variant="ghost"
            className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"
          >
            <HiPencil className="w-4.5 h-4.5" />
          </Button>
          {isAdmin && (
            <Button
              onClick={() => setDeleteId(row.customerId)}
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white">Customers</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Record customer profiles and contact details</p>
        </div>
        <Button onClick={handleOpenAddModal} variant="primary">
          <HiPlus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>

      {/* Filter and search bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-gray-100/80 dark:border-slate-800/80">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers by name, phone, email..."
        />
        <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">
          Showing {startIndex}-{endIndex} of {filteredItems.length} records
        </div>
      </Card>

      {/* Customer Data Table */}
      <Card className="overflow-hidden border-gray-100/80 dark:border-slate-800/80 shadow-md">
        <Table columns={columns} data={paginatedItems} emptyMessage="No customers found. Try adding a customer first." />
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800">
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

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Register New Customer'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`input-field ${formErrors.fullName ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="e.g. Chidi Okafor"
              required
            />
            {formErrors.fullName && <p className="text-xs text-rose-500 font-medium">{formErrors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`input-field ${formErrors.phone ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="e.g. +2348031234567"
              required
            />
            {formErrors.phone && <p className="text-xs text-rose-500 font-medium">{formErrors.phone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${formErrors.email ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="e.g. customer@stitchmaster.com"
              required
            />
            {formErrors.email && <p className="text-xs text-rose-500 font-medium">{formErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Residential Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
              className={`input-field ${formErrors.address ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : ''}`}
              placeholder="e.g. 12 Awolowo Road, Ikoyi, Lagos"
              required
            ></textarea>
            {formErrors.address && <p className="text-xs text-rose-500 font-medium">{formErrors.address}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Profile"
        message="Are you sure you want to delete this customer record? All linked order records and measurements will remain, but the customer link will be broken. This action is permanent."
      />
    </div>
  );
};

export default CustomersPage;
