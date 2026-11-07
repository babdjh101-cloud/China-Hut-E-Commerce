import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Gift,
} from 'lucide-react';
import { formatBDT, calculateOrderTotals, generateWhatsAppOrderUrl } from '../lib/currency';
import { INITIAL_PRODUCT } from '../config/constants';
import { trackAddToCart, trackPackageSelect, trackWhatsAppClick } from '../lib/gtm';

interface HeroSectionProps {
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onOrderClick: () => void;
  onImageClick: (imgUrl: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  quantity,
  onQuantityChange,
  onOrderClick,
  onImageClick,
}) => {
  const images = INITIAL_PRODUCT.images;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const regularUnitPrice = INITIAL_PRODUCT.originalPrice;
  const unitPrice = INITIAL_PRODUCT.price;
  const pricing = calculateOrderTotals(unitPrice, quantity, INITIAL_PRODUCT.baseDeliveryCharge);

  // Smooth auto-advance every 3.5s
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, images.length]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // WhatsApp order URL generator
  const whatsappData = generateWhatsAppOrderUrl(
    INITIAL_PRODUCT.name,
    quantity,
    unitPrice,
    pricing.deliveryCharge,
    pricing.total
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#65051F] via-[#7A0D26] to-[#65051F] pt-4 pb-12 sm:pb-16 border-b border-[#D6A638]/40 text-[#FFF8ED]">
      {/* Luxury Gold & Maroon Ambient Backlight */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D6A638]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#850D22]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Free Delivery Campaign Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
        <div className="bg-[#850D22] text-[#FFF8ED] px-4 py-2.5 rounded-2xl shadow-md border border-[#D6A638]/50 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold">
            <Gift className="w-4 h-4 text-[#D6A638] shrink-0" />
            <span className="tracking-wide">১টি বোতল ৳৮৩০ ও ২টি বোতল ৳১,৫৮০ — ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
          </div>
          <div className="text-xs font-bold text-[#E9CD78] bg-[#65051F] px-3 py-1 rounded-full border border-[#D6A638]/30">
            ক্যাশ অন ডেলিভারি
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div
              className="relative w-full max-w-md sm:max-w-lg bg-[#FFF8ED] rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-[#D6A638]/40 group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
            >
              {/* Savings & Offer Badge */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
                <div className="bg-[#65051F] text-[#FFF8ED] font-bold text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-[#D6A638]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6A638]" />
                  <span>৳{regularUnitPrice - unitPrice} ছাড়!</span>
                </div>
                {pricing.isFreeDelivery && (
                  <div className="bg-[#D6A638] text-[#20040B] font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>ফ্রি ডেলিভারি</span>
                  </div>
                )}
              </div>

              {/* Volume Badge */}
              <div className="absolute top-4 right-4 z-20 bg-[#F3E9D7] text-[#65051F] font-bold text-xs px-3 py-1 rounded-full border border-[#E9CD78]">
                ৫০ মিলি
              </div>

              {/* Floating Image Stage - Click to Order */}
              <div
                className="relative aspect-square flex items-center justify-center cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-[#F3E9D7]/60 to-[#FFF8ED] group/stage"
                onClick={() => onOrderClick()}
                title="অর্ডার করতে ক্লিক করুন"
              >
                <div className="w-full h-full flex items-center justify-center p-4 animate-gentle-float">
                  {images.map((img, idx) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.alt}
                      className={`max-h-[350px] sm:max-h-[390px] w-auto object-contain absolute transition-all duration-700 ease-in-out ${
                        idx === currentImageIndex
                          ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
                          : 'opacity-0 scale-95 translate-x-3 pointer-events-none'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>

                {/* Click to Order Badge */}
                <div className="absolute bottom-3 z-10 px-3.5 py-1.5 rounded-full bg-[#65051F]/95 text-[#FFF8ED] text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-[#D6A638] backdrop-blur-xs opacity-95 group-hover/stage:opacity-100 group-hover/stage:scale-105 transition-all">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#D6A638]" />
                  <span>অর্ডার করতে ক্লিক করুন</span>
                </div>

                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFF8ED]/95 hover:bg-white text-[#65051F] border border-[#D6A638]/50 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Previous product image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FFF8ED]/95 hover:bg-white text-[#65051F] border border-[#D6A638]/50 shadow-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Next product image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Indicators */}
              <div className="mt-3 flex items-center justify-between px-2 text-xs">
                <span className="text-[11px] font-semibold text-[#850D22]">
                  {images[currentImageIndex].title}
                </span>

                <div className="flex items-center gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsPaused(true);
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentImageIndex
                          ? 'w-6 bg-[#65051F]'
                          : 'w-2 bg-[#E9CD78] hover:bg-[#D6A638]'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Image Thumbnail Selector */}
              <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#E9CD78]/50">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setIsPaused(true);
                      setCurrentImageIndex(idx);
                    }}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      idx === currentImageIndex
                        ? 'border-[#65051F] bg-[#F3E9D7] ring-2 ring-[#D6A638]'
                        : 'border-[#E9CD78]/60 bg-[#FFF8ED] hover:border-[#D6A638]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E9CD78] p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#65051F] truncate">
                      {idx === 0 ? 'বক্স ও বোতল সেট' : 'স্প্রে বোতল ক্লোজ-আপ'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Trust Cards */}
            <div className="w-full max-w-md sm:max-w-lg mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#FFF8ED] p-2.5 rounded-xl border border-[#D6A638]/40 shadow-xs">
                <Truck className="w-4 h-4 mx-auto mb-1 text-[#65051F]" />
                <span className="font-bold block text-[#20040B]">সারাদেশে ডেলিভারি</span>
                <span className="text-[10px] text-[#850D22] font-extrabold">ডেলিভারি সম্পূর্ণ ফ্রি</span>
              </div>
              <div className="bg-[#FFF8ED] p-2.5 rounded-xl border border-[#D6A638]/40 shadow-xs">
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[#65051F]" />
                <span className="font-bold block text-[#20040B]">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[10px] text-[#6B4F55]">পণ্য দেখে টাকা দিন</span>
              </div>
              <div className="bg-[#FFF8ED] p-2.5 rounded-xl border border-[#D6A638]/40 shadow-xs">
                <RotateCcw className="w-4 h-4 mx-auto mb-1 text-[#65051F]" />
                <span className="font-bold block text-[#20040B]">ইনট্যাক্ট সিলড প্যাক</span>
                <span className="text-[10px] text-[#6B4F55]">১০০% আসল পণ্য</span>
              </div>
            </div>
          </div>

          {/* Right Column: Minimalist Content, Pricing, and CTAs */}
          <div className="lg:col-span-6 space-y-5">
            {/* Minimal Kicker */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#850D22] border border-[#D6A638]/50 text-xs font-bold text-[#E9CD78]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A638]" />
              <span>চায়না হাট অফিসিয়াল আমদানিকৃত পণ্য</span>
            </div>

            {/* Title & Short Tagline */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
                SouthMoon Lipoma Removal Spray
              </h1>
              <p className="text-xs sm:text-sm text-[#E9CD78] mt-1 font-medium">
                ত্বকের বাহ্যিক নডুলার অস্বস্তি ও ফ্যাটি লাম্প পরিচর্যায় ৫০ মিলি স্প্রে।
              </p>
            </div>

            {/* 3 Essential Packaging Claims */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-[#850D22]/80 border border-[#D6A638]/40 text-xs font-semibold text-[#FFF8ED] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D6A638]" /> Nodular discomfort
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#850D22]/80 border border-[#D6A638]/40 text-xs font-semibold text-[#FFF8ED] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D6A638]" /> Fat lump removal
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#850D22]/80 border border-[#D6A638]/40 text-xs font-semibold text-[#FFF8ED] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D6A638]" /> Lipolysis
              </span>
            </div>

            {/* Minimalist Pricing & Package Card */}
            <div className="bg-[#FFF8ED] rounded-3xl p-5 sm:p-6 border-2 border-[#D6A638]/40 shadow-xl space-y-4 text-[#20040B]">
              {/* Package Selector - Highlight Approved Offers */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#65051F]">প্যাকেজ অফার নির্বাচন করুন:</span>
                  <span className="text-[#65051F] font-bold bg-[#D6A638]/25 px-2.5 py-0.5 rounded-full border border-[#D6A638]/50">
                    ডেলিভারি সম্পূর্ণ ফ্রি 🎉
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* OFFER 1: 1 Bottle */}
                  <button
                    type="button"
                    onClick={() => {
                      onQuantityChange(1);
                      trackPackageSelect('Offer 1: 1 Bottle', 1, 830);
                      trackAddToCart({ id: INITIAL_PRODUCT.id, name: INITIAL_PRODUCT.name, price: 830 }, 1, 830);
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
                      onQuantityChange(2);
                      trackPackageSelect('Offer 2: 2 Bottles', 2, 1580);
                      trackAddToCart({ id: INITIAL_PRODUCT.id, name: INITIAL_PRODUCT.name, price: 830 }, 2, 1580);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all relative cursor-pointer ${
                      quantity === 2
                        ? 'bg-[#65051F] text-[#FFF8ED] border-2 border-[#D6A638] font-bold shadow-md'
                        : 'bg-white text-[#20040B] border-[#E9CD78] hover:border-[#D6A638]'
                    }`}
                  >
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#65051F] text-[#E9CD78] text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs border border-[#D6A638]">
                      সেরা সাশ্রয়ী অফার · ফ্রি ডেলিভারি
                    </span>
                    <span className="block text-xs font-bold">২টি বোতল</span>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="text-sm sm:text-base font-black font-mono">৳১,৫৮০</span>
                      <span className="line-through text-stone-400 font-mono text-[11px]">৳২,১০০</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 border-t border-[#EADBC5] pt-3 text-xs sm:text-sm">
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
                      <span className="bg-[#D6A638]/30 px-1.5 py-0.5 rounded text-xs">ফ্রি (৳০)</span>
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[#20040B]">
                      {formatBDT(pricing.deliveryCharge)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#65051F] border-t border-[#EADBC5] pt-2">
                  <span>মোট বিল:</span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-[#65051F]">
                    {formatBDT(pricing.total)}
                  </span>
                </div>
              </div>

              {/* CTAs - Prominent Gold Order Now Button */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onOrderClick()}
                  className="w-full py-4 px-6 rounded-xl font-black text-sm sm:text-base text-[#65051F] bg-gradient-to-r from-[#D6A638] via-[#E9CD78] to-[#D6A638] hover:brightness-105 shadow-md hover:shadow-lg border border-[#F2DE9D] transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5 text-[#65051F]" />
                  <span>অর্ডার করুন ({formatBDT(pricing.total)})</span>
                  <ArrowDown className="w-4 h-4 text-[#65051F]" />
                </button>

                <a
                  href={whatsappData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('hero_section', quantity, pricing.total)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
                  <span>WhatsApp-এ সরাসরি অর্ডার</span>
                </a>
              </div>

              <div className="text-center text-[11px] font-semibold text-[#850D22]">
                ক্যাশ অন ডেলিভারি · পণ্য পেয়ে মূল্য পরিশোধ করুন
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
