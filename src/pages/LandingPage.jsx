import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiScissors,
  HiClipboardDocumentList,
  HiShoppingBag,
  HiCreditCard,
  HiChartBar,
  HiArrowRight,
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
      {/* Top-Right Decorative Curve matching institutional flyer design */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 md:w-80 lg:w-96 h-44 sm:h-64 md:h-80 lg:h-96 pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
          <path d="M110 0 C230 40 350 160 400 320 L400 0 Z" fill="#1e3a8a" />
          <path d="M170 0 C270 40 360 140 400 240 L400 180 C350 100 270 30 170 0 Z" fill="#eab308" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center gap-3">
          <img
            src="/fcahpt-logo.png"
            alt="FCAH&PT Crest"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div>
            <span className="text-lg font-extrabold font-heading text-gray-900 dark:text-white tracking-wide transition-colors">
              FCAH&PT Tailoring
            </span>
            <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold tracking-widest uppercase block -mt-0.5">
              Fashion Studio OS
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500 dark:text-slate-400">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Modules
          </a>
          <a href="#mockup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Workshop
          </a>
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
              className="px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:text-white dark:border-blue-700 hover:dark:bg-blue-700"
            >
              {currentUser ? 'Enter Dashboard' : 'Sign In'}
              <HiArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-12 pb-16 md:py-20 max-w-7xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Hero Left Content */}
          <div className="flex-1 space-y-6 text-left">
            {/* Institution Brand Badge Header */}
            <div className="flex items-center gap-3.5 pb-2">
              <img
                src="/fcahpt-logo.png"
                alt="FCAH&PT Crest"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0"
              />
              <div className="h-10 w-[2px] bg-gray-300 dark:bg-slate-700"></div>
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white block font-heading leading-tight">
                  FCAH&PT
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 block leading-tight">
                  Federal College of Animal Health and Production Technology, Vom
                </span>
              </div>
            </div>

            {/* Main Headline matching user flyer */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading leading-[1.15] text-gray-900 dark:text-white tracking-tight">
              FCAH&PT <br />
              <span className="text-blue-600 dark:text-blue-400">Fashion</span> or{' '}
              <span className="font-extrabold text-gray-900 dark:text-white">Designer</span> <br />
              Digitally <span className="text-blue-600 dark:text-blue-400">Orchestrated.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-xl">
              Design, create and manage fashion projects with ease. From sketches to finished styles, all in one smart hub.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              <Button
                onClick={handleCTA}
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-glow flex items-center gap-2.5 transition-all text-sm sm:text-base"
              >
                <span>{currentUser ? 'Open Fashion Studio' : 'Explore Fashion Studio'}</span>
                <HiArrowRight className="w-5 h-5" />
              </Button>
              <a
                href="#features"
                className="text-gray-900 dark:text-white font-bold text-sm sm:text-base underline underline-offset-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Right Image (Replaces dress mannequin with Tailor taking measurements of customer) */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="relative z-10 w-full h-[320px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <img
                src="/hero-image.png"
                alt="African tailor taking customer measurements in studio"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Soft decorative glow */}
            <div className="absolute -right-4 -bottom-4 w-full h-full bg-blue-600/20 rounded-3xl filter blur-2xl -z-10"></div>
          </div>
        </div>

        {/* Bottom Feature Strip (Matching flyer: Design your style | Manage your projects | Bring your ideas to life) */}
        <div className="w-full max-w-4xl mx-auto mt-12 sm:mt-16 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-gray-200/90 dark:border-slate-800 shadow-md p-4 sm:p-5 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
            {/* Segment 1: Coat Hanger Icon */}
            <div className="flex items-center gap-4 px-4 py-2 justify-start sm:justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 4a2 2 0 0 1 2 2c0 1.5-1.5 2-2 3L2 17h20L12 9" />
                  <path d="M2 17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2" />
                </svg>
              </div>
              <div className="text-left text-sm text-gray-600 dark:text-slate-300">
                <span className="font-extrabold block text-gray-900 dark:text-white text-base">Design</span>
                your style
              </div>
            </div>

            {/* Segment 2: Laptop Icon */}
            <div className="flex items-center gap-4 px-4 py-2 justify-start sm:justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="12" rx="2" />
                  <path d="M2 20h20" />
                </svg>
              </div>
              <div className="text-left text-sm text-gray-600 dark:text-slate-300">
                <span className="font-extrabold block text-gray-900 dark:text-white text-base">Manage</span>
                your projects
              </div>
            </div>

            {/* Segment 3: Checkmark Circle Icon */}
            <div className="flex items-center gap-4 px-4 py-2 justify-start sm:justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7 stroke-current fill-none text-blue-600 dark:text-blue-400"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="text-left text-sm text-gray-600 dark:text-slate-300">
                <span className="font-extrabold block text-gray-900 dark:text-white text-base">Bring your ideas</span>
                to life
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-slate-900 py-20 px-6 border-t border-gray-100 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Tailoring Modules
            </h2>
            <p className="text-3xl md:text-4xl font-extrabold font-heading text-gray-950 dark:text-white transition-colors">
              Everything you need to scale your fashion house.
            </p>
            <p className="text-gray-400 dark:text-slate-500 text-sm transition-colors">
              Built to match real tailors' workflows, replacing manual books with streamlined digital entries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Measurement Locker',
                desc: 'Log male and female specifications. Stores neck, chest, bust, shoulder, and trouser lengths in centimeters (cm) linked to client profiles.',
                icon: HiClipboardDocumentList,
                color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
              },
              {
                title: 'Order Tracking',
                desc: 'Move orders across production stages: Pending, In Progress, Ready, and Delivered. Clear status badges keep your shop organized.',
                icon: HiShoppingBag,
                color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
              },
              {
                title: 'Billing Ledger',
                desc: 'Input bill items, payments, and deposits. System automatically calculates outstanding balances and generates invoices.',
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
                  <h3 className="text-lg font-bold font-heading text-gray-800 dark:text-white transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-slate-400 leading-relaxed transition-colors">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interface Mockup Info Section */}
      <section id="mockup" className="py-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl transition-colors">
            <HiBuildingStorefront />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 dark:text-white leading-tight transition-colors">
            Tailor-Made Tools <br />for your workshop floor.
          </h2>
          <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm transition-colors">
            Streamlined workflow from client fitting to cutting table and final customer invoice handoff. Everything you need to keep your shop running smoothly.
          </p>
        </div>

        {/* Decorative Feature Grid Mock */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-all">
            <span className="text-xs uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider transition-colors">
              Prints specs
            </span>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
              Print a clean customer measurement card in centimeters for physical cutting tables in one click.
            </p>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-2 block transition-colors">
              Print-Ready ⚡
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-all">
            <span className="text-xs uppercase text-gray-400 dark:text-slate-500 font-bold tracking-wider transition-colors">
              Invoice / Receipt
            </span>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
              Auto-calculates balances, prints receipts with business details and signatures.
            </p>
            <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 mt-2 block transition-colors">
              Bill Audits ✓
            </span>
          </div>

          <div className="col-span-2 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between h-44 hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl"></div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
                Ready to start?
              </span>
              <h3 className="text-xl font-bold font-heading mt-2">
                Experience FCAH&PT Fashion Studio today.
              </h3>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-blue-100 font-light">
                Designed for fashion students, designers, and tailoring studios.
              </span>
              <Button
                onClick={handleCTA}
                variant="secondary"
                size="sm"
                className="bg-white text-blue-700 hover:bg-gray-100 border-none font-bold"
              >
                Launch Studio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-8 text-center text-xs text-gray-400 dark:text-slate-500 transition-colors duration-200">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="/fcahpt-logo.png"
            alt="FCAH&PT Crest"
            className="w-5 h-5 object-contain"
          />
          <span className="font-bold text-gray-800 dark:text-slate-200 transition-colors">
            FCAH&PT Tailoring Management System
          </span>
        </div>
        <p className="leading-relaxed transition-colors">
          &copy; {new Date().getFullYear()} Federal College of Animal Health and Production Technology, Vom. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
