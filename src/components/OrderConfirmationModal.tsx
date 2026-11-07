import React from 'react';
import {
  CheckCircle2,
  Package,
  Phone,
  MapPin,
  Truck,
  MessageCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types';
import { formatBDT, toBengaliNumber } from '../lib/currency';
import { BRAND_CONFIG } from '../config/constants';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  const whatsappMessage = encodeURIComponent(
    `হ্যালো China Hut, আমি একটি অর্ডার করেছি। অর্ডার আইডি: ${order.orderNumber}, মোট বিল: ${formatBDT(order.totalAmount)}। অনুগ্রহ করে কনফার্ম করবেন।`
  );
  const whatsappUrl = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF8ED] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#D6A638]/50 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-[#65051F] hover:bg-[#F3E9D7] transition-colors cursor-pointer"
          aria-label="Close confirmation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Success Badge */}
        <div className="text-center space-y-1.5 pb-4 border-b border-[#E9CD78]/50">
          <div className="w-14 h-14 rounded-full bg-[#65051F] text-[#FFF8ED] flex items-center justify-center mx-auto border-2 border-[#D6A638] shadow-md">
            <CheckCircle2 className="w-8 h-8 text-[#D6A638]" />
          </div>
          <span className="text-[11px] font-black text-[#850D22] uppercase tracking-wider block">
            অর্ডার সফলভাবে গৃহীত হয়েছে!
          </span>
          <h3 className="text-xl font-black font-display text-[#65051F]">
            ধন্যবাদ, {order.customerName}!
          </h3>
          <p className="text-xs text-[#6B4F55]">
            অর্ডার আইডি: <span className="font-mono font-black text-[#65051F]">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="py-4 space-y-3">
          <div className="bg-[#F3E9D7] rounded-2xl p-4 border border-[#D6A638]/40 space-y-2 text-xs">
            <div className="font-black text-[#65051F] flex items-center justify-between border-b border-[#EADBC5] pb-2">
              <span>সাউথমুন লাইপোমা স্প্রে (৫০ মিলি)</span>
              <span className="font-mono font-bold text-[#65051F]">{toBengaliNumber(order.quantity)} পিস</span>
            </div>

            <div className="space-y-1 text-[#6B4F55]">
              <div className="flex justify-between">
                <span>পণ্যের মূল্য:</span>
                <span className="font-mono font-bold text-[#20040B]">{formatBDT(order.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ডেলিভারি চার্জ:</span>
                {order.deliveryCharge === 0 ? (
                  <span className="font-bold text-[#65051F] font-mono">
                    ফ্রি (৳০)
                  </span>
                ) : (
                  <span className="font-mono font-bold text-[#20040B]">{formatBDT(order.deliveryCharge)}</span>
                )}
              </div>
              <div className="flex justify-between items-center border-t border-[#EADBC5] pt-1.5 font-bold text-[#65051F] text-sm">
                <span>মোট প্রদেয় বিল:</span>
                <span className="font-mono text-base font-black text-[#65051F]">{formatBDT(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-[#FFF8ED] rounded-2xl p-3.5 border border-[#D6A638]/30 text-xs space-y-1.5 text-[#6B4F55]">
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-[#65051F] shrink-0 mt-0.5" />
              <span className="font-mono font-bold text-[#20040B]">{order.phone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#65051F] shrink-0 mt-0.5" />
              <span className="text-[#20040B] font-medium">{order.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="w-3.5 h-3.5 text-[#65051F] shrink-0 mt-0.5" />
              <span>পেমেন্ট: <strong className="text-[#65051F]">ক্যাশ অন ডেলিভারি</strong></span>
            </div>
          </div>

          <div className="p-2.5 bg-[#F3E9D7] rounded-xl border border-[#D6A638]/40 text-[11px] text-[#65051F] font-semibold flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D6A638] shrink-0 mt-0.5" />
            <span>আমাদের প্রতিনিধি শীঘ্রই কল করে আপনার ঠিকানা কনফার্ম করবেন।</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-[#E9CD78]/50">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে অর্ডার কনফার্মেশন পাঠান</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#65051F] bg-[#F3E9D7] hover:bg-[#EADBC5] transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
