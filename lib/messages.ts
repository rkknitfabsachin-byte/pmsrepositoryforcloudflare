// ============================
// WhatsApp Message Templates
// ============================

import { type OrderRow, type MessageTemplate } from './types';

/** Generate WhatsApp message from template and order data */
export function generateMessage(
  template: MessageTemplate,
  order: OrderRow
): string {
  const templates: Record<MessageTemplate, string> = {
    PLANNING_TO_YARN: `📋 *YARN ACTION REQUIRED*
━━━━━━━━━━━━━━━
*PI:* ${order.purchaseOrder}
*Item:* ${order.item} — ${order.colour}
*Qty:* ${order.qty} kg
*Party:* ${order.party}

*Planning Notes:*
${order.planningNotes || '—'}

*Status:* ${order.status}

⚡ Please confirm yarn availability.
_— PMS Auto_`,

    YARN_TO_PRODUCTION: `🧵 *READY FOR PRODUCTION*
━━━━━━━━━━━━━━━
*PI:* ${order.purchaseOrder}
*Item:* ${order.item} — ${order.colour}
*Qty:* ${order.qty} kg
*Party:* ${order.party}

*Yarn 1:* ${order.yarn1 || '—'} (Stock: ${order.yarn1Stock || '0'} | Ordered: ${order.yarn1Ordered || '0'})
${order.yarn2 ? `*Yarn 2:* ${order.yarn2} (Stock: ${order.yarn2Stock || '0'} | Ordered: ${order.yarn2Ordered || '0'})` : ''}
*Supplier:* ${order.supplier || '—'}

⚡ Please allocate machine.
_— PMS Auto_`,

    PRODUCTION_TO_DYEING: `🏭 *GREY FABRIC READY*
━━━━━━━━━━━━━━━
*PI:* ${order.purchaseOrder}
*Item:* ${order.item} — ${order.colour}
*Qty:* ${order.qty} kg
*Party:* ${order.party}

*Machine:* ${order.machineAllotted || '—'}
*Kora GSM:* ${order.slKoraGsm || '—'}
*Planned:* ${order.plannedQty || '—'} kg | *Balance:* ${order.balanceQty || '0'} kg

⚡ Grey fabric ready for dyeing/finishing. Please arrange pickup.
_— PMS Auto_`,

    DYEING_TO_DISPATCH: `🎨 *SENT FOR PROCESSING*
━━━━━━━━━━━━━━━
*PI:* ${order.purchaseOrder}
*Item:* ${order.item} — ${order.colour}
*Qty:* ${order.qty} kg
*Party:* ${order.party}

*Process:* ${order.process || '—'}
*Dyeing House:* ${order.dyeingHouse || '—'}
*Add-ons:* ${order.addOns || '—'}
*Finish:* ${order.finish || '—'}

⚡ Please track return timeline.
_— PMS Auto_`,

    ORDER_COMPLETE: `✅ *ORDER COMPLETE*
━━━━━━━━━━━━━━━
*PI:* ${order.purchaseOrder}
*Party:* ${order.party}
*Item:* ${order.item} — ${order.colour}
*Qty:* ${order.qty} kg

*Final Status:* ${order.finalStatus}
*Machine:* ${order.machineAllotted || '—'}
*Process:* ${order.process || '—'}

🎉 Order completed successfully.
_— PMS Auto_`,
  };

  return templates[template];
}

/** Generate wa.me link */
export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // Ensure number starts with country code
  let number = phoneNumber.replace(/\D/g, '');
  if (number.startsWith('0')) {
    number = '91' + number.slice(1);
  }
  if (!number.startsWith('91') && number.length === 10) {
    number = '91' + number;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}

/** Get default template for a module transition */
export function getDefaultTemplate(
  fromModule: string
): MessageTemplate | null {
  const map: Record<string, MessageTemplate> = {
    planning: 'PLANNING_TO_YARN',
    yarn: 'YARN_TO_PRODUCTION',
    production: 'PRODUCTION_TO_DYEING',
    dyeing: 'DYEING_TO_DISPATCH',
    completion: 'ORDER_COMPLETE',
  };
  return map[fromModule] || null;
}
