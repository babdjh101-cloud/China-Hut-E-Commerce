import React from 'react';
import { SprayCan as Spray, Droplets, PackageCheck, ShieldCheck } from 'lucide-react';

export const ProductFeatures: React.FC = () => {
  const features = [
    {
      icon: Spray,
      title: '৫০ মিলি স্প্রে',
      description: 'নির্দিষ্ট স্থানে সহজে স্প্রেযোগ্য',
    },
    {
      icon: Droplets,
      title: 'নন-গ্রীসি ফর্মুলা',
      description: 'আঠালো ভাব ছাড়াই দ্রুত শোষণ',
    },
    {
      icon: PackageCheck,
      title: 'বহনযোগ্য সাইজ',
      description: 'সহজে সাথে রাখা যায়',
    },
    {
      icon: ShieldCheck,
      title: '১০০% আসল পণ্য',
      description: 'ইনট্যাক্ট সিলড প্যাকেজিং',
    },
  ];

  return (
    <section id="features" className="py-8 sm:py-12 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-black font-display text-[#65051F] tracking-tight">
            পণ্যের মূল সুবিধাসমূহ
          </h2>
          <p className="text-xs text-[#6B4F55] font-medium">
            সহজ ও নিয়মিত বাহ্যিক পরিচর্যা
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-[#F3E9D7]/70 rounded-2xl p-4 border border-[#D6A638]/40 shadow-xs text-center flex flex-col items-center space-y-2 hover:border-[#D6A638] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#65051F] text-[#FFF8ED] flex items-center justify-center shadow-xs">
                  <Icon className="w-5 h-5 text-[#D6A638]" />
                </div>
                <h3 className="font-bold text-[#65051F] text-xs sm:text-sm">{feature.title}</h3>
                <p className="text-[11px] text-[#6B4F55]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
