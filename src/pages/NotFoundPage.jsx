import React from 'react';
import { Link } from 'react-router-dom';
import { HiScissors, HiHome } from 'react-icons/hi2';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* Brand logo illustration */}
      <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary text-white text-4xl mb-6 shadow-lg animate-bounce">
        <HiScissors className="rotate-45" />
      </div>

      <h1 className="text-8xl font-black font-heading text-gray-200 tracking-wider">404</h1>
      <h2 className="text-3xl font-extrabold font-heading text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-500 mt-2 max-w-md text-sm leading-relaxed">
        The route you are trying to access does not exist, or you might have typed the URL incorrectly.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-md hover:shadow-glow transition-all active:scale-[0.98]"
        >
          <HiHome className="w-5 h-5" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
