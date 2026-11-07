import React from 'react';
import { BRAND_CONFIG } from '../config/constants';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  lightMode = false,
}) => {
  const imageSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Brand Emblem with Uploaded Circular Logo */}
      <div className="relative shrink-0">
        <img
          src={BRAND_CONFIG.logoUrl}
          alt={BRAND_CONFIG.name}
          className={`${imageSizes[size]} rounded-full object-contain shadow-sm border-2 border-[#D6A638] ring-2 ring-[#D6A638]/25 bg-[#65051F]`}
          loading="eager"
        />
      </div>

      {/* Brand Text Lockup */}
      <div className="flex flex-col">
        <span
          className={`font-black font-display tracking-tight leading-tight ${
            lightMode ? 'text-white' : 'text-[#65051F]'
          } ${textSizes[size]}`}
        >
          {BRAND_CONFIG.name}
        </span>
        {showTagline && (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold tracking-wide font-sans -mt-0.5 ${
              lightMode ? 'text-[#E9CD78]' : 'text-[#850D22]'
            }`}
          >
            {BRAND_CONFIG.tagline}
          </span>
        )}
      </div>
    </div>
  );
};

