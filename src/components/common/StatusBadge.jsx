import React from 'react';
import { HiCheck } from 'react-icons/hi2';

const statusConfig = {
  Pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dotColor: 'bg-amber-500',
    indicator: 'dot',
  },
  'In Progress': {
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    dotColor: 'bg-sky-500',
    indicator: 'pulse',
  },
  Ready: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dotColor: 'bg-emerald-500',
    indicator: 'check',
  },
  Delivered: {
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    dotColor: 'bg-violet-500',
    indicator: 'check',
  },
};

const DotIndicator = ({ color, pulse = false }) => (
  <span className="relative flex h-2 w-2">
    {pulse && (
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`}
      />
    )}
    <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
  </span>
);

const CheckIndicator = ({ color }) => (
  <span
    className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ${color}`}
  >
    <HiCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
  </span>
);

const StatusBadge = ({ status, className = '' }) => {
  const config = statusConfig[status];

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
        {status}
      </span>
    );
  }

  const { bg, text, dotColor, indicator } = config;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        bg,
        text,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {indicator === 'dot' && <DotIndicator color={dotColor} />}
      {indicator === 'pulse' && <DotIndicator color={dotColor} pulse />}
      {indicator === 'check' && <CheckIndicator color={dotColor} />}
      {status}
    </span>
  );
};

export default StatusBadge;
