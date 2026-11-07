/**
 * BDT Currency & Order Pricing Engine
 * China Hut Approved Pricing Rules:
 * - Offer 1: 1 Bottle = ৳830 (Delivery FREE ৳0, Total: ৳830)
 * - Offer 2: 2 Bottles = ৳1,580 (Delivery FREE ৳0, Total: ৳1,580)
 * - Previous reference price: ৳1,050
 */

import { BRAND_CONFIG } from '../config/constants';

export function formatBDT(amount: number): string {
  const rounded = Math.round(amount);
  return `৳${rounded.toLocaleString('en-IN')}`;
}

export function formatBDTWithSuffix(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('en-IN')} BDT`;
}

export function toBengaliNumber(input: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (w) => banglaDigits[+w]);
}

export interface OrderPricingBreakdown {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  baseDeliveryCharge: number;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  deliverySavings: number;
  total: number;
}

/**
 * Calculates order pricing according to approved China Hut offers:
 * - 1 Bottle: Product Total = ৳830, Delivery = ৳0, Total = ৳830
 * - 2 Bottles: Product Total = ৳1,580, Delivery = ৳0, Total = ৳1,580
 * - For quantities above 2: maintains standard unit pricing rule (830 BDT/bottle) with free delivery.
 */
export function calculateOrderTotals(
  unitPrice: number = 830,
  quantity: number = 1,
  baseDeliveryCharge: number = 0
): OrderPricingBreakdown {
  const validQty = Math.max(1, Math.floor(quantity || 1));
  
  let subtotal: number;
  if (validQty === 1) {
    subtotal = 830;
  } else if (validQty === 2) {
    subtotal = 1580;
  } else {
    subtotal = validQty * (unitPrice || 830);
  }

  // Delivery charge is FREE for approved offers
  const deliveryCharge = 0;
  const isFreeDelivery = true;
  const deliverySavings = 100; // Customer saves standard 100 BDT courier charge
  const total = subtotal + deliveryCharge;

  return {
    quantity: validQty,
    unitPrice: validQty === 2 ? 790 : (unitPrice || 830),
    subtotal,
    baseDeliveryCharge: 0,
    deliveryCharge,
    isFreeDelivery,
    deliverySavings,
    total,
  };
}

/**
 * Generates an official WhatsApp Click-to-Chat URL with pre-filled Bengali order message.
 * Format: https://wa.me/PHONE_NUMBER?text=ENCODED_MESSAGE
 */
export function generateWhatsAppOrderUrl(
  productName: string,
  quantity: number,
  unitPrice: number,
  deliveryCharge: number,
  totalAmount: number,
  customPhone?: string
): { url: string; isConfigured: boolean; message: string; phoneUsed: string } {
  const rawPhone = customPhone || BRAND_CONFIG.contact.whatsapp || '';
  const sanitizedPhone = rawPhone.replace(/[^0-9]/g, '');

  const isConfigured = Boolean(
    sanitizedPhone &&
      sanitizedPhone.length >= 10 &&
      !sanitizedPhone.startsWith('0000') &&
      sanitizedPhone !== '1700000000'
  );

  const deliveryText =
    deliveryCharge === 0 ? 'ফ্রি ডেলিভারি (৳০)' : formatBDT(deliveryCharge);

  const message = [
    `হ্যালো China Hut, আমি SouthMoon Lipoma Removal Spray অর্ডার করতে চাই:`,
    ``,
    `• পণ্য: ${productName}`,
    `• পরিমাণ: ${quantity} টি (${toBengaliNumber(quantity)} পিস)`,
    `• একক মূল্য: ${formatBDT(unitPrice)}`,
    `• ডেলিভারি চার্জ: ${deliveryText}`,
    `• সর্বমোট প্রদেয় বিল: ${formatBDT(totalAmount)}`,
    ``,
    `পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ)`,
    `অনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।`,
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  const url = isConfigured
    ? `https://wa.me/${sanitizedPhone}?text=${encodedMessage}`
    : '#';

  return {
    url,
    isConfigured,
    message,
    phoneUsed: sanitizedPhone,
  };
}
