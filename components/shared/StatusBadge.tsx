'use client';

// ============================
// StatusBadge — Color-coded status pill
// ============================

import React from 'react';
import { type PlanningStatus, type FinalStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: PlanningStatus | FinalStatus | string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { className: string; label: string; dot?: string }> = {
  'YET TO PLAN': { className: 'badge-yet-to-plan', label: 'Yet to Plan', dot: 'bg-danger' },
  'STARTED': { className: 'badge-started', label: 'Started', dot: 'bg-purple' },
  'IN PROCESS': { className: 'badge-in-process', label: 'In Process', dot: 'bg-warning' },
  'YARN ORDERED': { className: 'badge-yarn-ordered', label: 'Yarn Ordered', dot: 'bg-accent' },
  'ORDER COMPLETE': { className: 'badge-order-complete', label: 'Complete', dot: 'bg-success' },
  'ON HOLD': { className: 'badge-on-hold', label: 'On Hold' },
  'CANCELLED': { className: 'badge-cancelled', label: 'Cancelled' },
  'PARTIAL DELIVERY': { className: 'badge-in-process', label: 'Partial' },
  'REJECTED': { className: 'badge-yet-to-plan', label: 'Rejected' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const trimmed = (status || '').trim().toUpperCase();
  const config = STATUS_CONFIG[trimmed] || {
    className: 'badge-blank',
    label: status || 'New',
  };

  return (
    <span
      className={`badge ${config.className} ${size === 'sm' ? 'text-[0.625rem] px-2 py-0.5' : ''}`}
    >
      {config.dot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse-dot`}
        />
      )}
      {config.label}
    </span>
  );
}
