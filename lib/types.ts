// ============================
// PMS Type Definitions
// ============================

/** User roles in the system */
export type UserRole =
  | 'ADMIN'
  | 'PLANNER'
  | 'YARN_MANAGER'
  | 'PRODUCTION'
  | 'DYEING'
  | 'DISPATCH'
  | 'VIEWER';

/** Planning status values */
export type PlanningStatus =
  | ''
  | 'YET TO PLAN'
  | 'STARTED'
  | 'IN PROCESS'
  | 'YARN ORDERED'
  | 'ON HOLD'
  | 'CANCELLED';

/** Final status values */
export type FinalStatus =
  | ''
  | 'ORDER COMPLETE'
  | 'PARTIAL DELIVERY'
  | 'ON HOLD'
  | 'REJECTED';

/** Process types for dyeing */
export type ProcessType =
  | 'POLYSTER DYEING'
  | 'REACTIVE DYEING'
  | 'NO DYEING'
  | 'HEAT TRANSFER'
  | string;

/** Add-on options for dyeing */
export type AddOn =
  | 'SILICON'
  | 'ENZYME WASH'
  | 'OPEN STUNTER'
  | 'TUMBLE DRY'
  | 'CALENDERING'
  | string;

/** Single order row from the Google Sheet */
export interface OrderRow {
  /** Sheet row number (1-indexed, for writing back) */
  rowIndex: number;

  // Order Details (Columns 1-7)
  purchaseOrder: string;
  party: string;
  qty: string;
  item: string;
  colour: string;
  rate: string;
  gsm: string;

  // Planning (Columns 8-10)
  timestamp: string;
  status: PlanningStatus;
  planningNotes: string;

  // Yarn Details (Columns 11-18)
  totalYarnQty: string;
  yarn1: string;
  yarn1Stock: string;
  yarn1Ordered: string;
  yarn2: string;
  yarn2Stock: string;
  yarn2Ordered: string;
  supplier: string;

  // Production Tracking (Columns 19-23)
  machineAllotted: string;
  slKoraGsm: string;
  plannedQty: string;
  balanceQty: string;
  productionStatus: string;

  // Additional Process (Columns 24-27)
  process: string;
  dyeingHouse: string;
  addOns: string;
  finish: string;

  // Order Completion (Column 28)
  finalStatus: string;
}

/** Composite key for identifying a row */
export interface OrderKey {
  purchaseOrder: string;
  item: string;
  colour: string;
}

/** Grouped orders by Purchase Order number */
export interface OrderGroup {
  purchaseOrder: string;
  party: string;
  orders: OrderRow[];
  totalQty: number;
}

/** User from Supabase */
export interface User {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

/** WhatsApp contact */
export interface WAContact {
  id: string;
  label: string;
  whatsappNumber: string;
  category: 'team' | 'supplier' | 'party' | 'dyeing_house';
  createdBy: string;
}

/** Message template type */
export type MessageTemplate =
  | 'PLANNING_TO_YARN'
  | 'YARN_TO_PRODUCTION'
  | 'PRODUCTION_TO_DYEING'
  | 'DYEING_TO_DISPATCH'
  | 'ORDER_COMPLETE';

/** Module definition */
export interface ModuleConfig {
  id: string;
  name: string;
  path: string;
  icon: string;
  roles: UserRole[];
  description: string;
}

/** KPI data for dashboard */
export interface DashboardKPI {
  totalActive: number;
  byStage: Record<string, number>;
  pendingThisWeek: number;
  totalQtyInProduction: number;
  byParty: Record<string, number>;
}

/** Machine status for utilization grid */
export interface MachineStatus {
  name: string;
  status: 'running' | 'idle' | 'free';
  currentOrder?: string;
  currentItem?: string;
  currentColour?: string;
}

/** Offline sync queue item */
export interface SyncQueueItem {
  id: string;
  timestamp: number;
  action: 'update' | 'append';
  rowIndex?: number;
  columnIndex: number;
  value: string;
  compositeKey: OrderKey;
  status: 'pending' | 'syncing' | 'done' | 'error';
  retryCount: number;
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Column index mapping */
export const COLUMN_MAP = {
  purchaseOrder: 0,
  party: 1,
  qty: 2,
  item: 3,
  colour: 4,
  rate: 5,
  gsm: 6,
  timestamp: 7,
  status: 8,
  planningNotes: 9,
  totalYarnQty: 10,
  yarn1: 11,
  yarn1Stock: 12,
  yarn1Ordered: 13,
  yarn2: 14,
  yarn2Stock: 15,
  yarn2Ordered: 16,
  supplier: 17,
  machineAllotted: 18,
  slKoraGsm: 19,
  plannedQty: 20,
  balanceQty: 21,
  productionStatus: 22,
  process: 23,
  dyeingHouse: 24,
  addOns: 25,
  finish: 26,
  finalStatus: 27,
} as const;

/** Column header names (matching sheet exactly) */
export const COLUMN_HEADERS = [
  'PURCHASE ORDER',
  'PARTY ALLOTTED',
  'QTY',
  'ITEM',
  'COLOUR',
  'RATE',
  'GSM',
  'TIMESTAMP',
  'STATUS',
  'PLANNING NOTES',
  'TOTAL YARN QTY',
  'YARN 1',
  'QTY IN STOCK',
  'ORDERED QTY',
  'YARN 2',
  'QTY IN STOCK',
  'ORDERED QTY',
  'SUPPLIER',
  'MACHINE ALLOTTED',
  'SL/KORA GSM',
  'PLANNED QTY',
  'BALANCE QTY',
  'PRODUCTION STATUS',
  'PROCESS',
  'DYEING HOUSE',
  "ADD ON'S",
  'FINISH',
  'FINAL STATUS',
] as const;

/** Sheet configuration */
export const SHEET_CONFIG = {
  SHEET_ID: '1zsPFBwkTpgJd2zXsL8AaXdXJTFBBB-yecCWJCMz5YGE',
  MAIN_SHEET: 'PMS 1',
  DROPDOWNS_SHEET: 'DROPDOWNS',
  USERS_SHEET: 'USERS',
  CACHE_TTL: 30000, // 30 seconds
} as const;
