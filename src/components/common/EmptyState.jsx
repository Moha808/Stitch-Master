import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Icon */}
      {Icon && (
        <div className="mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100/80 dark:bg-slate-800/40">
            <Icon className="w-10 h-10 text-gray-300 dark:text-slate-650" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-heading mb-1.5">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
