import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { HiExclamationTriangle } from 'react-icons/hi2';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
  loading = false,
  className = '',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className={className}>
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 mb-5">
          <HiExclamationTriangle className="w-7 h-7 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-heading mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xs">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
