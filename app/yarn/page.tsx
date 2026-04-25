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
import { Layers, AlertCircle } from 'lucide-react';

export default function YarnPage() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const { orders, fetchOrders, loading } = useOrdersStore();
  const { batchUpdate } = useSheetUpdate();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // Form state
  const [yarn1, setYarn1] = useState('');
  const [yarn1Stock, setYarn1Stock] = useState('');
  const [yarn1Ordered, setYarn1Ordered] = useState('');
  const [hasYarn2, setHasYarn2] = useState(false);
  const [yarn2, setYarn2] = useState('');
  const [yarn2Stock, setYarn2Stock] = useState('');
  const [yarn2Ordered, setYarn2Ordered] = useState('');
  const [supplier, setSupplier] = useState('');

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
  }, [currentUser, router, fetchOrders]);

  // Trigger: STATUS = STARTED or YARN ORDERED
  const yarnQueue = useMemo(() =>
    orders.filter((o) => o.status === 'STARTED' || o.status === 'YARN ORDERED' || o.status === 'IN PROCESS'),
    [orders]
  );

  const pendingCount = useMemo(() =>
    yarnQueue.filter((o) => !o.yarn1).length,
    [yarnQueue]
  );

  // Traffic light logic
  const getTrafficLight = (order: OrderRow): 'green' | 'yellow' | 'red' => {
    const qty = parseFloat(order.qty) || 0;
    const stock1 = parseFloat(order.yarn1Stock) || 0;
    const stock2 = parseFloat(order.yarn2Stock) || 0;
    const totalStock = stock1 + stock2;
    if (!order.yarn1 && !order.yarn2) return 'red';
    if (totalStock >= qty) return 'green';
    if (totalStock > 0) return 'yellow';
    return 'red';
  };

  const openForm = (order: OrderRow) => {
    setSelected(order);
    setYarn1(order.yarn1 || '');
    setYarn1Stock(order.yarn1Stock || '');
    setYarn1Ordered(order.yarn1Ordered || '');
    const hasY2 = !!(order.yarn2 && order.yarn2.toUpperCase() !== 'NILL' && order.yarn2.toUpperCase() !== 'NIL');
    setHasYarn2(hasY2);
    setYarn2(hasY2 ? order.yarn2 : '');
    setYarn2Stock(order.yarn2Stock || '');
    setYarn2Ordered(order.yarn2Ordered || '');
    setSupplier(order.supplier || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    const s1 = parseFloat(yarn1Stock) || 0;
    const o1 = parseFloat(yarn1Ordered) || 0;
    const s2 = hasYarn2 ? (parseFloat(yarn2Stock) || 0) : 0;
    const o2 = hasYarn2 ? (parseFloat(yarn2Ordered) || 0) : 0;
    const totalYarn = s1 + o1 + s2 + o2;

    await batchUpdate([
      { rowIndex: selected.rowIndex, field: 'yarn1', value: yarn1 },
      { rowIndex: selected.rowIndex, field: 'yarn1Stock', value: yarn1Stock },
      { rowIndex: selected.rowIndex, field: 'yarn1Ordered', value: yarn1Ordered },
      { rowIndex: selected.rowIndex, field: 'yarn2', value: hasYarn2 ? yarn2 : '' },
      { rowIndex: selected.rowIndex, field: 'yarn2Stock', value: hasYarn2 ? yarn2Stock : '' },
      { rowIndex: selected.rowIndex, field: 'yarn2Ordered', value: hasYarn2 ? yarn2Ordered : '' },
      { rowIndex: selected.rowIndex, field: 'supplier', value: supplier },
      { rowIndex: selected.rowIndex, field: 'totalYarnQty', value: totalYarn.toString() },
    ]);
    setFormOpen(false);
    setSelected(null);
  };

  if (!currentUser) return null;

  return (
    <ModuleLayout title="Yarn Management" subtitle="Track yarn inventory and orders">
      <div className="mini-stat-bar mb-4">
        <div className="mini-stat">
          <AlertCircle size={14} className="text-danger" />
          <span className="mini-stat-count text-danger">{pendingCount}</span>
          <span className="text-text-muted text-xs">pending yarn</span>
        </div>
        <div className="mini-stat">
          <Layers size={14} className="text-accent" />
          <span className="mini-stat-count text-accent">{yarnQueue.length}</span>
          <span className="text-text-muted text-xs">in queue</span>
        </div>
      </div>

      <OrderDetailsPanel defaultCollapsed={true} onSelectOrder={openForm} selectedRowIndex={selected?.rowIndex}
        filterFn={(o) => o.status === 'STARTED' || o.status === 'YARN ORDERED' || o.status === 'IN PROCESS'}
      />

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full" />)
        ) : yarnQueue.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} className="text-text-light mb-3" />
            <div className="empty-state-title">No yarn orders pending</div>
            <div className="empty-state-message">Yarn queue will populate when planning marks orders as STARTED.</div>
          </div>
        ) : (
          yarnQueue.map((order) => {
            const tl = getTrafficLight(order);
            return (
              <div key={order.rowIndex} className="relative">
                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
                  tl === 'green' ? 'bg-success' : tl === 'yellow' ? 'bg-warning-light' : 'bg-danger'
                }`} />
                <div className="ml-3">
                  <OrderCard
                    order={order} module="yarn"
                    onClick={() => openForm(order)}
                    selected={selected?.rowIndex === order.rowIndex}
                    actionButton={
                      <button onClick={(e) => { e.stopPropagation(); openForm(order); }} className="btn btn-accent btn-sm">
                        Edit Yarn
                      </button>
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomSheetForm open={formOpen} onClose={() => setFormOpen(false)} title="Yarn Details" order={selected}>
        {selected && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Yarn 1 Name</label>
              <input type="text" className="form-input" placeholder="e.g. 24'S SPUN, 160D-DANGAL" value={yarn1} onChange={(e) => setYarn1(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Qty in Stock</label>
                <input type="number" className="form-input font-mono" value={yarn1Stock} onChange={(e) => setYarn1Stock(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="form-label">Ordered Qty</label>
                <input type="number" className="form-input font-mono" value={yarn1Ordered} onChange={(e) => setYarn1Ordered(e.target.value)} placeholder="0" />
              </div>
            </div>

            {/* Yarn 2 toggle */}
            <div className="flex items-center gap-3 py-2">
              <button onClick={() => setHasYarn2(!hasYarn2)}
                className={`relative w-11 h-6 rounded-full transition-colors ${hasYarn2 ? 'bg-accent' : 'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasYarn2 ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm font-medium">Has second yarn?</span>
            </div>

            {hasYarn2 && (
              <>
                <div>
                  <label className="form-label">Yarn 2 Name</label>
                  <input type="text" className="form-input" value={yarn2} onChange={(e) => setYarn2(e.target.value)} placeholder="e.g. 150/48D" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Qty in Stock</label>
                    <input type="number" className="form-input font-mono" value={yarn2Stock} onChange={(e) => setYarn2Stock(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label className="form-label">Ordered Qty</label>
                    <input type="number" className="form-input font-mono" value={yarn2Ordered} onChange={(e) => setYarn2Ordered(e.target.value)} placeholder="0" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="form-label">Supplier</label>
              <input type="text" className="form-input" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. KEDIA YARNS PVT LTD" />
            </div>

            <button onClick={handleSave} className="btn btn-primary btn-lg w-full">Save Yarn Details</button>
          </div>
        )}
      </BottomSheetForm>
    </ModuleLayout>
  );
}
