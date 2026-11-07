import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

export const UsageGuide: React.FC = () => {
  const steps = [
    {
      step: '১',
      title: 'ত্বক পরিষ্কার করুন',
      instruction: 'স্থানটি ধুয়ে শুকিয়ে নিন',
    },
    {
      step: '২',
      title: 'বোতল ঝাঁকান',
      instruction: 'ব্যবহারের আগে ঝাঁকিয়ে নিন',
    },
    {
      step: '৩',
      title: 'স্প্রে ও ম্যাসাজ',
      instruction: 'স্প্রে করে আলতো ম্যাসাজ করুন',
    },
  ];

  return (
    <section id="usage" className="py-8 sm:py-12 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black font-display text-[#65051F] tracking-tight">
            সহজ ৩ ধাপে ব্যবহারবিধি
          </h2>
          <p className="text-xs text-[#6B4F55] font-medium">
            প্রতিদিন ২-৩ বার নিয়মানুযায়ী ব্যবহারযোগ্য
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F3E9D7]/70 rounded-2xl p-4 border border-[#D6A638]/40 shadow-xs space-y-2 text-center flex flex-col items-center hover:border-[#D6A638] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-[#65051F] text-[#D6A638] font-black text-xs flex items-center justify-center font-mono shadow-xs border border-[#D6A638]/40">
                {item.step}
              </div>
              <h3 className="font-bold text-[#65051F] text-xs sm:text-sm">
                {item.title}
              </h3>
              <p className="text-[11px] text-[#6B4F55]">
                {item.instruction}
              </p>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-xl bg-[#F3E9D7] border border-[#D6A638]/40 text-center text-[11px] text-[#6B4F55] font-medium">
          শুধুমাত্র বাহ্যিক ব্যবহারের জন্য। চোখ ও কাটা স্থান থেকে দূরে রাখুন।
        </div>
      </div>
    </section>
  );
};
