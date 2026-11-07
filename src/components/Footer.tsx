import React, { useState } from 'react';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { BRAND_CONFIG } from '../config/constants';
import { PolicyModal } from './PolicyModal';

interface FooterProps {
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'terms' | 'delivery' | null>(null);

  return (
    <>
      <footer className="bg-gradient-to-b from-[#65051F] via-[#500418] to-[#420212] text-[#FFF8ED] pt-12 pb-24 sm:pb-12 text-xs sm:text-sm border-t-2 border-[#D6A638]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-3">
              <Logo size="md" lightMode={true} />

              <p className="text-[#E9CD78] leading-relaxed text-xs max-w-sm pt-1">
                সেরা মানের আমদানিকৃত পণ্য, সাশ্রয়ী মূল্য এবং সারা বাংলাদেশে দ্রুততম ক্যাশ অন ডেলিভারি সেবা।
              </p>

              <div className="flex items-center gap-2 text-xs text-[#FFF8ED] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#D6A638]" />
                <span>১০০% অরিজিনাল ইনট্যাক্ট প্রোডাক্ট গ্যারান্টি</span>
              </div>
            </div>

            {/* Quick Policy Links */}
            <div className="md:col-span-3 space-y-2.5">
              <h4 className="font-bold text-[#E9CD78] text-xs uppercase tracking-wider font-display">
                পলিসি ও নীতিমালা
              </h4>
              <ul className="space-y-1.5 text-xs text-[#FFF8ED]/85">
                <li>
                  <button
                    onClick={() => setActivePolicy('privacy')}
                    className="hover:text-[#D6A638] transition-colors text-left cursor-pointer"
                  >
                    গোপনীয়তা নীতিমালা
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('terms')}
                    className="hover:text-[#D6A638] transition-colors text-left cursor-pointer"
                  >
                    ব্যবহারের শর্তাবলী
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy('delivery')}
                    className="hover:text-[#D6A638] transition-colors text-left cursor-pointer"
                  >
                    ডেলিভারি নীতিমালা
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-4 space-y-2.5">
              <h4 className="font-bold text-[#E9CD78] text-xs uppercase tracking-wider font-display">
                যোগাযোগের তথ্য
              </h4>
              <div className="space-y-2 text-xs text-[#FFF8ED]/85">
                <a
                  href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#25D366] transition-colors font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span className="font-mono">WhatsApp: {BRAND_CONFIG.contact.whatsappDisplay}</span>
                </a>
                <a
                  href={`mailto:${BRAND_CONFIG.contact.email}`}
                  className="flex items-center gap-2 hover:text-[#D6A638] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D6A638] shrink-0" />
                  <span>ইমেইল: {BRAND_CONFIG.contact.email}</span>
                </a>
                <a
                  href={BRAND_CONFIG.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-[#D6A638] transition-colors group"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#D6A638] shrink-0 mt-0.5" />
                  <span>
                    ঠিকানা: {BRAND_CONFIG.contact.address}{' '}
                    <span className="text-[#D6A638] underline text-[11px] block group-hover:text-white">
                      (গুগল ম্যাপে লোকেশন ↗)
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="pt-6 border-t border-[#D6A638]/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#E9CD78]">
            <div>
              © {new Date().getFullYear()} {BRAND_CONFIG.name}. সর্বস্বত্ব সংরক্ষিত।
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#FAF3DE]/70">
              <span>SouthMoon Lipoma Removal Spray (50ml) · সেরা পণ্য, সুলভ মূল্য</span>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="hover:text-[#D6A638] transition-colors underline opacity-60 hover:opacity-100 cursor-pointer"
                  title="অ্যাডমিন প্যানেল প্রবেশ"
                >
                  🔒 অ্যাডমিন
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Dialog Modal */}
      <PolicyModal
        isOpen={Boolean(activePolicy)}
        type={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </>
  );
};
