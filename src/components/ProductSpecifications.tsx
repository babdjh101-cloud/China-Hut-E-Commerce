import React from 'react';
import { ClipboardList, ShieldCheck } from 'lucide-react';
import { formatBDT } from '../lib/currency';

export const ProductSpecifications: React.FC = () => {
  const specs = [
    { label: 'পণ্যের নাম', value: 'SouthMoon Lipoma Removal Spray' },
    { label: 'ব্র্যান্ড ও ভলিউম', value: 'SouthMoon · ৫০ মিলি (1.69 fl oz)' },
    { label: 'ব্যবহার পদ্ধতি', value: 'শুধুমাত্র ত্বকের বাহ্যিক ব্যবহার (External Use)' },
    { label: 'মূল্য নির্ধারণ', value: '১টি বোতল ৳৮৩০ · ২টি বোতল ৳১,৫৮০ (পূর্বের মূল্য ৳১,০৫০)' },
    { label: 'ডেলিভারি অফার', value: '১টি বা ২টি যেকোনো অফারেই সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!' },
  ];

  return (
    <section id="specifications" className="py-10 sm:py-14 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E9D7] text-xs font-bold text-[#65051F] border border-[#D6A638]/40">
            <ClipboardList className="w-3.5 h-3.5 text-[#D6A638]" />
            <span>স্পেসিফিকেশন ও মূল্য</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#65051F] tracking-tight">
            পণ্যের সংক্ষিপ্ত বিবরণ
          </h2>
        </div>

        {/* Minimal Specs List */}
        <div className="bg-[#FFF8ED] rounded-2xl border-2 border-[#D6A638]/40 shadow-xs overflow-hidden divide-y divide-[#E9CD78]/60">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 sm:p-3.5 text-xs sm:text-sm"
            >
              <span className="font-semibold text-[#6B4F55]">
                {item.label}
              </span>
              <span className="font-bold text-[#65051F] text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
