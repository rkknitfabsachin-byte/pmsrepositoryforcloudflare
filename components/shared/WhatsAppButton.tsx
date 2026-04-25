'use client';

// ============================
// WhatsAppButton — Message composer + wa.me link
// ============================

import React, { useState } from 'react';
import { MessageCircle, Send, X, Phone } from 'lucide-react';
import { type OrderRow, type MessageTemplate } from '@/lib/types';
import { generateMessage, generateWhatsAppLink, getDefaultTemplate } from '@/lib/messages';

interface WhatsAppButtonProps {
  order: OrderRow;
  module?: string;
  contactNumber?: string;
  className?: string;
}

export default function WhatsAppButton({
  order,
  module = 'planning',
  contactNumber,
  className = '',
}: WhatsAppButtonProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(contactNumber || '');

  const openComposer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const template = getDefaultTemplate(module);
    if (template) {
      setMessage(generateMessage(template, order));
    } else {
      setMessage(
        `PI: ${order.purchaseOrder}\nItem: ${order.item} — ${order.colour}\nQty: ${order.qty} kg\nParty: ${order.party}`
      );
    }
    setShowComposer(true);
  };

  const handleSend = () => {
    if (!phoneNumber) return;
    const link = generateWhatsAppLink(phoneNumber, message);
    window.open(link, '_blank');
    setShowComposer(false);
  };

  return (
    <>
      <button
        onClick={openComposer}
        className={`btn btn-whatsapp btn-sm ${className}`}
        title="Send WhatsApp"
      >
        <MessageCircle size={14} />
        <span className="hide-mobile">WhatsApp</span>
      </button>

      {/* Composer Modal (Bottom Sheet on mobile) */}
      {showComposer && (
        <>
          <div
            className="bottom-sheet-overlay active"
            onClick={() => setShowComposer(false)}
          />
          <div className="bottom-sheet active" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />

            <div className="px-5 pb-6 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm">Send WhatsApp</h3>
                    <p className="text-[0.625rem] text-text-muted">
                      {order.purchaseOrder} • {order.item} • {order.colour}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComposer(false)}
                  className="btn btn-ghost btn-icon btn-sm"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Phone number */}
              <div className="mb-3">
                <label className="form-label">
                  <Phone size={12} className="inline mr-1" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="919XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input form-textarea"
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ minHeight: '180px' }}
                />
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!phoneNumber || !message}
                className="btn btn-whatsapp btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                Open in WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
