'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import { useOrdersStore, groupOrdersByPO, getUniqueParties } from '@/store/orders';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Clock, Factory, TrendingUp,
  Users, BarChart3, Shield,
} from 'lucide-react';
import { type UserRole } from '@/lib/types';
import { getRoleLabel } from '@/lib/roles';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, impersonateRole, setImpersonateRole } = useUserStore();
  const { orders, loading, fetchOrders } = useOrdersStore();
  const [showImpersonate, setShowImpersonate] = useState(false);

  useEffect(() => {
    if (!currentUser) { router.push('/'); return; }
    fetchOrders();
  }, [currentUser, router, fetchOrders]);

  const kpi = useMemo(() => {
    const active = orders.filter((o) => o.finalStatus !== 'ORDER COMPLETE');
    const byStage: Record<string, number> = {};
    const byParty: Record<string, number> = {};

    for (const o of orders) {
      const st = o.status || 'New';
      byStage[st] = (byStage[st] || 0) + 1;
      if (o.party) byParty[o.party] = (byParty[o.party] || 0) + 1;
    }

    const yetToPlan = orders.filter((o) => !o.status || o.status === 'YET TO PLAN').length;
    const pendingYarn = orders.filter((o) => o.status === 'STARTED' || o.status === 'YARN ORDERED').length;
    const inProduction = orders.filter((o) => o.machineAllotted && o.finalStatus !== 'ORDER COMPLETE').length;
    const atDyeing = orders.filter((o) => o.process && !o.finalStatus).length;
    const totalPlannedQty = orders.reduce((s, o) => s + (parseFloat(o.plannedQty) || 0), 0);

    return {
      totalActive: active.length,
      totalOrders: orders.length,
      byStage,
      byParty,
      yetToPlan,
      pendingYarn,
      inProduction,
      atDyeing,
      totalPlannedQty,
    };
  }, [orders]);

  const topParties = useMemo(() => {
    return Object.entries(kpi.byParty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [kpi.byParty]);

  const stageData = useMemo(() => {
    const stages = [
      { key: 'YET TO PLAN', label: 'Yet to Plan', color: 'bg-danger' },
      { key: 'STARTED', label: 'Started', color: 'bg-purple' },
      { key: 'IN PROCESS', label: 'In Process', color: 'bg-warning' },
      { key: 'YARN ORDERED', label: 'Yarn Ordered', color: 'bg-accent' },
      { key: 'ORDER COMPLETE', label: 'Complete', color: 'bg-success' },
    ];
    const maxVal = Math.max(...stages.map((s) => kpi.byStage[s.key] || 0), 1);
    return stages.map((s) => ({ ...s, count: kpi.byStage[s.key] || 0, pct: ((kpi.byStage[s.key] || 0) / maxVal) * 100 }));
  }, [kpi.byStage]);

  const impersonateRoles: UserRole[] = ['PLANNER', 'YARN_MANAGER', 'PRODUCTION', 'DYEING', 'DISPATCH', 'VIEWER'];

  if (!currentUser) return null;

  return (
    <ModuleLayout
      title="Dashboard"
      subtitle="Production overview & analytics"
      headerRight={
        <div className="relative">
          <button onClick={() => setShowImpersonate(!showImpersonate)} className="btn btn-outline btn-sm">
            <Shield size={14} />
            <span className="hide-mobile">{impersonateRole ? `As ${getRoleLabel(impersonateRole)}` : 'Impersonate'}</span>
          </button>
          {showImpersonate && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-modal z-50 py-1 animate-slideDown">
              <button onClick={() => { setImpersonateRole(null); setShowImpersonate(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-bg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> Default (Admin)
              </button>
              {impersonateRoles.map((r) => (
                <button key={r} onClick={() => { setImpersonateRole(r); setShowImpersonate(false); }} className="w-full px-3 py-2 text-left text-sm hover:bg-bg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" /> {getRoleLabel(r)}
                </button>
              ))}
            </div>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList size={16} className="text-primary" />
                </div>
              </div>
              <div className="kpi-value text-primary">{kpi.totalActive}</div>
              <div className="kpi-label">Active Orders</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                  <Clock size={16} className="text-danger" />
                </div>
              </div>
              <div className="kpi-value text-danger">{kpi.yetToPlan}</div>
              <div className="kpi-label">Yet to Plan</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Factory size={16} className="text-warning" />
                </div>
              </div>
              <div className="kpi-value text-warning">{kpi.inProduction}</div>
              <div className="kpi-label">In Production</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-success" />
                </div>
              </div>
              <div className="kpi-value text-success">{kpi.totalPlannedQty.toLocaleString()}</div>
              <div className="kpi-label">Total Qty (kg)</div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mini-stat-bar">
            <div className="mini-stat">
              <span className="w-2 h-2 rounded-full bg-danger" />
              <span className="mini-stat-count text-danger">{kpi.yetToPlan}</span>
              <span className="text-text-muted text-xs">to plan</span>
            </div>
            <div className="mini-stat">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="mini-stat-count text-accent">{kpi.pendingYarn}</span>
              <span className="text-text-muted text-xs">pending yarn</span>
            </div>
            <div className="mini-stat">
              <span className="w-2 h-2 rounded-full bg-warning" />
              <span className="mini-stat-count text-warning">{kpi.inProduction}</span>
              <span className="text-text-muted text-xs">in production</span>
            </div>
            <div className="mini-stat">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="mini-stat-count text-success">{kpi.atDyeing}</span>
              <span className="text-text-muted text-xs">at dyeing</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Orders by Stage bar chart */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                <h3 className="font-heading font-bold text-sm">Orders by Stage</h3>
              </div>
              <div className="card-body space-y-3">
                {stageData.map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-24 shrink-0 text-right">{s.label}</span>
                    <div className="flex-1 bg-bg rounded-full h-6 overflow-hidden">
                      <div
                        className={`${s.color} h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                        style={{ width: `${Math.max(s.pct, 8)}%` }}
                      >
                        <span className="text-[0.625rem] font-mono font-bold text-white">{s.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Parties */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <h3 className="font-heading font-bold text-sm">Orders by Party</h3>
              </div>
              <div className="card-body">
                {topParties.length === 0 ? (
                  <p className="text-sm text-text-muted">No data yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {topParties.map(([party, count], i) => (
                      <div key={party} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs text-text-muted w-4">{i + 1}</span>
                          <span className="text-sm font-medium truncate">{party}</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-primary shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
