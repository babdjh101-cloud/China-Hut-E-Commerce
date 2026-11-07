import React from 'react';
import { ShoppingCart, MessageCircle, Truck } from 'lucide-react';
import {
  formatBDT,
  calculateOrderTotals,
  generateWhatsAppOrderUrl,
} from '../lib/currency';
import { INITIAL_PRODUCT } from '../config/constants';

interface StickyMobileOrderBarProps {
  quantity: number;
  productPrice: number;
  baseDeliveryCharge: number;
  onOrderClick: () => void;
}

export const StickyMobileOrderBar: React.FC<StickyMobileOrderBarProps> = ({
  quantity,
  productPrice,
  baseDeliveryCharge,
  onOrderClick,
}) => {
  const pricing = calculateOrderTotals(productPrice, quantity, baseDeliveryCharge);

  const whatsappData = generateWhatsAppOrderUrl(
    INITIAL_PRODUCT.name,
    quantity,
    productPrice,
    pricing.deliveryCharge,
    pricing.total
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF8ED]/95 backdrop-blur-md border-t-2 border-[#D6A638]/50 px-3 py-2 shadow-xl">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Dynamic Price & Offer Indicator */}
        <div className="flex flex-col shrink-0 min-w-[85px]">
          <span className="text-base font-black font-mono text-[#65051F] leading-none">
            {formatBDT(pricing.total)}
          </span>
          <span className="text-[10px] text-[#6B4F55] flex items-center gap-0.5 leading-tight mt-0.5">
            {pricing.isFreeDelivery ? (
              <span className="text-[#65051F] font-bold flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5 text-[#D6A638]" /> ফ্রি ডেলিভারি
              </span>
            ) : (
              <span className="text-[#65051F] font-bold">ফ্রি ডেলিভারি</span>
            )}
          </span>
        </div>

        {/* WhatsApp Mobile Action */}
        <a
          href={whatsappData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs active:scale-95"
          aria-label="Order on WhatsApp"
          title="WhatsApp-এ অর্ডার করুন"
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        </a>

        {/* Primary Gold Order Now Button */}
        <button
          onClick={() => onOrderClick()}
          className="flex-1 h-11 px-3 rounded-xl font-black text-xs text-[#65051F] bg-gradient-to-r from-[#D6A638] via-[#E9CD78] to-[#D6A638] hover:brightness-105 shadow-md border border-[#F2DE9D] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98] cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-[#65051F] shrink-0" />
          <span className="truncate">অর্ডার করুন ({formatBDT(pricing.total)})</span>
        </button>
      </div>
    </div>
  );
};
