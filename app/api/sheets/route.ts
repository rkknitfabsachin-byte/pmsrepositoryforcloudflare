// ============================
// GET /api/sheets — Read all orders
// POST /api/sheets — Update cell(s)
// ============================

import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, updateCell, batchUpdateCells, appendRow, getDropdownValues } from '@/lib/sheets';
import { COLUMN_MAP } from '@/lib/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'dropdowns') {
      const dropdowns = await getDropdownValues();
      return NextResponse.json({ success: true, data: dropdowns });
    }

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Sheets GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read sheet',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update') {
      // Single cell update
      const { rowIndex, columnIndex, value } = body;
      if (!rowIndex || columnIndex === undefined || value === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing rowIndex, columnIndex, or value' },
          { status: 400 }
        );
      }
      await updateCell(rowIndex, columnIndex, value);
      return NextResponse.json({ success: true });
    }

    if (action === 'batchUpdate') {
      // Multiple cell updates
      const { updates } = body;
      if (!updates || !Array.isArray(updates)) {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid updates array' },
          { status: 400 }
        );
      }
      await batchUpdateCells(updates);
      return NextResponse.json({ success: true });
    }

    if (action === 'append') {
      // Append new row
      const { values } = body;
      if (!values || !Array.isArray(values)) {
        return NextResponse.json(
          { success: false, error: 'Missing or invalid values array' },
          { status: 400 }
        );
      }
      // Ensure we have all 28 columns
      const paddedValues = [...values];
      while (paddedValues.length < Object.keys(COLUMN_MAP).length) {
        paddedValues.push('');
      }
      await appendRow(paddedValues);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: update, batchUpdate, append' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Sheets POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write to sheet',
      },
      { status: 500 }
    );
  }
}
