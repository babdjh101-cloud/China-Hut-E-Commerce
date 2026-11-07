import React from 'react';
import { X, ShieldCheck, FileText, Truck } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | 'delivery' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const contentMap = {
    privacy: {
      title: 'গোপনীয়তা নীতিমালা (Privacy Policy)',
      icon: ShieldCheck,
      content: (
        <div className="space-y-2.5 text-xs text-[#53645E] leading-relaxed">
          <p>
            <strong>চায়না হাট (China Hut)</strong> গ্রাহকদের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা ও গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">১. সংগৃহীত তথ্য</h4>
          <p>
            শুধুমাত্র পণ্য ডেলিভারি সম্পন্ন করার জন্য আপনার নাম, মোবাইল নম্বর এবং পূর্ণ ঠিকানা সংগ্রহ করা হয়।
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">২. নিরাপত্তা</h4>
          <p>
            আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করা হয় না। শুধুমাত্র নির্ভরযোগ্য ডেলিভারি কুরিয়ারের মাধ্যমে পার্সেল পৌঁছে দেওয়ার জন্য তথ্য ব্যবহৃত হয়।
          </p>
        </div>
      ),
    },
    terms: {
      title: 'ব্যবহারের শর্তাবলী (Terms & Conditions)',
      icon: FileText,
      content: (
        <div className="space-y-2.5 text-xs text-[#53645E] leading-relaxed">
          <p>
            চায়না হাট থেকে পণ্য ক্রয়ের ক্ষেত্রে নিম্নোক্ত নিয়মাবলী প্রযোজ্য:
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">১. পেমেন্ট ও ডেলিভারি</h4>
          <p>
            সকল অর্ডারে ক্যাশ অন ডেলিভারি প্রযোজ্য। পণ্য হাতে পেয়ে ডেলিভারিম্যানকে বিল পরিশোধ করবেন।
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">২. রিটার্ন</h4>
          <p>
            ডেলিভারির সময় প্যাকেজিং ক্ষতিগ্রস্ত পেলে ডেলিভারিম্যানের সামনেই আমাদের হটলাইনে যোগাযোগ করে পার্সেল ফেরত বা পরিবর্তন করতে পারবেন।
          </p>
        </div>
      ),
    },
    delivery: {
      title: 'ডেলিভারি নীতিমালা (Delivery Policy)',
      icon: Truck,
      content: (
        <div className="space-y-2.5 text-xs text-[#53645E] leading-relaxed">
          <p>
            আমরা সারা বাংলাদেশে বিশ্বস্ত হোম ডেলিভারি নিশ্চিত করি।
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">১. চার্জ ও অফার</h4>
          <p>
            ১টি বোতল (৳৮৩০) অথবা ২টি বোতল (৳১,৫৮০) যেকোনো অফারেই সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি (৳০)!
          </p>
          <h4 className="font-bold text-[#65051F] text-xs">২. সময়</h4>
          <p>
            ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।
          </p>
        </div>
      ),
    },
  };

  const selected = contentMap[type];
  const Icon = selected.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFF8ED] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-[#D6A638]/50 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-[#65051F] hover:bg-[#F3E9D7] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3 text-[#65051F]">
          <div className="w-9 h-9 rounded-xl bg-[#65051F] flex items-center justify-center border border-[#D6A638]/40 shadow-xs">
            <Icon className="w-4 h-4 text-[#D6A638]" />
          </div>
          <h3 className="text-base font-black font-display text-[#65051F]">{selected.title}</h3>
        </div>

        <div className="border-t border-[#E9CD78]/50 pt-3">{selected.content}</div>

        <div className="mt-5 pt-3 border-t border-[#E9CD78]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#65051F] text-[#FFF8ED] hover:bg-[#850D22] border border-[#D6A638]/40 transition-colors cursor-pointer shadow-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
