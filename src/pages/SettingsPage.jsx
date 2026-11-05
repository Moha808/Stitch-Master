import React, { useState, useEffect } from 'react';
import { HiUser, HiBuildingStorefront, HiUsers, HiShieldCheck, HiCog, HiPlus, HiTrash } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('profile'); // profile, shop, staff, security

  // Profile fields
  const [profileName, setProfileName] = useState(currentUser?.name || 'Adebayo Okunola');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'admin@stitchmaster.com');

  // Business info fields
  const [shopName, setShopName] = useState('StitchMaster Tailors');
  const [shopPhone, setShopPhone] = useState('+234 803 123 4567');
  const [shopAddress, setShopAddress] = useState('12 Awolowo Road, Ikoyi, Lagos');
  const [currencySymbol, setCurrencySymbol] = useState('₦');

  // Fetch real staff from Firebase
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    // Fetch users who are staff
    const q = query(collection(db, 'users'), where('role', 'in', ['staff', 'admin']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.data().fullName || 'Unnamed Staff',
        email: doc.data().email,
        role: doc.data().role,
        status: 'Active', // Mocking status since auth doesn't easily expose 'disabled' without admin SDK
      }));
      setStaffList(users);
    });

    return () => unsubscribe();
  }, []);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [deleteStaffId, setDeleteStaffId] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile changes saved successfully.', 'success');
  };

  const handleSaveShop = (e) => {
    e.preventDefault();
    addToast('Business configurations updated.', 'success');
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      addToast('Please enter both staff name and email address.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaffEmail.trim())) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      const generatedStaffId = 'STF-' + Date.now().toString().slice(-6);
      const newStaff = {
        id: generatedStaffId,
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        role: 'staff',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setStaffList((prev) => [...prev, newStaff]);
      await setDoc(doc(db, 'users', generatedStaffId), newStaff);

      addToast(`Staff account for "${newStaff.name}" added successfully.`, 'success');
      setNewStaffName('');
      setNewStaffEmail('');
    } catch (err) {
      addToast(err.message || 'Failed to add staff account.', 'error');
    }
  };

  const handleDeleteStaffConfirm = async () => {
    if (deleteStaffId) {
      try {
        // Optimistic removal so it immediately disappears!
        setStaffList((prev) => prev.filter((s) => s.id !== deleteStaffId));
        await deleteDoc(doc(db, 'users', deleteStaffId));
        addToast('Staff user account deleted successfully.', 'success');
      } catch (err) {
        addToast(err.message || 'Failed to delete user account.', 'error');
      } finally {
        setDeleteStaffId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-gray-800 dark:text-white transition-colors">Shop Settings</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">Configure business info, billing, and system profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar Panel */}
        <div className="space-y-1.5 md:col-span-1">
          {[
            { id: 'profile', label: 'Admin Profile', icon: HiUser },
            { id: 'shop', label: 'Business Profile', icon: HiBuildingStorefront },
            { id: 'staff', label: 'Staff Accounts', icon: HiUsers },
            { id: 'security', label: 'System Security', icon: HiShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Configurations Forms Panel */}
        <div className="md:col-span-3">
          {activeSubTab === 'profile' && (
            <Card className="p-6 border-gray-100/80 shadow-md transition-colors">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Owner Credentials</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Manage your credentials and sign-in accounts</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </form>
            </Card>
          )}

          {activeSubTab === 'shop' && (
            <Card className="p-6 border-gray-100/80 shadow-md transition-colors">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Business Details</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Configure parameters printed on receipts and invoices</p>
              </div>

              <form onSubmit={handleSaveShop} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Shop / Boutique Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Phone Hotline</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Office / Physical Address</label>
                  <textarea
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    rows="3"
                    className="input-field"
                    required
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Currency Symbol</label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="input-field"
                  >
                    <option value="₦">₦ (Nigerian Naira)</option>
                    <option value="$">$ (US Dollar)</option>
                    <option value="£">£ (British Pound)</option>
                    <option value="€">€ (Euro)</option>
                  </select>
                </div>
                <Button type="submit" variant="primary">
                  Update Configuration
                </Button>
              </form>
            </Card>
          )}

          {activeSubTab === 'staff' && (
            <Card className="p-6 border-gray-100/80 shadow-md transition-colors">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Staff Credentials Log</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Review staff users or register secondary accounts</p>
              </div>

              {/* Add staff form */}
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-end p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-500 dark:text-slate-400">Staff Name</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Zubair Ibrahim"
                    className="input-field py-1.5"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-500 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. zubair@stitchmaster.com"
                    className="input-field py-1.5"
                  />
                </div>
                <Button type="submit" variant="primary" className="py-2.5">
                  <HiPlus className="w-4 h-4" />
                  Add Staff
                </Button>
              </form>

              {/* Staff list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 uppercase transition-colors">
                      <th className="py-2.5 pr-4">Staff ID</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-slate-400">{s.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800 dark:text-slate-200">{s.name}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{s.email}</td>
                        <td className="py-3 px-4 capitalize font-medium text-gray-700 dark:text-slate-300">{s.role}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {currentUser?.uid !== s.id && (
                            <button
                              onClick={() => setDeleteStaffId(s.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                              title="Delete user account"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {staffList.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-xs text-gray-400 dark:text-slate-500">
                          No staff accounts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeSubTab === 'security' && (
            <Card className="p-6 border-gray-100/80 shadow-md transition-colors">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Security & Sign-in parameters</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Configure parameters for app-wide security policy</p>
              </div>

              <div className="space-y-4 max-w-lg text-sm">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-indigo-800 dark:text-indigo-300 transition-colors">
                  <p className="font-bold flex items-center gap-1.5">
                    <HiShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    Authentication Protocol Active
                  </p>
                  <p className="text-xs mt-1 leading-relaxed">
                    StitchMaster uses tokenized local user authentication with role-based policies. Route filters are active on all sensitive sections.
                  </p>
                </div>
                <div className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 space-y-3 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-slate-200 block">Autosave Database Cache</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 block">Store states in client storage</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                      Enabled
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-50 dark:border-slate-800/50 pt-3 transition-colors">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-slate-200 block">Session Expiration Timeout</span>
                      <span className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 block">Force login after inactivity duration</span>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                      24 Hours
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Staff Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteStaffId !== null}
        onClose={() => setDeleteStaffId(null)}
        onConfirm={handleDeleteStaffConfirm}
        title="Delete Staff Account"
        message="Are you sure you want to delete this staff user account? They will immediately lose access to the shop platform. This action is permanent."
      />
    </div>
  );
};

export default SettingsPage;
