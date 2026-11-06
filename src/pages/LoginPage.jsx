import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiScissors, HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiUser } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useToast } from '../contexts/ToastContext';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const LoginPage = () => {
  const { login, currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(!location.state?.isRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        addToast('Welcome back to StitchMaster!', 'success');
        navigate('/dashboard');
      } else {
        // Register flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const timestamp = new Date().toISOString();
        
        // Generate matching customer ID
        const customerId = 'CUS-' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 6);
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = name.trim();

        // Save to Firestore users collection with customerId and customer role
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: cleanName,
          email: cleanEmail,
          role: 'customer',
          customerId: customerId,
          createdAt: timestamp
        });

        // Also create a corresponding customer profile so Staff/Admin can manage specs and place orders for them
        await setDoc(doc(db, 'customers', customerId), {
          id: customerId,
          customerId,
          fullName: cleanName,
          email: cleanEmail,
          phone: '',
          address: '',
          createdAt: timestamp
        });
        
        addToast('Account created successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address first.', 'warning');
      setError('Please enter your email address to reset your password.');
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      addToast('Password reset email sent! Check your inbox.', 'success');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
      addToast(err.message || 'Failed to send password reset email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* LEFT SIDE: Brand & Graphic (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative items-center justify-center p-12 overflow-hidden">
        {/* Animated geometric background patterns */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl -translate-x-20 -translate-y-20 animate-pulse-soft"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full filter blur-3xl translate-x-32 translate-y-32"></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-lg">
              <HiScissors className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <span className="text-3xl font-bold font-heading text-accent-400 tracking-wide">
                StitchMaster
              </span>
              <p className="text-[10px] text-primary-200 tracking-widest uppercase">
                Tailoring Management System
              </p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold font-heading leading-tight mb-4">
            Digitize your tailoring operations seamlessly.
          </h2>
          <p className="text-primary-100 text-lg mb-8 font-light leading-relaxed">
            Manage customers, log measurements, track orders, automate billing, and view business analytics in one premium dashboard.
          </p>

          {/* Bullet points */}
          <div className="space-y-4">
            {[
              'Customer Profile & Custom Measurement Records',
              'Order Status & Production Lifecycle Tracking',
              'Payment Balance & Receipts Auto-calculation',
              'Visual Analytics & Downloadable Business Reports',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-accent-400 font-bold text-xs shrink-0">
                  ✓
                </div>
                <span className="text-primary-50 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white shadow-lg mb-4">
              <HiScissors className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">StitchMaster</h2>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white transition-colors">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 transition-colors">
              {isLogin ? 'Sign in to access your tailoring management dashboard.' : 'Sign up to get started with StitchMaster.'}
            </p>
          </div>

          <Card padding="lg" className="border-0 shadow-xl dark:bg-slate-900/80 backdrop-blur-xl">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field (Only for Sign Up) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-field pl-11"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Password
                  </label>
                  {isLogin && (
                    <a
                      href="#forgot"
                      onClick={handleForgotPassword}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    className="input-field pl-11 pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <HiEyeSlash className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="primary" loading={loading} fullWidth className="py-3 mt-2">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </Card>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 pt-1">
              Store Owner?{' '}
              <a
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Go to Secure Admin Portal &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
