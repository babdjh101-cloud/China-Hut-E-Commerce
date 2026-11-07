import React from 'react';
import { Sparkles, ShieldCheck, Droplets, SprayCan as Spray, Clock } from 'lucide-react';

export const ProductIntro: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 bg-[#FFF8ED] border-b border-[#E9CD78]/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E9D7] text-xs font-bold text-[#65051F] border border-[#D6A638]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A638]" />
            <span>প্রাকৃতিক আরাম ও বাহ্যিক যত্ন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#65051F] tracking-tight">
            সহজ ও কার্যকর স্প্রে পরিচর্যা
          </h2>
          <p className="text-[#6B4F55] text-xs sm:text-sm max-w-lg mx-auto font-medium">
            হাত দিয়ে মাখানোর প্রয়োজন নেই—সরাসরি স্প্রে নজলে আক্রান্ত স্থানে সহজে প্রয়োগযোগ্য।
          </p>
        </div>

        {/* 3 Minimal Visual Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F3E9D7]/70 border border-[#D6A638]/40 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#65051F] text-[#FFF8ED] flex items-center justify-center font-bold shadow-xs">
              <Spray className="w-4 h-4 text-[#D6A638]" />
            </div>
            <h3 className="font-bold text-[#65051F] text-sm">সরাসরি স্প্রে সুবিধা</h3>
            <p className="text-xs text-[#6B4F55] leading-relaxed">
              নির্দিষ্ট নজলের মাধ্যমে লক্ষ্যযুক্ত স্থানে পরিমিত স্প্রে হয়।
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F3E9D7]/70 border border-[#D6A638]/40 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#65051F] text-[#FFF8ED] flex items-center justify-center font-bold shadow-xs">
              <Droplets className="w-4 h-4 text-[#D6A638]" />
            </div>
            <h3 className="font-bold text-[#65051F] text-sm">দ্রুত ত্বকে শোষণ</h3>
            <p className="text-xs text-[#6B4F55] leading-relaxed">
              হালকা তরল ফর্মুলেশন, অল্প ম্যাসাজেই ত্বক শুষে নেয়।
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#F3E9D7]/70 border border-[#D6A638]/40 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#65051F] text-[#FFF8ED] flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D6A638]" />
            </div>
            <h3 className="font-bold text-[#65051F] text-sm">১০০% আসল সাউথমুন</h3>
            <p className="text-xs text-[#6B4F55] leading-relaxed">
              আমদানিকৃত ইনট্যাক্ট সিলড প্যাকেজিং সরবরাহ করা হয়।
            </p>
          </div>
        </div>

        {/* Short Legal Note */}
        <div className="p-3 rounded-xl bg-[#F3E9D7] border border-[#D6A638]/40 text-center text-[11px] text-[#6B4F55] font-medium">
          এটি কোনো প্রেসক্রিপশন মেডিসিন নয়; শুধুমাত্র ত্বকের বাহ্যিক পরিচর্যার জন্য অনুমোদিত স্প্রে।
        </div>
      </div>
    </section>
  );
};
