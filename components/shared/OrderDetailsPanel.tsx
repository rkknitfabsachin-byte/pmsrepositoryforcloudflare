'use client';

// ============================
// OrderDetailsPanel — Collapsible order context panel
// ============================

import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, X, Package } from 'lucide-react';
import { useOrdersStore, groupOrdersByPO, filterOrders, getUniqueParties, getUniqueItems } from '@/store/orders';
import { type OrderRow, type OrderGroup } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface OrderDetailsPanelProps {
  /** Collapsed by default on module pages */
  defaultCollapsed?: boolean;
  /** Callback when an order row is selected */
  onSelectOrder?: (order: OrderRow) => void;
  /** Currently selected order row index */
  selectedRowIndex?: number;
  /** Filter function for which orders to show (module-specific) */
  filterFn?: (order: OrderRow) => boolean;
  /** Title override */
  title?: string;
}

export default function OrderDetailsPanel({
  defaultCollapsed = true,
  onSelectOrder,
  selectedRowIndex,
  filterFn,
  title = 'Order Details',
}: OrderDetailsPanelProps) {
  const {
    orders,
    loading,
    searchQuery,
    statusFilter,
    partyFilter,
    itemFilter,
    setSearchQuery,
    setStatusFilter,
    setPartyFilter,
    setItemFilter,
    fetchOrders,
  } = useOrdersStore();

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedPOs, setExpandedPOs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply module filter + user filters
  let displayOrders = filterFn ? orders.filter(filterFn) : orders;
  displayOrders = filterOrders(displayOrders, searchQuery, statusFilter, partyFilter, itemFilter);
  const groups = groupOrdersByPO(displayOrders);
  const parties = getUniqueParties(orders);
  const items = getUniqueItems(orders);

  const togglePO = (po: string) => {
    const next = new Set(expandedPOs);
    if (next.has(po)) next.delete(po);
    else next.add(po);
    setExpandedPOs(next);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPartyFilter('');
    setItemFilter('');
  };

  const hasActiveFilters = searchQuery || statusFilter || partyFilter || itemFilter;

  return (
    <div className="card mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-primary/5 hover:bg-primary/8 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <span className="font-heading font-bold text-sm text-primary">{title}</span>
          <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {displayOrders.length}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-primary transition-transform ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {!collapsed && (
        <div className="animate-slideDown">
          {/* Search + Filter bar */}
          <div className="px-4 py-3 border-b border-border-light space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  className="form-input pl-9 h-9 text-sm"
                  placeholder="Search PI, party, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm ${hasActiveFilters ? 'btn-accent' : 'btn-outline'}`}
              >
                <Filter size={14} />
                {hasActiveFilters && <span className="text-xs">Active</span>}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost btn-sm btn-icon">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter dropdowns */}
            {showFilters && (
              <div className="grid grid-cols-3 gap-2 animate-slideDown">
                <select
                  className="form-input form-select h-9 text-xs"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="YET TO PLAN">Yet to Plan</option>
                  <option value="STARTED">Started</option>
                  <option value="IN PROCESS">In Process</option>
                  <option value="YARN ORDERED">Yarn Ordered</option>
                  <option value="ORDER COMPLETE">Complete</option>
                  <option value="ON HOLD">On Hold</option>
                </select>
                <select
                  className="form-input form-select h-9 text-xs"
                  value={partyFilter}
                  onChange={(e) => setPartyFilter(e.target.value)}
                >
                  <option value="">All Parties</option>
                  {parties.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="form-input form-select h-9 text-xs"
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                >
                  <option value="">All Items</option>
                  {items.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Order list */}
          <div className="max-h-[50vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 w-full" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-title">No orders found</div>
                <div className="empty-state-message">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Orders will appear here once loaded'}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {groups.map((group) => (
                  <div key={group.purchaseOrder}>
                    {/* PO Group Header */}
                    <button
                      onClick={() => togglePO(group.purchaseOrder)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-bg/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          size={14}
                          className={`text-text-muted transition-transform ${
                            expandedPOs.has(group.purchaseOrder) ? 'rotate-90' : ''
                          }`}
                        />
                        <span className="font-heading font-bold text-sm text-primary">
                          {group.purchaseOrder}
                        </span>
                        <span className="text-xs text-text-muted">
                          {group.party}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-text-muted">
                          {group.totalQty} kg
                        </span>
                        <span className="text-[0.625rem] bg-bg-alt px-1.5 py-0.5 rounded-full font-mono">
                          {group.orders.length}
                        </span>
                      </div>
                    </button>

                    {/* Expanded order rows */}
                    {expandedPOs.has(group.purchaseOrder) && (
                      <div className="bg-bg/30 animate-slideDown">
                        {group.orders.map((order) => (
                          <button
                            key={`${order.rowIndex}`}
                            onClick={() => onSelectOrder?.(order)}
                            className={`w-full px-6 py-2 flex items-center justify-between text-left hover:bg-accent/5 transition-colors ${
                              selectedRowIndex === order.rowIndex
                                ? 'bg-accent/10 border-l-2 border-accent'
                                : 'border-l-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-medium truncate">
                                {order.item}
                              </span>
                              <span className="text-xs text-accent">
                                {order.colour}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs">
                                {order.qty} kg
                              </span>
                              <StatusBadge status={order.status} size="sm" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
