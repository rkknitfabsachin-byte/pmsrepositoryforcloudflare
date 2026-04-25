'use client';

import React, { useEffect, useState } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import OrderDetailsPanel from '@/components/shared/OrderDetailsPanel';
import { BottomSheetForm } from '@/components/shared/BottomSheetForm';
import { useOrdersStore } from '@/store/orders';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { COLUMN_MAP } from '@/lib/types';
import { Plus, ClipboardList } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, addOrderOptimistic } = useOrdersStore();
  const [formOpen, setFormOpen] = useState(false);

  // Form state for new PO row
  const [po, setPo] = useState('');
  const [party, setParty] = useState('');
  const [qty, setQty] = useState('');
  const [item, setItem] = useState('');
  const [colour, setColour] = useState('');
  const [rate, setRate] = useState('');
  const [gsm, setGsm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    if (currentUser.role !== 'ADMIN') { router.push('/planning'); return; }
    fetchOrders();
  }, [currentUser, router, fetchOrders]);

  const resetForm = () => {
    // Keep PO and party for adding multiple rows under same PI
    setQty(''); setItem(''); setColour(''); setRate(''); setGsm('');
  };

  const handleAdd = async () => {
    if (!po || !party || !item) return;
    setSaving(true);

    const values = new Array(Object.keys(COLUMN_MAP).length).fill('');
    values[COLUMN_MAP.purchaseOrder] = po;
    values[COLUMN_MAP.party] = party;
    values[COLUMN_MAP.qty] = qty;
    values[COLUMN_MAP.item] = item;
    values[COLUMN_MAP.colour] = colour;
    values[COLUMN_MAP.rate] = rate;
    values[COLUMN_MAP.gsm] = gsm;

    // Optimistic add
    addOrderOptimistic({
      rowIndex: orders.length + 2,
      purchaseOrder: po, party, qty, item, colour, rate, gsm,
      timestamp: '', status: '' as any, planningNotes: '',
      totalYarnQty: '', yarn1: '', yarn1Stock: '', yarn1Ordered: '',
      yarn2: '', yarn2Stock: '', yarn2Ordered: '', supplier: '',
      machineAllotted: '', slKoraGsm: '', plannedQty: '', balanceQty: '', productionStatus: '',
      process: '', dyeingHouse: '', addOns: '', finish: '', finalStatus: '',
    });

    try {
      await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'append', values }),
      });
      resetForm();
    } catch (err) {
      console.error('Failed to add order:', err);
    }
    setSaving(false);
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout
      title="Orders"
      subtitle="Manage purchase orders"
      headerRight={
        <button onClick={() => setFormOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Add Order
        </button>
      }
    >
      <OrderDetailsPanel defaultCollapsed={false} title="All Purchase Orders" />

      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Add New Order" order={null}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Purchase Order (PI)</label>
              <input type="text" className="form-input" value={po} onChange={(e) => setPo(e.target.value)} placeholder="PI-XXX" />
            </div>
            <div>
              <label className="form-label">Party</label>
              <input type="text" className="form-input" value={party} onChange={(e) => setParty(e.target.value)} placeholder="Party name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Item</label>
              <input type="text" className="form-input" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. SPUN SINKER" />
            </div>
            <div>
              <label className="form-label">Colour</label>
              <input type="text" className="form-input" value={colour} onChange={(e) => setColour(e.target.value)} placeholder="e.g. BLACK" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Qty (kg)</label>
              <input type="number" className="form-input font-mono" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="form-label">Rate (₹)</label>
              <input type="number" className="form-input font-mono" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="form-label">GSM</label>
              <input type="number" className="form-input font-mono" value={gsm} onChange={(e) => setGsm(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving || !po || !party || !item} className="btn btn-primary btn-lg flex-1 disabled:opacity-50">
              {saving ? <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Add Row</>}
            </button>
            <button onClick={() => { handleAdd(); }} disabled={saving} className="btn btn-outline btn-lg disabled:opacity-50" title="Add and keep PO/Party for next row">
              + Another
            </button>
          </div>
          <p className="text-xs text-text-muted text-center">PO and Party are kept for adding multiple rows under the same PI</p>
        </div>
      </BottomSheetForm>
    </ModuleLayout>
  );
}
