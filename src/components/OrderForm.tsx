import React, { useState } from 'react';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Gift,
  Plus,
  Minus,
  MessageCircle,
  ClipboardList,
} from 'lucide-react';
import {
  formatBDT,
  calculateOrderTotals,
  toBengaliNumber,
  generateWhatsAppOrderUrl,
} from '../lib/currency';
import { orderCheckoutSchema } from '../lib/validation';
import { Order } from '../types';
import { submitOrder } from '../services/orderService';
import { trackPurchase, trackPackageSelect, trackWhatsAppClick } from '../lib/gtm';

interface OrderFormProps {
  productPrice: number;
  deliveryCharge: number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onOrderSuccess: (order: Order) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  productPrice,
  deliveryCharge,
  quantity,
  onQuantityChange,
  onOrderSuccess,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic pricing calculation
  const pricing = calculateOrderTotals(productPrice, quantity, deliveryCharge);

  // Pre-filled WhatsApp order URL
  const whatsappData = generateWhatsAppOrderUrl(
    'SouthMoon Lipoma Removal Spray (50ml)',
    quantity,
    productPrice,
    pricing.deliveryCharge,
    pricing.total
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleQuantitySelect = (qty: number) => {
    onQuantityChange(qty);
  };

  const incrementQty = () => {
    if (quantity < 20) {
      onQuantityChange(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = orderCheckoutSchema.safeParse({
      customerName: formData.customerName,
      phone: formData.phone,
      address: formData.address,
      quantity,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(fieldErrors);
      const firstErrorKey = Object.keys(fieldErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await submitOrder({
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        quantity,
        productPrice,
        deliveryCharge,
      });

      setIsSubmitting(false);
      trackPurchase(order, {
        id: 'southmoon-lipoma-spray-50ml',
        name: 'SouthMoon Lipoma Removal Spray (50ml)',
        price: productPrice,
      });
      onOrderSuccess(order);
    } catch (error) {
      console.error('Failed to submit order:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order-form" className="py-12 sm:py-16 bg-[#FFF8ED] border-y border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Centered Heading */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#65051F] text-xs font-bold text-[#FFF8ED] border border-[#D6A638]/50 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6A638]" />
            <span>ক্যাশ অন ডেলিভারি</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#65051F] tracking-tight">
            অর্ডার ফর্ম
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4F55] font-medium">
            পণ্যটি পেতে নিচের ফর্মে আপনার নাম, ঠিকানা ও মোবাইল নম্বর দিন
          </p>
        </div>

        {/* Centered Compact Order Card */}
        <div
          id="order-checkout-card"
          className="bg-[#FFF8ED] rounded-3xl border-2 border-[#D6A638]/50 shadow-xl overflow-hidden transition-all duration-300 scroll-mt-24"
        >
          {/* Card Header Strip */}
          <div className="bg-gradient-to-r from-[#65051F] via-[#850D22] to-[#65051F] text-[#FFF8ED] p-4 sm:p-5 text-center border-b border-[#D6A638]/40">
            <span className="text-[11px] text-[#E9CD78] font-bold tracking-wider block uppercase">
              SouthMoon Lipoma Removal Spray (50ml)
            </span>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-xs text-[#FAF3DE] font-medium">মোট বিল:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#E9CD78]">
                {formatBDT(pricing.total)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
            {/* 1. Package Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#65051F]">
                <span>প্যাকেজ নির্বাচন করুন:</span>
                <div className="flex items-center gap-1 bg-[#F3E9D7] px-2 py-0.5 rounded-lg border border-[#D6A638]/40">
                  <button
                    type="button"
                    onClick={decrementQty}
                    className="w-5 h-5 rounded bg-white text-[#65051F] flex items-center justify-center font-bold text-xs hover:bg-[#FFF8ED] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-mono font-black text-[#65051F] text-xs">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={incrementQty}
                    className="w-5 h-5 rounded bg-white text-[#65051F] flex items-center justify-center font-bold text-xs hover:bg-[#FFF8ED] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Highlighted 2 Package Offers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* OFFER 1: 1 Bottle */}
                <button
                  type="button"
                  onClick={() => {
                    handleQuantitySelect(1);
                    trackPackageSelect('Offer 1: 1 Bottle', 1, 830);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all relative cursor-pointer ${
                    quantity === 1
                      ? 'bg-[#65051F] text-[#FFF8ED] border-2 border-[#D6A638] font-bold shadow-md'
                      : 'bg-white text-[#20040B] border-[#E9CD78] hover:border-[#D6A638]'
                  }`}
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#D6A638] text-[#20040B] text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                    ফ্রি ডেলিভারি
                  </span>
                  <span className="block text-xs font-bold">১টি বোতল</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="text-sm sm:text-base font-black font-mono">৳৮৩০</span>
                    <span className="line-through text-stone-400 font-mono text-[11px]">৳১,০৫০</span>
                  </div>
                </button>

                {/* OFFER 2: 2 Bottles */}
                <button
                  type="button"
                  onClick={() => {
                    handleQuantitySelect(2);
                    trackPackageSelect('Offer 2: 2 Bottles', 2, 1580);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all relative cursor-pointer ${
                    quantity === 2
                      ? 'bg-[#65051F] text-[#FFF8ED] border-2 border-[#D6A638] font-bold shadow-md'
                      : 'bg-white text-[#20040B] border-[#E9CD78] hover:border-[#D6A638]'
                  }`}
                >
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#65051F] text-[#E9CD78] text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs border border-[#D6A638]">
                    সেরা অফার · ফ্রি ডেলিভারি
                  </span>
                  <span className="block text-xs font-bold">২টি বোতল</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="text-sm sm:text-base font-black font-mono">৳১,৫৮০</span>
                    <span className="line-through text-stone-400 font-mono text-[11px]">৳২,১০০</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Essential Customer Information (Only 3 Inputs with Burgundy Labels) */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-[#65051F] block">
                ২. ডেলিভারির তথ্য দিন:
              </span>

              {/* Field 1: Customer Name */}
              <div id="field-customerName" className="space-y-1">
                <label htmlFor="customer-name" className="text-xs font-bold text-[#65051F] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#65051F]" />
                  <span>আপনার নাম <span className="text-rose-600">*</span></span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="নাম লিখুন"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#20040B] bg-white placeholder-stone-400 focus:outline-none transition-colors ${
                    errors.customerName
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : 'border-[#E9CD78] focus:border-[#65051F] focus:ring-1 focus:ring-[#65051F]'
                  }`}
                />
                {errors.customerName && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.customerName}
                  </p>
                )}
              </div>

              {/* Field 2: Mobile Number */}
              <div id="field-phone" className="space-y-1">
                <label htmlFor="customer-phone" className="text-xs font-bold text-[#65051F] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#65051F]" />
                  <span>মোবাইল নম্বর <span className="text-rose-600">*</span></span>
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="০১৭XXXXXXXX"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#20040B] bg-white placeholder-stone-400 focus:outline-none transition-colors ${
                    errors.phone
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : 'border-[#E9CD78] focus:border-[#65051F] focus:ring-1 focus:ring-[#65051F]'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Field 3: Full Delivery Address */}
              <div id="field-address" className="space-y-1">
                <label htmlFor="customer-address" className="text-xs font-bold text-[#65051F] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#65051F]" />
                  <span>ডেলিভারি ঠিকানা <span className="text-rose-600">*</span></span>
                </label>
                <textarea
                  id="customer-address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="জেলা, থানা/উপজেলা, গ্রাম বা এলাকার ঠিকানা"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm text-[#20040B] bg-white placeholder-stone-400 focus:outline-none transition-colors ${
                    errors.address
                      ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500'
                      : 'border-[#E9CD78] focus:border-[#65051F] focus:ring-1 focus:ring-[#65051F]'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Concise Order Bill Summary */}
            <div className="bg-[#F3E9D7] rounded-2xl p-4 border border-[#D6A638]/40 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B4F55]">
                <span>পণ্য মূল্য ({quantity}টি):</span>
                <span className="font-mono font-bold text-[#20040B]">{formatBDT(pricing.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-[#6B4F55]">
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#65051F]" />
                  ডেলিভারি:
                </span>
                {pricing.isFreeDelivery ? (
                  <span className="font-bold text-[#65051F] flex items-center gap-1">
                    <span className="line-through text-stone-400 font-mono text-xs">৳১০০</span>
                    <span className="bg-[#D6A638]/30 px-1.5 py-0.5 rounded text-xs font-bold">
                      ফ্রি (৳০)
                    </span>
                  </span>
                ) : (
                  <span className="font-mono font-bold text-[#20040B]">{formatBDT(pricing.deliveryCharge)}</span>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-[#EADBC5] pt-2 text-sm font-bold text-[#65051F]">
                <span>মোট প্রদেয়:</span>
                <span className="text-xl font-mono font-black">{formatBDT(pricing.total)}</span>
              </div>

              <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[11px] text-[#6B4F55] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#65051F] shrink-0" />
                <span>ক্যাশ অন ডেলিভারি · পণ্য পেয়ে টাকা দিন</span>
              </div>
            </div>

            {/* Submit Actions - Elegant Gold CTA Button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-5 rounded-xl font-black text-sm sm:text-base text-[#65051F] bg-gradient-to-r from-[#D6A638] via-[#E9CD78] to-[#D6A638] hover:brightness-105 shadow-md hover:shadow-lg border border-[#F2DE9D] transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#65051F]/30 border-t-[#65051F] rounded-full animate-spin" />
                    <span>অর্ডার নেওয়া হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 text-[#65051F]" />
                    <span>অর্ডার কনফার্ম করুন ({formatBDT(pricing.total)})</span>
                  </>
                )}
              </button>

              <a
                href={whatsappData.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('order_form', quantity, pricing.total)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                <span>WhatsApp-এ সরাসরি অর্ডার</span>
              </a>
            </div>
          </form>
        </div>

        {/* Specification & Product Summary (Positioned below the checkout form as reference) */}
        <div id="product-specifications" className="space-y-3 pt-2">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E9D7] text-xs font-bold text-[#65051F] border border-[#D6A638]/40">
              <ClipboardList className="w-3.5 h-3.5 text-[#65051F]" />
              <span>স্পেসিফিকেশন ও মূল্য</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#65051F] tracking-tight">
              পণ্যের সংক্ষিপ্ত বিবরণ
            </h3>
          </div>

          <div className="bg-[#FFF8ED] rounded-2xl border border-[#D6A638]/40 shadow-xs overflow-hidden divide-y divide-[#E9CD78]/60">
            <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm">
              <span className="font-semibold text-[#6B4F55]">পণ্যের নাম</span>
              <span className="font-bold text-[#65051F] text-right">SouthMoon Lipoma Removal Spray</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm">
              <span className="font-semibold text-[#6B4F55]">ব্র্যান্ড ও ভলিউম</span>
              <span className="font-bold text-[#65051F] text-right">SouthMoon · ৫০ মিলি (1.69 fl oz)</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm">
              <span className="font-semibold text-[#6B4F55]">ব্যবহার পদ্ধতি</span>
              <span className="font-bold text-[#65051F] text-right">শুধুমাত্র ত্বকের বাহ্যিক ব্যবহার (External Use)</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm">
              <span className="font-semibold text-[#6B4F55]">মূল্য নির্ধারণ</span>
              <span className="font-bold text-[#65051F] text-right">১টি বোতল ৳৮৩০ · ২টি বোতল ৳১,৫৮০ (পূর্বের মূল্য ৳১,০৫০)</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm">
              <span className="font-semibold text-[#6B4F55]">ডেলিভারি অফার</span>
              <span className="font-bold text-[#850D22] text-right">১টি বা ২টি যেকোনো অফারেই সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
