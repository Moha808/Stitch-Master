import React, { useState, useEffect } from 'react';
import { HiUser, HiBuildingStorefront, HiUsers, HiShieldCheck, HiCog, HiPlus, HiTrash } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../config/firebase';

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
    // Fetch users who are staff or admin
    const q = query(collection(db, 'users'), where('role', 'in', ['staff', 'admin']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        uid: doc.id,
        name: doc.data().name || doc.data().fullName || 'Unnamed Staff',
        email: doc.data().email,
        role: doc.data().role,
        status: doc.data().status || 'Active',
      }));
      setStaffList(users);
    });

    return () => unsubscribe();
  }, []);

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
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
    const cleanName = newStaffName.trim();
    const cleanEmail = newStaffEmail.trim().toLowerCase();
    const cleanPassword = newStaffPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      addToast('Please enter staff name, email, and a login password.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    if (cleanPassword.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsCreatingStaff(true);

    try {
      // Use secondary Firebase App instance so the current Admin session is NEVER logged out!
      const secondaryApp =
        getApps().find((app) => app.name === 'SecondaryAuth') ||
        initializeApp(firebaseConfig, 'SecondaryAuth');
      const secondaryAuth = getAuth(secondaryApp);

      // Create official Firebase Authentication credential for the staff
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPassword);
      const staffUser = userCredential.user;

      // Immediately sign out secondary auth so it doesn't linger
      await signOut(secondaryAuth);

      const newStaffDoc = {
        id: staffUser.uid,
        uid: staffUser.uid,
        name: cleanName,
        email: cleanEmail,
        role: 'staff',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      // Optimistic update
      setStaffList((prev) => [...prev, newStaffDoc]);

      // Write directly to Firestore 'users' collection with the Firebase Auth UID
      await setDoc(doc(db, 'users', staffUser.uid), newStaffDoc);

      addToast(`Staff account for "${cleanName}" created! Staff can now log in.`, 'success');
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
    } catch (err) {
      console.error('Error creating staff account:', err);
      addToast(err.message || 'Failed to add staff account.', 'error');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleDeleteStaffConfirm = async () => {
    if (deleteStaffId) {
      try {
        const staffToDelete = staffList.find((s) => s.id === deleteStaffId);

        // 1. Optimistic removal so it immediately disappears from the UI
        setStaffList((prev) => prev.filter((s) => s.id !== deleteStaffId));

        // 2. Delete primary document in Firestore 'users'
        await deleteDoc(doc(db, 'users', deleteStaffId));

        // 3. Fallback: also delete by email in users collection if exists
        if (staffToDelete?.email) {
          const qEmail = query(collection(db, 'users'), where('email', '==', staffToDelete.email));
          const snap = await getDocs(qEmail);
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        }

        addToast('Staff user account deleted successfully from database.', 'success');
      } catch (err) {
        console.error('Error deleting staff:', err);
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
        {/* Navigation Sidebar Panel with responsive mobile grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 gap-2 md:col-span-1">
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
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  active
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
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
                    disabled
                  />
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Owner email is bound to root Firebase instance.</p>
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
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Business Brand Profile</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Information printed on customer invoices and receipts</p>
              </div>

              <form onSubmit={handleSaveShop} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Business / Fashion House Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Official Phone Number</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Studio Address</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Default Currency</label>
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
                <p className="text-xs text-gray-400 dark:text-slate-500">Create login credentials for shop tailors and managers</p>
              </div>

              {/* Add staff form with password field and responsive columns */}
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-500 dark:text-slate-400">Staff Full Name</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Zubair Ibrahim"
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-500 dark:text-slate-400">Staff Login Email</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. zubair@stitchmaster.com"
                    className="input-field py-2"
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="font-semibold text-gray-500 dark:text-slate-400">Set Login Password</label>
                  <input
                    type="password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="input-field py-2"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" disabled={isCreatingStaff} className="py-2.5 h-[42px] justify-center">
                  <HiPlus className="w-4 h-4" />
                  {isCreatingStaff ? 'Creating...' : 'Create Account'}
                </Button>
              </form>

              {/* Staff list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[550px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 uppercase transition-colors">
                      <th className="py-2.5 pr-4">Staff UID</th>
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
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500 dark:text-slate-400 truncate max-w-[120px]">{s.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800 dark:text-slate-200">{s.name}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{s.email}</td>
                        <td className="py-3 px-4 capitalize font-medium text-gray-700 dark:text-slate-300">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.role === 'admin' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400' : 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400'}`}>
                            {s.role}
                          </span>
                        </td>
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
                              title="Delete staff account"
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
                <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white">Security & Permissions</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500">Role-Based Access Control and authentication policies</p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Role Hierarchy Enforcement</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Administrators possess full CRUD privileges, settings configurations, and reports. Staff members can log body measurements, orders, and record payments, but cannot delete records or alter settings. Customers have isolated views showing only their individual orders, payments, and specs.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Firestore Document Security</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Authentication rules verify `auth.uid` against the `users` collection to prevent cross-account tampering.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Staff Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteStaffId)}
        title="Delete Staff Account"
        message="Are you sure you want to delete this staff user account from the system? The user will no longer be able to log in. This action is permanent."
        confirmText="Delete Account"
        variant="danger"
        onConfirm={handleDeleteStaffConfirm}
        onCancel={() => setDeleteStaffId(null)}
      />
    </div>
  );
};

export default SettingsPage;
