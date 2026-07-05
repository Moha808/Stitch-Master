import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiScissors,
  HiClipboardDocumentList,
  HiShoppingBag,
  HiCreditCard,
  HiChartBar,
  HiArrowRight,
  HiCheckBadge,
  HiBuildingStorefront,
  HiSun,
  HiMoon,
} from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import Button from '../components/common/Button';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 flex flex-col font-sans select-none overflow-x-hidden transition-colors duration-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-glow shrink-0">
            <HiScissors className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <span className="text-xl font-extrabold font-heading text-primary-900 dark:text-white tracking-wide transition-colors">
              StitchMaster
            </span>
            <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold tracking-widest uppercase block -mt-1">
              Tailoring OS
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500 dark:text-slate-400">
          <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
          <a href="#mockup" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Interface</a>
          <a href="#stats" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Metrics</a>
        </div>

        {/* Theme Toggle & CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <HiSun className="w-5.5 h-5.5 text-amber-500" />
            ) : (
              <HiMoon className="w-5.5 h-5.5" />
            )}
          </button>

          <div className="flex gap-2">
            {!currentUser && (
              <Button
                onClick={() => navigate('/login', { state: { isRegister: true } })}
                variant="secondary"
                size="sm"
                className="hidden sm:flex px-4"
              >
                Sign Up
              </Button>
            )}
            <Button
              onClick={handleCTA}
              variant={currentUser ? 'primary' : 'secondary'}
              size="sm"
              className="px-4 dark:bg-slate-850 dark:text-slate-200 dark:border-slate-700 hover:dark:bg-slate-800"
            >
              {currentUser ? 'Enter Dashboard' : 'Sign In'}
              <HiArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/30 dark:bg-primary-900/10 rounded-full filter blur-3xl -z-10"></div>

        {/* Hero Left Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900/55 text-primary-700 dark:text-primary-400 text-xs font-bold uppercase tracking-wider transition-colors">
            <HiCheckBadge className="w-4.5 h-4.5 text-accent-500" />
            Modern Fashion Studio OS
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold font-heading leading-tight text-gray-900 dark:text-white tracking-tight transition-colors">
            Bespoke Fashion, <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Digitally Orchestrated.
            </span>
          </h1>

          <p className="text-gray-500 dark:text-slate-400 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0 transition-colors">
            Ditch the manual notebooks. StitchMaster helps tailors and designers track custom measurements, order workflows, client billing, and payments in one premium hub.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button onClick={handleCTA} variant="primary" size="lg" className="px-8 shadow-lg hover:shadow-glow">
              {currentUser ? 'Launch Studio' : 'Get Started Now'}
              <HiArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
            <a href="#features">
              <Button variant="secondary" size="lg" className="px-8 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 hover:dark:bg-slate-850">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Trust stats */}
          <div id="stats" className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100 dark:border-slate-800 max-w-md mx-auto lg:mx-0 transition-colors">
            <div>
              <span className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 font-heading block transition-colors">5,000+</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5">Suits Crafted</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 font-heading block transition-colors">99.4%</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5">On-Time Delivery</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 font-heading block transition-colors">200+</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 block mt-0.5">Fashion Houses</span>
            </div>
          </div>
        </div>

        {/* Hero Right Image */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="relative z-10 w-full h-80 md:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-colors">
            <img src="/hero-image.png" alt="Tailor and Customer laughing" className="w-full h-full object-cover" />
          </div>
          {/* Accent decoration behind */}
          <div className="absolute -right-4 -bottom-4 w-full h-full bg-gradient-primary rounded-3xl filter blur-2xl opacity-30 -z-10"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-slate-900 py-20 px-6 border-t border-gray-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">Tailoring Modules</h2>
            <p className="text-3xl md:text-4xl font-extrabold font-heading text-gray-950 dark:text-white transition-colors">
              Everything you need to scale your fashion house.
            </p>
            <p className="text-gray-400 dark:text-slate-500 text-sm transition-colors">
              We built StitchMaster to match real tailors' workflows, replacing papers with digital entries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Measurement Locker',
                desc: 'Log male and female specifications. Stores neck, chest, bust, shoulder, and trouser lengths linked to client profiles.',
                icon: HiClipboardDocumentList,
                color: 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400',
              },
              {
                title: 'Order Tracking',
                desc: 'Move orders across production stages: Pending, In Progress, Ready, and Delivered. Inline dropdowns keep workflow clear.',
                icon: HiShoppingBag,
                color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
              },
              {
                title: 'Billing Ledger',
                desc: 'Input bill items, payments, and deposits. System automatically calculates outstanding balances and prints receipts.',
                icon: HiCreditCard,
                color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
              },
              {
                title: 'Analytics & Audits',
                desc: 'Generate monthly sales, top fabric metrics, and new customer logs. Print out report spreadsheets for audits.',
                icon: HiChartBar,
                color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:shadow-card-hover dark:hover:shadow-lg dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col text-left space-y-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color} text-2xl shrink-0`}>
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white transition-colors">{f.title}</h3>
                  <p className="text-sm text-gray-400 dark:text-slate-400 leading-relaxed transition-colors">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interface Mockup Info Section */}
      <section id="mockup" className="py-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-left">
          <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-950/30 border border-accent-100 dark:border-accent-900/50 text-accent-600 dark:text-accent-400 flex items-center justify-center text-xl transition-colors">
            <HiBuildingStorefront />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 dark:text-white leading-tight transition-colors">
            Role-Based Access Control <br />for your shop staff.
          </h2>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm transition-colors">
            Maintain tight security boundaries. Assign different access keys based on duties:
          </p>

          <div className="space-y-4 text-xs font-semibold text-gray-700">
            <div className="flex items-start gap-3">
              <span className="px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 shrink-0 transition-colors animate-pulse-soft">Admin</span>
              <p className="text-gray-500 dark:text-slate-400 font-medium pt-0.5 leading-relaxed transition-colors">
                Full CRUD control, financials, setting configurations, and reports.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 shrink-0 transition-colors">Staff</span>
              <p className="text-gray-500 dark:text-slate-400 font-medium pt-0.5 leading-relaxed transition-colors">
                Access measurements, log orders, and payments. Cannot delete records or access settings.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 shrink-0 transition-colors">Customer</span>
              <p className="text-gray-500 dark:text-slate-400 font-medium pt-0.5 leading-relaxed transition-colors">
                Read-only window showing status badges, expected delivery dates, and balances due.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Feature Grid Mock */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-all">
            <span className="text-xs uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider transition-colors">Prints specs</span>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
              Print a clean customer measurement card for physical cutting tables in one click.
            </p>
            <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 mt-2 block transition-colors">Print-Ready ⚡</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-all">
            <span className="text-xs uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider transition-colors">Invoice / Receipt</span>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
              Auto-calculates balances, prints receipts with business details and signatures.
            </p>
            <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 mt-2 block transition-colors">Bill Audits ✓</span>
          </div>

          <div className="col-span-2 bg-gradient-primary text-white p-6 rounded-2xl shadow-md flex flex-col justify-between h-44 hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl"></div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-accent-300">Ready to start?</span>
              <h3 className="text-xl font-bold font-heading mt-2">Experience StitchMaster today.</h3>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-primary-100 font-light">Available for tailoring salons of all sizes.</span>
              <Button onClick={handleCTA} variant="secondary" size="sm" className="bg-white text-primary-700 hover:bg-gray-100 border-none">
                Launch Application
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-8 text-center text-xs text-gray-400 dark:text-slate-500 transition-colors duration-200">
        <div className="flex items-center justify-center gap-2 mb-4">
          <HiScissors className="w-4 h-4 text-primary-600 rotate-45" />
          <span className="font-bold text-gray-800 dark:text-slate-200 transition-colors">StitchMaster</span>
        </div>
        <p className="leading-relaxed transition-colors">
          &copy; {new Date().getFullYear()} StitchMaster Tailoring OS. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
