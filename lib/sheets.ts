// ============================
// Google Sheets API via Apps Script
// ============================

import { type OrderRow, COLUMN_MAP } from './types';
import { getCache, setCache } from './cache';

// The URL generated from deploying the Google Apps Script
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

/** Parse a row array into an OrderRow object */
function parseRow(row: any[], rowIndex: number): OrderRow {
  return {
    rowIndex,
    purchaseOrder: row[COLUMN_MAP.purchaseOrder]?.toString() || '',
    party: row[COLUMN_MAP.party]?.toString() || '',
    qty: row[COLUMN_MAP.qty]?.toString() || '',
    item: row[COLUMN_MAP.item]?.toString() || '',
    colour: row[COLUMN_MAP.colour]?.toString() || '',
    rate: row[COLUMN_MAP.rate]?.toString() || '',
    gsm: row[COLUMN_MAP.gsm]?.toString() || '',
    timestamp: row[COLUMN_MAP.timestamp]?.toString() || '',
    status: (row[COLUMN_MAP.status]?.toString() || '') as OrderRow['status'],
    planningNotes: row[COLUMN_MAP.planningNotes]?.toString() || '',
    totalYarnQty: row[COLUMN_MAP.totalYarnQty]?.toString() || '',
    yarn1: row[COLUMN_MAP.yarn1]?.toString() || '',
    yarn1Stock: row[COLUMN_MAP.yarn1Stock]?.toString() || '',
    yarn1Ordered: row[COLUMN_MAP.yarn1Ordered]?.toString() || '',
    yarn2: row[COLUMN_MAP.yarn2]?.toString() || '',
    yarn2Stock: row[COLUMN_MAP.yarn2Stock]?.toString() || '',
    yarn2Ordered: row[COLUMN_MAP.yarn2Ordered]?.toString() || '',
    supplier: row[COLUMN_MAP.supplier]?.toString() || '',
    machineAllotted: row[COLUMN_MAP.machineAllotted]?.toString() || '',
    slKoraGsm: row[COLUMN_MAP.slKoraGsm]?.toString() || '',
    plannedQty: row[COLUMN_MAP.plannedQty]?.toString() || '',
    balanceQty: row[COLUMN_MAP.balanceQty]?.toString() || '',
    productionStatus: row[COLUMN_MAP.productionStatus]?.toString() || '',
    process: row[COLUMN_MAP.process]?.toString() || '',
    dyeingHouse: row[COLUMN_MAP.dyeingHouse]?.toString() || '',
    addOns: row[COLUMN_MAP.addOns]?.toString() || '',
    finish: row[COLUMN_MAP.finish]?.toString() || '',
    finalStatus: row[COLUMN_MAP.finalStatus]?.toString() || '',
  };
}

/** Read all order rows from the main sheet */
export async function getAllOrders(): Promise<OrderRow[]> {
  if (!APPS_SCRIPT_URL) return [];

  const cached = getCache<OrderRow[]>('all_orders');
  if (cached) return cached;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?type=all_orders`, {
      method: 'GET',
      next: { revalidate: 0 }, // prevent next.js hard caching
    });
    
    const json = await response.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch orders");

    const rows = json.data || [];
    const orders = rows
      .map((row: any[], index: number) => parseRow(row, index + 2)) // +2 because row 1 is header
      .filter((order: OrderRow) => order.purchaseOrder.trim() !== '');

    setCache('all_orders', orders);
    return orders;
  } catch(e) {
    console.error("Fetch orders error:", e);
    return [];
  }
}

/** Read dropdown values */
export async function getDropdownValues(): Promise<{
  machines: string[];
  dyeingHouses: string[];
}> {
  if (!APPS_SCRIPT_URL) return { machines: [], dyeingHouses: [] };

  const cached = getCache<{ machines: string[]; dyeingHouses: string[] }>('dropdowns');
  if (cached) return cached;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?type=dropdowns`);
    const json = await response.json();
    if (!json.success) throw new Error(json.error);
    
    setCache('dropdowns', json.data);
    return json.data;
  } catch(e) {
    console.error("Fetch dropdowns error:", e);
    return { machines: [], dyeingHouses: [] };
  }
}

/** Get users from the USERS tab for authentication */
export async function getUserCredentials() {
  if (!APPS_SCRIPT_URL) return [];

  const cached = getCache<any[]>('sheet_users');
  if (cached) return cached;

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?type=users`);
    const json = await response.json();
    if (!json.success) throw new Error(json.error);

    const rows = json.data || [];
    const users = rows.map((row: any[]) => ({
      name: row[0]?.toString().trim() || '',
      password: row[1]?.toString().trim() || '',
      role: (row[2]?.toString().trim().toUpperCase() || 'VIEWER'),
      whatsapp: row[3]?.toString().trim() || '',
      active: row[4]?.toString().trim().toLowerCase() !== 'false',
    })).filter((u: any) => u.name && u.password);

    setCache('sheet_users', users, 60000);
    return users;
  } catch (error) {
    console.error('Failed to fetch users from sheet:', error);
    return [];
  }
}

/** Update a specific cell in the sheet */
export async function updateCell(rowIndex: number, columnIndex: number, value: string): Promise<void> {
  if (!APPS_SCRIPT_URL) return;

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'update', rowIndex, columnIndex, value }),
  });
  setCache('all_orders', null);
}

/** Batch update multiple cells */
export async function batchUpdateCells(
  updates: { rowIndex: number; columnIndex: number; value: string }[]
): Promise<void> {
  if (!APPS_SCRIPT_URL || updates.length === 0) return;

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'batchUpdate', updates }),
  });
  setCache('all_orders', null);
}

/** Append a new row to the sheet */
export async function appendRow(values: string[]): Promise<void> {
  if (!APPS_SCRIPT_URL) return;

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'append', values }),
  });
  setCache('all_orders', null);
}

/** Find row index by composite key (PO + Item + Colour) */
export async function findRowByCompositeKey(
  purchaseOrder: string,
  item: string,
  colour: string
): Promise<number | null> {
  const orders = await getAllOrders();
  const found = orders.find(
    (o) =>
      o.purchaseOrder.trim().toUpperCase() === purchaseOrder.trim().toUpperCase() &&
      o.item.trim().toUpperCase() === item.trim().toUpperCase() &&
      o.colour.trim().toUpperCase() === colour.trim().toUpperCase()
  );
  return found ? found.rowIndex : null;
}
