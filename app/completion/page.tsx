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
import { PackageCheck, CheckCircle2 } from 'lucide-react';

const FINAL_STATUS_OPTIONS = ['ORDER COMPLETE', 'PARTIAL DELIVERY', 'ON HOLD', 'REJECTED'];

export default function CompletionPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { batchUpdate } = useSheetUpdate();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');

  // Form state
  const [finalStatus, setFinalStatus] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
  }, [currentUser, router, fetchOrders]);

  // Trigger: Dyeing/process is done (process or dyeingHouse filled)
  const pendingOrders = useMemo(() =>
    orders.filter((o) =>
      (o.process || o.dyeingHouse) && o.finalStatus !== 'ORDER COMPLETE' && o.finalStatus !== 'REJECTED'
    ), [orders]);

  const completedOrders = useMemo(() =>
    orders.filter((o) => o.finalStatus === 'ORDER COMPLETE' || o.finalStatus === 'PARTIAL DELIVERY'),
    [orders]
  );

  const displayOrders = tab === 'pending' ? pendingOrders : completedOrders;

  const openForm = (order: OrderRow) => {
    setSelected(order);
    setFinalStatus(order.finalStatus || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    await batchUpdate([
      { rowIndex: selected.rowIndex, field: 'finalStatus', value: finalStatus },
    ]);
    setFormOpen(false);
    setSelected(null);
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout title="Dispatch" subtitle="Order completion and final status">
      <div className="mini-stat-bar mb-4">
        <div className="mini-stat">
          <PackageCheck size={14} className="text-accent" />
          <span className="mini-stat-count text-accent">{pendingOrders.length}</span>
          <span className="text-text-muted text-xs">ready for completion</span>
        </div>
        <div className="mini-stat">
          <CheckCircle2 size={14} className="text-success" />
          <span className="mini-stat-count text-success">{completedOrders.length}</span>
          <span className="text-text-muted text-xs">completed</span>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-4 bg-bg-alt rounded-lg p-1">
        <button onClick={() => setTab('pending')}
          className={`flex-1 py-2 rounded-md text-sm font-heading font-semibold transition-all ${
            tab === 'pending' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted'
          }`}>
          Pending ({pendingOrders.length})
        </button>
        <button onClick={() => setTab('completed')}
          className={`flex-1 py-2 rounded-md text-sm font-heading font-semibold transition-all ${
            tab === 'completed' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted'
          }`}>
          Completed ({completedOrders.length})
        </button>
      </div>

      <OrderDetailsPanel defaultCollapsed={true} onSelectOrder={openForm} selectedRowIndex={selected?.rowIndex} />

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)
        ) : displayOrders.length === 0 ? (
          <div className="empty-state">
            <PackageCheck size={48} className="text-text-light mb-3" />
            <div className="empty-state-title">
              {tab === 'pending' ? 'No pending orders' : 'No completed orders'}
            </div>
            <div className="empty-state-message">
              {tab === 'pending'
                ? 'Orders appear here after dyeing/processing.'
                : 'Completed orders will show here.'}
            </div>
          </div>
        ) : (
          displayOrders.map((order) => (
            <OrderCard key={order.rowIndex} order={order} module="completion"
              onClick={() => openForm(order)}
              selected={selected?.rowIndex === order.rowIndex}
              actionButton={
                tab === 'pending' ? (
                  <button onClick={(e) => { e.stopPropagation(); openForm(order); }} className="btn btn-success btn-sm">
                    <CheckCircle2 size={12} /> Mark Status
                  </button>
                ) : undefined
              }
            />
          ))
        )}
      </div>

      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Order Completion" order={selected}>
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Final Status</label>
              <select className="form-input form-select" value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)}>
                <option value="">— Select Status —</option>
                {FINAL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleSave} className="btn btn-success btn-lg w-full">
              <CheckCircle2 size={18} /> Save Final Status
            </button>
          </div>
        )}
      </BottomSheetForm>
    </ModuleLayout>
  );
}
