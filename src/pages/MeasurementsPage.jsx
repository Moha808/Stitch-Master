import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUser, HiPlus, HiPrinter, HiClipboardDocumentList, HiUsers } from 'react-icons/hi2';
import { useCustomers } from '../contexts/CustomerContext';
import { useMeasurements } from '../contexts/MeasurementContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { getInitials, formatDate } from '../utils/formatters';
import { MALE_MEASUREMENTS, FEMALE_MEASUREMENTS } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

const MeasurementsPage = () => {
  const { customers } = useCustomers();
  const { getMeasurementsByCustomer, addMeasurement } = useMeasurements();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [gender, setGender] = useState('male');

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

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.customerId === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const customerMeasurements = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getMeasurementsByCustomer(selectedCustomerId);
  }, [selectedCustomerId, getMeasurementsByCustomer]);

  const latestMeas = customerMeasurements[0] || null;

  const handleOpenAdd = () => {
    if (!selectedCustomerId) {
      addToast('Please select a customer first.', 'warning');
      return;
    }
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
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      customerId: selectedCustomerId,
      neck: gender === 'male' ? Number(measForm.neck) || 0 : 0,
      chest: gender === 'male' ? Number(measForm.chest) || 0 : 0,
      waist: Number(measForm.waist) || 0,
      hip: Number(measForm.hip) || 0,
      shoulder: Number(measForm.shoulder) || 0,
      sleeveLength: Number(measForm.sleeveLength) || 0,
      trouserLength: gender === 'male' ? Number(measForm.trouserLength) || 0 : 0,
      bust: gender === 'female' ? Number(measForm.bust) || 0 : 0,
    };

    addMeasurement(payload);
    addToast('Measurements logged successfully.', 'success');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">Measurements Log</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">Record and review customer size measurements</p>
      </div>

      {/* Select Customer */}
      <Card className="p-6 border-gray-100/80 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Select Customer Profile</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>
          {selectedCustomerId && (
            <div className="flex items-end gap-2 pt-5">
              <Button onClick={handleOpenAdd} variant="primary">
                <HiPlus className="w-5 h-5" />
                New Spec
              </Button>
              <Button onClick={() => window.print()} variant="secondary">
                <HiPrinter className="w-5 h-5" />
                Print Spec
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Selected Customer Specifications */}
      {selectedCustomerId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 h-full border-gray-100/80 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white transition-colors">Current Standard Specs</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Dimensions in inches for {selectedCustomer?.fullName}</p>
                </div>
                <button
                  onClick={() => navigate(`/customers/${selectedCustomerId}`)}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline uppercase transition-colors"
                >
                  View Profile
                </button>
              </div>

              {latestMeas ? (
                <div>
                  {latestMeas.bust > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {FEMALE_MEASUREMENTS.map((m) => (
                        <div key={m.key} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-center hover:shadow-sm transition-colors">
                          <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase block">{m.label}</span>
                          <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400 mt-1 block">
                            {latestMeas[m.key] || '0'}"
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {MALE_MEASUREMENTS.map((m) => (
                        <div key={m.key} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-center hover:shadow-sm transition-colors">
                          <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold uppercase block">{m.label}</span>
                          <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400 mt-1 block">
                            {latestMeas[m.key] || '0'}"
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HiClipboardDocumentList className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">No specs recorded yet</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Please log measurements for this customer.</p>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6 h-full border-gray-100/80 shadow-md">
              <div className="mb-4">
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white transition-colors">Log History</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Past measurements logged in the system</p>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {customerMeasurements.map((m) => (
                  <div
                    key={m.measurementId}
                    className="flex flex-col p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 dark:text-slate-300">{formatDate(m.createdAt)}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold font-mono uppercase bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-gray-100 dark:border-slate-700 shadow-sm">
                        {m.measurementId}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      {m.bust > 0
                        ? `Bust: ${m.bust}" | Waist: ${m.waist}" | Hip: ${m.hip}"`
                        : `Neck: ${m.neck}" | Chest: ${m.chest}" | Waist: ${m.waist}"`}
                    </div>
                  </div>
                ))}
                {customerMeasurements.length === 0 && (
                  <div className="text-center py-12 text-gray-400 dark:text-slate-500">No logs found.</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 text-center border-gray-100/80 shadow-md">
          <HiUsers className="w-16 h-16 text-gray-200 mb-4 animate-pulse-soft" />
          <h3 className="text-lg font-bold font-heading text-gray-700 dark:text-slate-300 transition-colors">Choose a Customer</h3>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1 max-w-sm">
            Please select a customer profile from the dropdown selector above to see their dimensions log.
          </p>
        </Card>
      )}

      {/* Log measurements modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log New Body Specs"
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 pl-2">Customer Profile Mode</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                Male (Trouser, Neck)
              </label>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 cursor-pointer">
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
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Neck (inches)</label>
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
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Chest (inches)</label>
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
                  <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Trouser Length (inches)</label>
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
                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Bust (inches)</label>
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
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Waist (inches)</label>
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
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Hip (inches)</label>
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
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Shoulder (inches)</label>
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
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Sleeve Length (inches)</label>
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
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Specifications
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print specification Sheet layout */}
      {selectedCustomer && latestMeas && (
        <div className="hidden print:block text-black p-8 font-sans">
          <h1 className="text-3xl font-extrabold text-center border-b-2 border-gray-800 pb-4">STITCHMASTER SPEC SHEET</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="font-bold">Customer: <span className="font-medium">{selectedCustomer.fullName}</span></p>
              <p className="font-bold mt-1">Phone: <span className="font-medium">{selectedCustomer.phone}</span></p>
            </div>
            <div className="text-right">
              <p className="font-bold">Date printed: <span className="font-medium">{formatDate(new Date())}</span></p>
              <p className="font-bold mt-1">Customer ID: <span className="font-medium">{selectedCustomer.customerId}</span></p>
            </div>
          </div>

          <div className="mt-8 border border-gray-300 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-bold uppercase tracking-wider text-center border-b pb-3 mb-6 bg-gray-50">Dimensions Spec Overview</h2>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementsPage;
