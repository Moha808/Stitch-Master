import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiShieldCheck,
  HiEnvelope,
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiScissors,
} from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useToast } from '../contexts/ToastContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AdminLoginPage = () => {
  const { login, logout, currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your admin email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      await login(email, password);

      // 2. Verify admin role in Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : null;

        const role = userData?.role || 'admin'; // fallback default
        if (role !== 'admin') {
          await logout();
          setError('Access Denied: This secure portal is strictly reserved for shop administrators. Please use the standard sign-in page.');
          addToast('Access Denied: Administrator role required.', 'error');
          setLoading(false);
          return;
        }
      }

      addToast('Administrator authenticated. Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your admin credentials.');
      addToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your admin email address first.', 'warning');
      setError('Enter your admin email address to request a password reset.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      addToast('Password reset link sent to your admin email.', 'success');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send admin password reset email.');
      addToast(err.message || 'Failed to send password reset email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background ambient security lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-primary-600/20 via-primary-900/10 to-transparent rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-24 right-10 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-primary-600 to-primary-800 text-white shadow-xl shadow-primary-900/40 mb-1 border border-amber-400/30">
            <HiShieldCheck className="w-8 h-8 text-amber-200" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest">
              <HiScissors className="w-3.5 h-3.5 rotate-45" />
              Secure Admin Console
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">
              Administrator Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Enter your master store credentials to access executive controls, financials, and shop management.
            </p>
          </div>
        </div>

        {/* Admin Login Card */}
        <Card padding="lg" className="border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-black/60 rounded-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-550/15 bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium leading-relaxed animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Admin Email Address
              </label>
              <div className="relative">
                <HiEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stitchmaster.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              className="py-3 mt-4 bg-gradient-to-r from-amber-500 via-primary-600 to-primary-700 hover:from-amber-400 hover:to-primary-600 text-white font-bold shadow-lg shadow-primary-900/50 border-0"
            >
              Sign In to Admin Dashboard
              <HiArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        {/* Footer Navigation */}
        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-slate-400">
            Not an administrator?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline">
              Go to Staff & Customer Login
            </Link>
          </p>
          <p className="text-[11px] text-slate-500">
            <Link to="/" className="hover:text-slate-400 transition-colors">
              &larr; Back to StitchMaster Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
