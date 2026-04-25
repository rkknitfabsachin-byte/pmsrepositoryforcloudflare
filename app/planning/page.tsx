'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import OrderDetailsPanel from '@/components/shared/OrderDetailsPanel';
import OrderCard from '@/components/shared/OrderCard';
import { BottomSheetForm, useSheetUpdate } from '@/components/shared/BottomSheetForm';
import { useOrdersStore } from '@/store/orders';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { type OrderRow } from '@/lib/types';
import { CalendarCheck, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  'YET TO PLAN', 'STARTED', 'IN PROCESS', 'YARN ORDERED', 'ON HOLD', 'CANCELLED',
];

const QUICK_FILLS = [
  'ORDERED AT ', 'NAHAR MILL', 'NAHAR AIRJET', 'RECYCLE ', 'JOB WORK: ',
];

export default function PlanningPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { updateField, batchUpdate } = useSheetUpdate();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Form state
  const [status, setStatus] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
  }, [currentUser, router, fetchOrders]);

  // Filter: show rows needing planning (blank or YET TO PLAN status)
  const planningQueue = useMemo(() =>
    orders.filter((o) => !o.status || o.status === 'YET TO PLAN' || o.status === 'STARTED' || o.status === 'IN PROCESS' || o.status === 'YARN ORDERED' || o.status === 'ON HOLD'),
    [orders]
  );

  const needsPlanning = useMemo(() =>
    orders.filter((o) => !o.status || o.status === 'YET TO PLAN').length,
    [orders]
  );

  const openForm = (order: OrderRow) => {
    setSelected(order);
    setStatus(order.status || '');
    setTimestamp(order.timestamp || new Date().toLocaleDateString('en-GB', { year: '2-digit', month: 'numeric', day: 'numeric' }));
    setNotes(order.planningNotes || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    await batchUpdate([
      { rowIndex: selected.rowIndex, field: 'status', value: status },
      { rowIndex: selected.rowIndex, field: 'timestamp', value: timestamp },
      { rowIndex: selected.rowIndex, field: 'planningNotes', value: notes },
    ]);
    setFormOpen(false);
    setSelected(null);
  };

  const appendToNotes = (text: string) => {
    setNotes((prev) => (prev ? prev + '\n' + text : text));
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout title="Planning" subtitle="Schedule and plan production orders">
      {/* Mini stat bar */}
      <div className="mini-stat-bar mb-4">
        <div className="mini-stat">
          <AlertCircle size={14} className="text-danger" />
          <span className="mini-stat-count text-danger">{needsPlanning}</span>
          <span className="text-text-muted text-xs">yet to plan</span>
        </div>
        <div className="mini-stat">
          <CalendarCheck size={14} className="text-accent" />
          <span className="mini-stat-count text-accent">{planningQueue.length}</span>
          <span className="text-text-muted text-xs">total in queue</span>
        </div>
      </div>

      {/* Collapsible order context */}
      <OrderDetailsPanel
        defaultCollapsed={true}
        onSelectOrder={openForm}
        selectedRowIndex={selected?.rowIndex}
      />

      {/* Planning queue */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)
        ) : planningQueue.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={48} className="text-text-light mb-3" />
            <div className="empty-state-title">All planned!</div>
            <div className="empty-state-message">No orders pending planning right now.</div>
          </div>
        ) : (
          planningQueue.map((order) => (
            <OrderCard
              key={order.rowIndex}
              order={order}
              module="planning"
              onClick={() => openForm(order)}
              selected={selected?.rowIndex === order.rowIndex}
              actionButton={
                <button onClick={(e) => { e.stopPropagation(); openForm(order); }} className="btn btn-accent btn-sm">
                  Edit Plan
                </button>
              }
            />
          ))
        )}
      </div>

      {/* Planning form bottom sheet */}
      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Edit Planning" order={selected}>
        {selected && (
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">— Select Status —</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Timestamp */}
            <div>
              <label className="form-label">Timestamp</label>
              <input type="text" className="form-input font-mono" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="DD/M/YY" />
            </div>

            {/* Planning Notes */}
            <div>
              <label className="form-label">Planning Notes</label>
              <textarea
                className="form-input form-textarea"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Supplier, yarn specs, special instructions..."
              />
              {/* Quick fill buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_FILLS.map((qf) => (
                  <button key={qf} onClick={() => appendToNotes(qf)} className="chip text-xs py-1">
                    + {qf.trim() || qf}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave} className="btn btn-primary btn-lg w-full">
              Save Planning
            </button>
          </div>
        )}
      </BottomSheetForm>
    </ModuleLayout>
  );
}
