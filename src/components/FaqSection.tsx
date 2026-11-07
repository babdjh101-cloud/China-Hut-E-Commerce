import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
      answer: 'ঢাকার মধ্যে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৪ দিনে হোম ডেলিভারি।',
    },
    {
      question: 'অগ্রিম কোনো টাকা দিতে হবে কি?',
      answer: 'না, কোনো অগ্রিম টাকা নেই। পণ্য হাতে পেয়ে সম্পূর্ণ মূল্য দিন।',
    },
    {
      question: 'ডেলিভারি চার্জ কত?',
      answer: 'চলমান অফারে ১টি (৳৮৩০) ও ২টি বোতলের (৳১,৫৮০) যেকোনো অর্ডারে সারা বাংলাদেশে হোম ডেলিভারি সম্পূর্ণ ফ্রি (৳০)!',
    },
    {
      question: 'পণ্যটি কি আসল সাউথমুন ব্র্যান্ডের?',
      answer: 'হ্যাঁ, ১০০% আসল ইনট্যাক্ট সিলড সাউথমুন স্প্রে সরবরাহ করা হয়।',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-8 sm:py-12 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E9D7] text-xs font-bold text-[#65051F] border border-[#D6A638]/40">
            <HelpCircle className="w-3.5 h-3.5 text-[#D6A638]" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#65051F] tracking-tight">
            সাধারণ প্রশ্নোত্তর (FAQ)
          </h2>
        </div>

        {/* Minimal Accordion */}
        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#D6A638]/30 bg-[#F3E9D7]/60 overflow-hidden transition-all hover:border-[#65051F]/40 shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-[#20040B] text-xs sm:text-sm focus:outline-none cursor-pointer"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-[#FFF8ED] flex items-center justify-center shrink-0 border border-[#D6A638]/40 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#65051F]' : 'text-stone-500'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#6B4F55] leading-relaxed border-t border-[#E9CD78]/50 pt-2.5 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
