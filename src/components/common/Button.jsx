import React, { forwardRef } from 'react';

const variantStyles = {
  primary: [
    'bg-gradient-to-r from-primary-600 to-primary-700 text-white',
    'hover:from-primary-700 hover:to-primary-800 hover:shadow-glow',
    'active:from-primary-800 active:to-primary-900',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:from-primary-300 disabled:to-primary-400 disabled:shadow-none disabled:cursor-not-allowed',
  ].join(' '),
  secondary: [
    'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-700',
    'hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:border-slate-650 dark:hover:text-white',
    'active:bg-gray-100 dark:active:bg-slate-750',
    'focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-550 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
    'disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:border-slate-800',
  ].join(' '),
  danger: [
    'bg-gradient-to-r from-red-500 to-red-600 text-white',
    'hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/25',
    'active:from-red-700 active:to-red-800',
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    'disabled:from-red-300 disabled:to-red-400 disabled:shadow-none disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-gray-600 dark:text-slate-400',
    'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    'active:bg-gray-200 dark:active:bg-slate-750',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:text-gray-300 disabled:bg-transparent disabled:cursor-not-allowed dark:disabled:text-slate-600',
  ].join(' '),
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const Spinner = ({ size }) => (
  <svg
    className={`animate-spin ${iconSizeMap[size]}`}
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
);

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon: Icon,
      fullWidth = false,
      children,
      onClick,
      type = 'button',
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={[
          'inline-flex items-center justify-center font-medium rounded-xl',
          'transition-all duration-200 ease-in-out',
          'select-none outline-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          loading ? 'cursor-wait' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {loading ? (
          <Spinner size={size} />
        ) : Icon ? (
          <Icon className={iconSizeMap[size]} aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
