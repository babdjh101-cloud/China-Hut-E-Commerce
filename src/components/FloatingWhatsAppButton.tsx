import React from 'react';
import { MessageCircle } from 'lucide-react';
import { generateWhatsAppOrderUrl, calculateOrderTotals, formatBDT } from '../lib/currency';
import { INITIAL_PRODUCT } from '../config/constants';

interface FloatingWhatsAppButtonProps {
  quantity: number;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({ quantity }) => {
  const pricing = calculateOrderTotals(INITIAL_PRODUCT.price, quantity, INITIAL_PRODUCT.baseDeliveryCharge);

  const whatsappData = generateWhatsAppOrderUrl(
    INITIAL_PRODUCT.name,
    quantity,
    INITIAL_PRODUCT.price,
    pricing.deliveryCharge,
    pricing.total
  );

  return (
    <aside aria-label="WhatsApp Order" className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-40 group">
      <a
        href={whatsappData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/80"
        title="WhatsApp-এ অর্ডার করুন"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight">WhatsApp-এ অর্ডার করুন</span>
          <span className="text-[10px] text-white/90 leading-tight">
            বিল: {formatBDT(pricing.total)}
          </span>
        </div>
      </a>
    </aside>
  );
};
