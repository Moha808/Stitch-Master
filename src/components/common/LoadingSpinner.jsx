import React from 'react';

const spinnerSizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const LoadingSpinner = ({ size = 'md', text, className = '' }) => {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={text || 'Loading'}
    >
      <svg
        className={`animate-spin text-primary-600 ${spinnerSizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`text-gray-500 font-medium ${textSizes[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

const roundedMap = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const SkeletonLoader = ({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}) => {
  return (
    <div
      className={[
        'relative overflow-hidden bg-gray-200',
        roundedMap[rounded] || 'rounded-lg',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent',
        'after:animate-shimmer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

export default LoadingSpinner;
