import React, { useState } from 'react';
import { ZoomIn, Camera, Check, ShoppingCart } from 'lucide-react';

interface ProductGalleryProps {
  onImageZoom: (url: string) => void;
  onOrderClick: () => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ onImageZoom, onOrderClick }) => {
  const [selectedAngle, setSelectedAngle] = useState(0);

  const galleryItems = [
    {
      id: 1,
      title: 'বক্স ও স্প্রে বোতল (অফিসিয়াল সেট)',
      tag: 'Box & Bottle Set',
      caption: 'সাউথমুন লাইপোমা রিমুভাল স্প্রে ৫০ মিলি সম্পূর্ণ প্যাকেজিং',
      url: '/assets/images/products/southmoon_box_and_bottle.png',
    },
    {
      id: 2,
      title: '৫০ মিলি স্প্রে বোতল (ক্লোজ-আপ ভিউ)',
      tag: 'Spray Bottle Solo',
      caption: 'ক্লিয়ার ক্যাপসহ কমপ্যাক্ট ৫০ মিলি স্প্রে বোতল',
      url: '/assets/images/products/southmoon_bottle_solo.png',
    },
  ];

  return (
    <section id="gallery" className="py-10 sm:py-14 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black font-display text-[#65051F] tracking-tight">
            আসল পণ্যের ছবি
          </h2>
          <p className="text-xs text-[#6B4F55] font-medium">
            ১০০% অরিজিনাল সাউথমুন প্যাকেজিং
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Selected Image Showcase */}
          <div className="md:col-span-8 bg-[#FFF8ED] rounded-3xl p-5 sm:p-7 border-2 border-[#D6A638]/40 flex flex-col items-center relative overflow-hidden group shadow-md">
            <div className="absolute top-4 left-4 z-10 bg-[#F3E9D7] backdrop-blur-xs text-[11px] font-bold px-3 py-1 rounded-full text-[#65051F] border border-[#D6A638]/50 shadow-xs">
              {galleryItems[selectedAngle].tag}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageZoom(galleryItems[selectedAngle].url);
              }}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/95 hover:bg-white text-[#65051F] border border-[#D6A638]/40 shadow-sm transition-all cursor-pointer"
              title="বড় করে দেখতে ক্লিক করুন"
            >
              <ZoomIn className="w-4 h-4 text-[#65051F]" />
            </button>

            <div
              className="w-full aspect-square max-h-[360px] flex items-center justify-center cursor-pointer relative group/gal"
              onClick={() => onOrderClick()}
              title="অর্ডার করতে ক্লিক করুন"
            >
              <img
                src={galleryItems[selectedAngle].url}
                alt={galleryItems[selectedAngle].caption}
                className="max-h-[320px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 z-10 px-3.5 py-1.5 rounded-full bg-[#65051F]/95 text-[#FFF8ED] text-[11px] font-bold flex items-center gap-1.5 shadow-md border border-[#D6A638] backdrop-blur-xs opacity-95 group-hover/gal:opacity-100 transition-all">
                <ShoppingCart className="w-3.5 h-3.5 text-[#D6A638]" />
                <span>অর্ডার করতে ক্লিক করুন</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs sm:text-sm font-bold text-[#65051F]">
                {galleryItems[selectedAngle].title}
              </p>
            </div>
          </div>

          {/* Thumbnails Column */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xs font-bold text-[#65051F] block">
              ভিউ নির্বাচন করুন:
            </span>

            <div className="space-y-2.5">
              {galleryItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedAngle(idx)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                    selectedAngle === idx
                      ? 'bg-[#F3E9D7] border-[#65051F] ring-2 ring-[#D6A638] shadow-xs'
                      : 'bg-[#FFF8ED] border-[#E9CD78] hover:border-[#D6A638]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E9CD78] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#20040B] truncate">
                        {item.title}
                      </span>
                      {selectedAngle === idx && (
                        <Check className="w-3.5 h-3.5 text-[#65051F] shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#6B4F55] block truncate mt-0.5 font-medium">
                      {item.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#F3E9D7]/60 border border-[#D6A638]/30 text-[11px] text-[#6B4F55] text-center font-medium">
              🔍 ছবিতে ক্লিক করে ফুলস্ক্রিন জুম করে দেখা যাবে।
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
