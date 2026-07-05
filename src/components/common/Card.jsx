import React, { forwardRef } from 'react';

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = forwardRef(
  (
    {
      children,
      className = '',
      hoverable = false,
      gradient = false,
      padding = 'md',
      onClick,
      ...rest
    },
    ref
  ) => {
    if (gradient) {
      return (
        <div
          ref={ref}
          onClick={onClick}
          className={[
            'rounded-2xl p-[1px]',
            'bg-gradient-to-br from-primary-400 via-violet-400 to-accent',
            hoverable
              ? 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer'
              : '',
            onClick && !hoverable ? 'cursor-pointer' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          <div
            className={[
              'bg-white dark:bg-slate-900 rounded-2xl h-full text-gray-800 dark:text-slate-100 transition-colors duration-200',
              paddingStyles[padding],
            ].join(' ')}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={[
          'bg-white dark:bg-slate-900 rounded-2xl shadow-card dark:shadow-black/25 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-100 transition-colors duration-200',
          paddingStyles[padding],
          hoverable
            ? 'hover:shadow-card-hover dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer'
            : '',
          onClick && !hoverable ? 'cursor-pointer' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
