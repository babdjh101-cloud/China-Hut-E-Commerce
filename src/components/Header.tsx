import React, { useState } from 'react';
import { Phone, ShoppingCart, Menu, X, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';
import { BRAND_CONFIG } from '../config/constants';
import { trackWhatsAppClick } from '../lib/gtm';

interface HeaderProps {
  onOrderClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOrderClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Banner Notice - China Hut Deep Burgundy & Luxury Gold */}
      <div className="bg-[#65051F] text-[#FFF8ED] text-xs py-2 px-4 border-b border-[#D6A638]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A638]" />
            <span className="font-semibold tracking-wide">
              সারা বাংলাদেশে ক্যাশ অন ডেলিভারি · ১টি বা ২টি যেকোনো অফারেই ডেলিভারি সম্পূর্ণ ফ্রি!
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#E9CD78]">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6A638]" /> ১০০% অরিজিনাল সাউথমুন
            </span>
            <span>·</span>
            <a
              href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('header_top_banner', 1, 830)}
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-[#D6A638]" /> {BRAND_CONFIG.contact.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Warm Ivory Canvas */}
      <header className="sticky top-0 z-30 bg-[#FFF8ED]/95 backdrop-blur-md border-b border-[#E9CD78]/40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          {/* Brand Wordmark & Official Logo */}
          <a href="#" className="whitespace-nowrap shrink-0">
            <Logo size="md" />
          </a>

          {/* Minimal Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#20040B]">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#850D22] transition-colors whitespace-nowrap cursor-pointer"
            >
              বৈশিষ্ট্য
            </button>
            <button
              onClick={() => scrollToSection('order-form')}
              className="hover:text-[#850D22] transition-colors whitespace-nowrap cursor-pointer text-[#65051F] font-bold"
            >
              অর্ডার ফর্ম
            </button>
            <button
              onClick={() => scrollToSection('product-video')}
              className="hover:text-[#850D22] transition-colors whitespace-nowrap cursor-pointer"
            >
              ভিডিও
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="hover:text-[#850D22] transition-colors whitespace-nowrap cursor-pointer"
            >
              গ্যালারি
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#850D22] transition-colors whitespace-nowrap cursor-pointer"
            >
              জিজ্ঞাসা
            </button>
          </nav>

          {/* Action Zone: WhatsApp & Order Now CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('header_nav', 1, 830)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#65051F] bg-[#F3E9D7] hover:bg-[#EADBC5] transition-colors border border-[#D6A638]/40 shadow-2xs"
              title="WhatsApp-এ মেসেজ পাঠান"
            >
              <Phone className="w-3.5 h-3.5 text-[#65051F]" />
              <span className="font-mono">{BRAND_CONFIG.contact.whatsappDisplay}</span>
            </a>

            <button
              onClick={() => onOrderClick()}
              className="flex items-center gap-2 bg-[#65051F] hover:bg-[#850D22] text-[#FFF8ED] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm border border-[#D6A638]/40 transition-all whitespace-nowrap active:scale-[0.98] cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#D6A638]" />
              <span>অর্ডার করুন (৳৮৩০)</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#65051F] hover:bg-[#F3E9D7] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E9CD78]/40 bg-[#FFF8ED] px-4 pt-3 pb-5 space-y-2.5 shadow-lg">
            <button
              onClick={() => scrollToSection('features')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#20040B] hover:bg-[#F3E9D7]"
            >
              বৈশিষ্ট্য
            </button>
            <button
              onClick={() => scrollToSection('order-form')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-bold text-[#65051F] hover:bg-[#F3E9D7]"
            >
              অর্ডার করুন
            </button>
            <button
              onClick={() => scrollToSection('product-video')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#20040B] hover:bg-[#F3E9D7]"
            >
              ভিডিও
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#20040B] hover:bg-[#F3E9D7]"
            >
              আসল পণ্যের ছবি
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#20040B] hover:bg-[#F3E9D7]"
            >
              সাধারণ জিজ্ঞাসা (FAQ)
            </button>
            <div className="pt-2 border-t border-[#E9CD78]/40">
              <a
                href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-2 px-3 text-sm font-bold text-[#65051F]"
              >
                <Phone className="w-4 h-4 text-[#D6A638]" />
                <span>WhatsApp: {BRAND_CONFIG.contact.whatsappDisplay}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
