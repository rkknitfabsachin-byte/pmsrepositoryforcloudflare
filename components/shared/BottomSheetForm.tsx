'use client';

import React from 'react';
import { type OrderRow, COLUMN_MAP } from '@/lib/types';
import { useOrdersStore } from '@/store/orders';

interface BottomSheetFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  order: OrderRow | null;
  children: React.ReactNode;
}

export function BottomSheetForm({ open, onClose, title, order, children }: BottomSheetFormProps) {
  if (!open) return null;
  return (
    <>
      <div className={`bottom-sheet-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <div className={`bottom-sheet ${open ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <div className="px-5 pb-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base">{title}</h3>
              {order && (
                <p className="text-xs text-text-muted mt-0.5">
                  {order.purchaseOrder} • {order.item} • {order.colour}
                </p>
              )}
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon">✕</button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

/** Hook to submit form data to sheets API */
export function useSheetUpdate() {
  const updateOrderOptimistic = useOrdersStore((s) => s.updateOrderOptimistic);

  const updateField = async (
    rowIndex: number,
    field: keyof typeof COLUMN_MAP,
    value: string
  ) => {
    // Optimistic update
    updateOrderOptimistic(rowIndex, field, value);

    // Write to sheet
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          rowIndex,
          columnIndex: COLUMN_MAP[field],
          value,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
    } catch (err) {
      console.error('Sheet update failed:', err);
    }
  };

  const batchUpdate = async (
    updates: { rowIndex: number; field: keyof typeof COLUMN_MAP; value: string }[]
  ) => {
    // Optimistic updates
    for (const u of updates) {
      updateOrderOptimistic(u.rowIndex, u.field, u.value);
    }

    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batchUpdate',
          updates: updates.map((u) => ({
            rowIndex: u.rowIndex,
            columnIndex: COLUMN_MAP[u.field],
            value: u.value,
          })),
        }),
      });
      if (!res.ok) throw new Error('Batch update failed');
    } catch (err) {
      console.error('Batch update failed:', err);
    }
  };

  return { updateField, batchUpdate };
}
