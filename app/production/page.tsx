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
import { Factory, LayoutGrid, List, CheckCircle2 } from 'lucide-react';

export default function ProductionPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { batchUpdate } = useSheetUpdate();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'grid'>('list');
  const [machines, setMachines] = useState<string[]>([]);

  // Form state
  const [machine, setMachine] = useState('');
  const [koraGsm, setKoraGsm] = useState('');
  const [plannedQty, setPlannedQty] = useState('');
  const [balanceQty, setBalanceQty] = useState('');
  const [prodStatus, setProdStatus] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
    // Fetch dropdown machines
    fetch('/api/sheets?type=dropdowns')
      .then((r) => r.json())
      .then((d) => { if (d.success) setMachines(d.data.machines || []); })
      .catch(() => {});
  }, [currentUser, router, fetchOrders]);

  // Trigger: Yarn confirmed (yarn1 filled or ordered qty > 0)
  const prodQueue = useMemo(() =>
    orders.filter((o) =>
      (o.yarn1 || parseFloat(o.yarn1Ordered) > 0) && o.finalStatus !== 'ORDER COMPLETE'
    ), [orders]);

  const runningMachines = useMemo(() => {
    const machineMap = new Map<string, OrderRow>();
    for (const o of orders) {
      if (o.machineAllotted && o.finalStatus !== 'ORDER COMPLETE') {
        machineMap.set(o.machineAllotted, o);
      }
    }
    return machineMap;
  }, [orders]);

  // Default in-house machines for the grid
  const inHouseMachines = useMemo(() => {
    const ih: string[] = [];
    for (let i = 1; i <= 22; i++) ih.push(`IN HOUSE MACHINE ${i}`);
    return ih;
  }, []);

  const openForm = (order: OrderRow) => {
    setSelected(order);
    setMachine(order.machineAllotted || '');
    setKoraGsm(order.slKoraGsm || '');
    setPlannedQty(order.plannedQty || '');
    setBalanceQty(order.balanceQty || '');
    setProdStatus(order.productionStatus || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    await batchUpdate([
      { rowIndex: selected.rowIndex, field: 'machineAllotted', value: machine },
      { rowIndex: selected.rowIndex, field: 'slKoraGsm', value: koraGsm },
      { rowIndex: selected.rowIndex, field: 'plannedQty', value: plannedQty },
      { rowIndex: selected.rowIndex, field: 'balanceQty', value: balanceQty },
      { rowIndex: selected.rowIndex, field: 'productionStatus', value: prodStatus },
    ]);
    setFormOpen(false);
    setSelected(null);
  };

  const markComplete = async (order: OrderRow) => {
    await batchUpdate([
      { rowIndex: order.rowIndex, field: 'balanceQty', value: '0' },
      { rowIndex: order.rowIndex, field: 'productionStatus', value: 'ORDER COMPLETE' },
    ]);
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout
      title="Production"
      subtitle="Machine allocation & output tracking"
      headerRight={
        <div className="flex items-center gap-1 bg-bg-alt rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={`btn btn-sm btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}>
            <List size={14} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`btn btn-sm btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}>
            <LayoutGrid size={14} />
          </button>
        </div>
      }
    >
      <div className="mini-stat-bar mb-4">
        <div className="mini-stat">
          <Factory size={14} className="text-warning" />
          <span className="mini-stat-count text-warning">{runningMachines.size}</span>
          <span className="text-text-muted text-xs">machines running</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-count text-accent">{prodQueue.length}</span>
          <span className="text-text-muted text-xs">in queue</span>
        </div>
      </div>

      <OrderDetailsPanel defaultCollapsed={true} onSelectOrder={openForm} selectedRowIndex={selected?.rowIndex} />

      {/* Machine Grid View */}
      {viewMode === 'grid' ? (
        <div>
          <h3 className="font-heading font-bold text-sm mb-3">In-House Machine Grid</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {inHouseMachines.map((m) => {
              const order = runningMachines.get(m);
              const status = order ? 'running' : 'free';
              return (
                <div key={m} className={`machine-tile ${status === 'running' ? 'machine-running' : 'machine-free'}`}
                  onClick={() => order && openForm(order)}>
                  <div className="font-heading font-bold text-xs">M{m.replace('IN HOUSE MACHINE ', '')}</div>
                  {order ? (
                    <div className="mt-1">
                      <div className="text-[0.625rem] font-semibold text-success truncate">{order.purchaseOrder}</div>
                      <div className="text-[0.5625rem] text-text-muted truncate">{order.item}</div>
                    </div>
                  ) : (
                    <div className="text-[0.625rem] text-text-muted mt-1">Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)
          ) : prodQueue.length === 0 ? (
            <div className="empty-state">
              <Factory size={48} className="text-text-light mb-3" />
              <div className="empty-state-title">No production orders</div>
              <div className="empty-state-message">Orders appear here when yarn is confirmed.</div>
            </div>
          ) : (
            prodQueue.map((order) => (
              <OrderCard key={order.rowIndex} order={order} module="production"
                onClick={() => openForm(order)}
                selected={selected?.rowIndex === order.rowIndex}
                actionButton={
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openForm(order); }} className="btn btn-accent btn-sm">Edit</button>
                    {parseFloat(order.balanceQty) > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); markComplete(order); }} className="btn btn-success btn-sm">
                        <CheckCircle2 size={12} /> Complete
                      </button>
                    )}
                  </div>
                }
              />
            ))
          )}
        </div>
      )}

      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Production Details" order={selected}>
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Machine Allotted</label>
              <select className="form-input form-select" value={machine} onChange={(e) => setMachine(e.target.value)}>
                <option value="">— Select Machine —</option>
                <optgroup label="In-House">
                  {inHouseMachines.map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
                <optgroup label="External / Job Work">
                  {machines.filter((m) => !m.startsWith('IN HOUSE')).map((m) => <option key={m} value={m}>{m}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="form-label">SL/Kora GSM</label>
              <input type="number" className="form-input font-mono" value={koraGsm} onChange={(e) => setKoraGsm(e.target.value)} placeholder="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Planned Qty (kg)</label>
                <input type="number" className="form-input font-mono" value={plannedQty} onChange={(e) => setPlannedQty(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Balance Qty (kg)</label>
                <input type="number" className="form-input font-mono" value={balanceQty} onChange={(e) => setBalanceQty(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="form-label">Production Status</label>
              <input type="text" className="form-input" value={prodStatus} onChange={(e) => setProdStatus(e.target.value)} placeholder="Notes..." />
            </div>
            <button onClick={handleSave} className="btn btn-primary btn-lg w-full">Save Production</button>
          </div>
        )}
      </BottomSheetForm>
    </ModuleLayout>
  );
}
