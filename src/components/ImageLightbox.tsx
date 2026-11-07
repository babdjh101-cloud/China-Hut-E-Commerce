import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  imageUrl,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full max-h-[90vh] bg-[#FFF8ED] rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#D6A638]/50 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#F3E9D7] hover:bg-[#EADBC5] text-[#65051F] transition-colors z-10 cursor-pointer"
          aria-label="Close zoom preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full flex-1 flex items-center justify-center overflow-hidden py-3">
          <img
            src={imageUrl}
            alt="SouthMoon Lipoma Removal Spray High Resolution Zoom"
            className="max-h-[70vh] w-auto object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="w-full text-center border-t border-[#E9CD78]/50 pt-2.5">
          <p className="text-xs font-black text-[#65051F]">
            SouthMoon Lipoma Removal Spray (50ml)
          </p>
          <p className="text-[11px] text-[#850D22] font-semibold">
            চায়না হাট অরিজিনাল আমদানিকৃত পণ্য
          </p>
        </div>
      </div>
    </div>
  );
};
