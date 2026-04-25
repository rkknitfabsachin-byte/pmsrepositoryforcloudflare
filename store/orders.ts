// ============================
// Orders Zustand Store
// ============================

import { create } from 'zustand';
import { type OrderRow, type OrderGroup, COLUMN_MAP } from '@/lib/types';

interface OrdersState {
  /** All order rows from the sheet */
  orders: OrderRow[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Last fetch timestamp */
  lastFetched: number | null;
  /** Search query */
  searchQuery: string;
  /** Active status filter */
  statusFilter: string;
  /** Active party filter */
  partyFilter: string;
  /** Active item type filter */
  itemFilter: string;

  // Actions
  setOrders: (orders: OrderRow[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPartyFilter: (party: string) => void;
  setItemFilter: (item: string) => void;
  fetchOrders: () => Promise<void>;
  updateOrderOptimistic: (
    rowIndex: number,
    field: keyof typeof COLUMN_MAP,
    value: string
  ) => void;
  addOrderOptimistic: (order: OrderRow) => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  lastFetched: null,
  searchQuery: '',
  statusFilter: '',
  partyFilter: '',
  itemFilter: '',

  setOrders: (orders) => set({ orders, lastFetched: Date.now() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setPartyFilter: (partyFilter) => set({ partyFilter }),
  setItemFilter: (itemFilter) => set({ itemFilter }),

  fetchOrders: async () => {
    const state = get();
    // Don't refetch if we fetched within 10 seconds
    if (
      state.lastFetched &&
      Date.now() - state.lastFetched < 10000 &&
      state.orders.length > 0
    ) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      if (data.success) {
        set({ orders: data.data, loading: false, lastFetched: Date.now() });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load orders',
        loading: false,
      });
    }
  },

  updateOrderOptimistic: (rowIndex, field, value) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.rowIndex === rowIndex ? { ...order, [field]: value } : order
      ),
    }));
  },

  addOrderOptimistic: (order) => {
    set((state) => ({
      orders: [...state.orders, order],
    }));
  },
}));

// ============================
// Selector helpers
// ============================

/** Group orders by Purchase Order number */
export function groupOrdersByPO(orders: OrderRow[]): OrderGroup[] {
  const grouped = new Map<string, OrderRow[]>();

  for (const order of orders) {
    const key = order.purchaseOrder;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(order);
  }

  return Array.from(grouped.entries()).map(([po, items]) => ({
    purchaseOrder: po,
    party: items[0].party,
    orders: items,
    totalQty: items.reduce((sum, o) => sum + (parseFloat(o.qty) || 0), 0),
  }));
}

/** Filter orders based on current store state */
export function filterOrders(
  orders: OrderRow[],
  searchQuery: string,
  statusFilter: string,
  partyFilter: string,
  itemFilter: string
): OrderRow[] {
  let filtered = [...orders];

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.purchaseOrder.toLowerCase().includes(q) ||
        o.party.toLowerCase().includes(q) ||
        o.item.toLowerCase().includes(q) ||
        o.colour.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (statusFilter) {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }

  // Party filter
  if (partyFilter) {
    filtered = filtered.filter((o) => o.party === partyFilter);
  }

  // Item filter
  if (itemFilter) {
    filtered = filtered.filter((o) => o.item === itemFilter);
  }

  return filtered;
}

/** Get unique parties from orders */
export function getUniqueParties(orders: OrderRow[]): string[] {
  return [...new Set(orders.map((o) => o.party).filter(Boolean))].sort();
}

/** Get unique items from orders */
export function getUniqueItems(orders: OrderRow[]): string[] {
  return [...new Set(orders.map((o) => o.item).filter(Boolean))].sort();
}

/** Get unique statuses from orders */
export function getUniqueStatuses(orders: OrderRow[]): string[] {
  return [
    ...new Set(orders.map((o) => o.status).filter(Boolean)),
  ].sort();
}
