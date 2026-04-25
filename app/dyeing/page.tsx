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
import { Palette, AlertCircle } from 'lucide-react';

const PROCESS_OPTIONS = ['POLYSTER DYEING', 'REACTIVE DYEING', 'NO DYEING', 'HEAT TRANSFER'];
const ADDON_OPTIONS = ['SILICON', 'ENZYME WASH', 'OPEN STUNTER', 'TUMBLE DRY', 'CALENDERING'];

export default function DyeingPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { batchUpdate } = useSheetUpdate();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [dyeingHouses, setDyeingHouses] = useState<string[]>([]);

  // Form state
  const [process, setProcess] = useState('');
  const [customProcess, setCustomProcess] = useState('');
  const [dyeingHouse, setDyeingHouse] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [finish, setFinish] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
    fetch('/api/sheets?type=dropdowns')
      .then((r) => r.json())
      .then((d) => { if (d.success) setDyeingHouses(d.data.dyeingHouses || d.data.machines || []); })
      .catch(() => {});
  }, [currentUser, router, fetchOrders]);

  // Trigger: Production complete (balance = 0 or status contains "complete")
  const dyeingQueue = useMemo(() =>
    orders.filter((o) => {
      const balZero = o.balanceQty === '0' || o.balanceQty === '';
      const prodComplete = o.productionStatus?.toLowerCase().includes('complete');
      const hasMachine = !!o.machineAllotted;
      return (hasMachine && (balZero || prodComplete)) && o.finalStatus !== 'ORDER COMPLETE';
    }), [orders]);

  const atDyeingCount = useMemo(() =>
    dyeingQueue.filter((o) => o.process || o.dyeingHouse).length,
    [dyeingQueue]
  );

  const openForm = (order: OrderRow) => {
    setSelected(order);
    const knownProcess = PROCESS_OPTIONS.includes(order.process);
    setProcess(knownProcess ? order.process : (order.process ? 'CUSTOM' : ''));
    setCustomProcess(knownProcess ? '' : (order.process || ''));
    setDyeingHouse(order.dyeingHouse || '');
    setAddOns(order.addOns ? order.addOns.split(',').map((s) => s.trim()).filter(Boolean) : []);
    setFinish(order.finish || '');
    setFormOpen(true);
  };

  const toggleAddon = (addon: string) => {
    setAddOns((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const handleSave = async () => {
    if (!selected) return;
    const finalProcess = process === 'CUSTOM' ? customProcess : process;
    await batchUpdate([
      { rowIndex: selected.rowIndex, field: 'process', value: finalProcess },
      { rowIndex: selected.rowIndex, field: 'dyeingHouse', value: dyeingHouse },
      { rowIndex: selected.rowIndex, field: 'addOns', value: addOns.join(', ') },
      { rowIndex: selected.rowIndex, field: 'finish', value: finish },
    ]);
    setFormOpen(false);
    setSelected(null);
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout title="Dyeing & Process" subtitle="Dyeing, finishing, and additional processes">
      <div className="mini-stat-bar mb-4">
        <div className="mini-stat">
          <Palette size={14} className="text-success" />
          <span className="mini-stat-count text-success">{atDyeingCount}</span>
          <span className="text-text-muted text-xs">at dyeing house</span>
        </div>
        <div className="mini-stat">
          <AlertCircle size={14} className="text-warning" />
          <span className="mini-stat-count text-warning">{dyeingQueue.length - atDyeingCount}</span>
          <span className="text-text-muted text-xs">pending assignment</span>
        </div>
      </div>

      <OrderDetailsPanel defaultCollapsed={true} onSelectOrder={openForm} selectedRowIndex={selected?.rowIndex} />

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)
        ) : dyeingQueue.length === 0 ? (
          <div className="empty-state">
            <Palette size={48} className="text-text-light mb-3" />
            <div className="empty-state-title">No dyeing orders</div>
            <div className="empty-state-message">Orders appear here after production is complete.</div>
          </div>
        ) : (
          dyeingQueue.map((order) => (
            <OrderCard key={order.rowIndex} order={order} module="dyeing"
              onClick={() => openForm(order)}
              selected={selected?.rowIndex === order.rowIndex}
              actionButton={
                <button onClick={(e) => { e.stopPropagation(); openForm(order); }} className="btn btn-accent btn-sm">
                  Edit Process
                </button>
              }
            />
          ))
        )}
      </div>

      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Dyeing / Process" order={selected}>
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Process</label>
              <select className="form-input form-select" value={process} onChange={(e) => setProcess(e.target.value)}>
                <option value="">— Select Process —</option>
                {PROCESS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                <option value="CUSTOM">Custom...</option>
              </select>
              {process === 'CUSTOM' && (
                <input type="text" className="form-input mt-2" placeholder="Enter custom process" value={customProcess} onChange={(e) => setCustomProcess(e.target.value)} />
              )}
            </div>

            <div>
              <label className="form-label">Dyeing House</label>
              <select className="form-input form-select" value={dyeingHouse} onChange={(e) => setDyeingHouse(e.target.value)}>
                <option value="">— Select Dyeing House —</option>
                {dyeingHouses.map((dh) => <option key={dh} value={dh}>{dh}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Add-ons</label>
              <div className="flex flex-wrap gap-2">
                {ADDON_OPTIONS.map((addon) => (
                  <button key={addon} onClick={() => toggleAddon(addon)}
                    className={`chip ${addOns.includes(addon) ? 'selected' : ''}`}>
                    {addon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Finish</label>
              <input type="text" className="form-input" value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="e.g. OPEN STUNTER" />
            </div>

            <button onClick={handleSave} className="btn btn-primary btn-lg w-full">Save Process</button>
          </div>
        )}
      </BottomSheetForm>
    </ModuleLayout>
  );
}
