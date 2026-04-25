'use client';

// ============================
// OrderCard — Individual order line item card
// ============================

import React, { useState } from 'react';
import { type OrderRow } from '@/lib/types';
import StatusBadge from './StatusBadge';
import WhatsAppButton from './WhatsAppButton';
import { ChevronDown, ChevronUp, Package, Ruler, Weight } from 'lucide-react';

interface OrderCardProps {
  order: OrderRow;
  /** Which module we're viewing from — determines which fields to emphasize */
  module?: 'planning' | 'yarn' | 'production' | 'dyeing' | 'completion' | 'orders';
  /** Whether to show expanded details by default */
  defaultExpanded?: boolean;
  /** Action button slot */
  actionButton?: React.ReactNode;
  /** Click handler for the card */
  onClick?: () => void;
  /** Whether the card is selected */
  selected?: boolean;
}

export default function OrderCard({
  order,
  module = 'orders',
  defaultExpanded = false,
  actionButton,
  onClick,
  selected = false,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const qtyNum = parseFloat(order.qty) || 0;

  return (
    <div
      className={`card animate-fadeIn cursor-pointer transition-all ${
        selected ? 'ring-2 ring-accent border-accent' : ''
      }`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-primary text-sm">
              {order.purchaseOrder}
            </span>
            <StatusBadge status={order.status} size="sm" />
            {order.finalStatus && (
              <StatusBadge status={order.finalStatus} size="sm" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-text-muted">
            <span className="font-semibold text-text truncate">
              {order.item}
            </span>
            <span className="text-xs">•</span>
            <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
              {order.colour}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="font-mono text-base font-bold text-text">
              {qtyNum > 0 ? `${qtyNum}` : '—'}
            </div>
            <div className="text-[0.625rem] text-text-muted font-heading font-semibold uppercase">
              kg
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Party name bar */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium">
          {order.party}
        </span>
        {order.rate && (
          <span className="text-xs font-mono text-text-muted">
            ₹{order.rate}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border-light px-4 py-3 space-y-3 animate-slideUp bg-bg/50">
          {/* Order details row */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            {order.gsm && (
              <div className="flex items-center gap-1.5">
                <Weight size={12} className="text-text-muted" />
                <span className="text-text-muted">GSM:</span>
                <span className="font-mono font-semibold">{order.gsm}</span>
              </div>
            )}
            {order.machineAllotted && (
              <div className="flex items-center gap-1.5 col-span-2">
                <Package size={12} className="text-text-muted" />
                <span className="text-text-muted">Machine:</span>
                <span className="font-semibold truncate">{order.machineAllotted}</span>
              </div>
            )}
            {order.slKoraGsm && (
              <div className="flex items-center gap-1.5">
                <Ruler size={12} className="text-text-muted" />
                <span className="text-text-muted">Kora GSM:</span>
                <span className="font-mono font-semibold">{order.slKoraGsm}</span>
              </div>
            )}
          </div>

          {/* Planning notes */}
          {order.planningNotes && (
            <div className="bg-bg rounded-md p-2.5 border border-border-light">
              <div className="text-[0.625rem] font-heading font-semibold text-text-muted uppercase mb-1">
                Planning Notes
              </div>
              <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">
                {order.planningNotes}
              </p>
            </div>
          )}

          {/* Yarn details */}
          {(order.yarn1 || order.yarn2) && (
            <div className="space-y-1.5">
              <div className="text-[0.625rem] font-heading font-semibold text-text-muted uppercase">
                Yarn Details
              </div>
              {order.yarn1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded font-semibold text-[0.625rem]">
                    Y1
                  </span>
                  <span className="font-medium">{order.yarn1}</span>
                  {order.yarn1Stock && (
                    <span className="text-text-muted">
                      Stock: <span className="font-mono">{order.yarn1Stock}</span>
                    </span>
                  )}
                  {order.yarn1Ordered && (
                    <span className="text-text-muted">
                      Ord: <span className="font-mono">{order.yarn1Ordered}</span>
                    </span>
                  )}
                </div>
              )}
              {order.yarn2 && order.yarn2.toUpperCase() !== 'NILL' && order.yarn2.toUpperCase() !== 'NIL' && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 bg-purple/10 text-purple rounded font-semibold text-[0.625rem]">
                    Y2
                  </span>
                  <span className="font-medium">{order.yarn2}</span>
                  {order.yarn2Stock && (
                    <span className="text-text-muted">
                      Stock: <span className="font-mono">{order.yarn2Stock}</span>
                    </span>
                  )}
                  {order.yarn2Ordered && (
                    <span className="text-text-muted">
                      Ord: <span className="font-mono">{order.yarn2Ordered}</span>
                    </span>
                  )}
                </div>
              )}
              {order.supplier && (
                <div className="text-xs text-text-muted">
                  Supplier: <span className="font-medium text-text">{order.supplier}</span>
                </div>
              )}
            </div>
          )}

          {/* Production details */}
          {(order.plannedQty || order.balanceQty) && (
            <div className="flex items-center gap-4 text-xs">
              {order.plannedQty && (
                <div>
                  <span className="text-text-muted">Planned: </span>
                  <span className="font-mono font-semibold">{order.plannedQty} kg</span>
                </div>
              )}
              {order.balanceQty && (
                <div>
                  <span className="text-text-muted">Balance: </span>
                  <span className="font-mono font-semibold text-warning">{order.balanceQty} kg</span>
                </div>
              )}
            </div>
          )}

          {/* Dyeing details */}
          {(order.process || order.dyeingHouse) && (
            <div className="flex items-center gap-3 text-xs flex-wrap">
              {order.process && (
                <span className="chip text-xs py-1 px-2">{order.process}</span>
              )}
              {order.dyeingHouse && (
                <span className="text-text-muted">
                  @ <span className="font-medium text-text">{order.dyeingHouse}</span>
                </span>
              )}
              {order.addOns && (
                <span className="text-text-muted">
                  Add-ons: <span className="font-medium text-text">{order.addOns}</span>
                </span>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-2 pt-1">
            {actionButton}
            <WhatsAppButton order={order} module={module} />
          </div>
        </div>
      )}
    </div>
  );
}
