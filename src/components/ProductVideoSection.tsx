import React, { useState, useEffect } from 'react';
import { Play, Video, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND_CONFIG, INITIAL_PRODUCT } from '../config/constants';
import { VideoItem } from '../types';
import { fetchPublishedVideo } from '../services/videoService';
import { trackVideoInteraction } from '../lib/gtm';

interface ProductVideoSectionProps {
  onOrderClick: () => void;
}

export const ProductVideoSection: React.FC<ProductVideoSectionProps> = ({ onOrderClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [publishedVideo, setPublishedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    async function loadVideo() {
      try {
        const vid = await fetchPublishedVideo();
        if (vid) setPublishedVideo(vid);
      } catch (err) {
        console.warn('Could not load published video:', err);
      }
    }
    loadVideo();
  }, []);

  const videoConfig = BRAND_CONFIG.video;
  const currentTitle = publishedVideo?.title || videoConfig.heading;
  const currentDesc = publishedVideo?.description || videoConfig.subtitle;
  const currentVideoUrl = publishedVideo?.videoUrl || videoConfig.mp4Url || videoConfig.youtubeUrl;
  const currentThumbnail = publishedVideo?.thumbnailUrl || videoConfig.thumbnailUrl || INITIAL_PRODUCT.images[0].url;

  const isYouTube = Boolean(
    currentVideoUrl &&
      (currentVideoUrl.includes('youtube.com') || currentVideoUrl.includes('youtu.be'))
  );

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <section id="product-video" className="py-10 sm:py-14 bg-[#FFF8ED] border-b border-[#E9CD78]/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F3E9D7] text-xs font-bold text-[#65051F] border border-[#D6A638]/40">
            <Video className="w-3.5 h-3.5 text-[#D6A638]" />
            <span>ভিডিও পর্যালোচনা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#65051F] tracking-tight">
            {currentTitle}
          </h2>
          <p className="text-[#6B4F55] text-xs sm:text-sm font-medium">
            {currentDesc}
          </p>
        </div>

        {/* 16:9 Responsive Video Container */}
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-[#D6A638]/40 shadow-md bg-[#420212] group">
          {isPlaying ? (
            isYouTube ? (
              <iframe
                src={getEmbedUrl(currentVideoUrl)}
                title={currentTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              >
                আপনার ব্রাউজার ভিডিও প্লেব্যাক সমর্থন করে না।
              </video>
            )
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#420212] via-[#65051F] to-[#850D22]">
              {/* Product Background Image with Scrim */}
              <img
                src={currentThumbnail}
                alt={currentTitle}
                className="absolute inset-0 w-full h-full object-contain p-6 opacity-40 filter blur-[1px] group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-black/45" />

              {/* Center Play Button */}
              <div className="relative z-10 text-center px-4 space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(true);
                    trackVideoInteraction('play', currentTitle);
                  }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#D6A638] via-[#E9CD78] to-[#D6A638] text-[#65051F] flex items-center justify-center mx-auto shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-[#FFF8ED]"
                  aria-label="Play video"
                >
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-[#65051F] ml-0.5" />
                </button>

                <div className="space-y-1 text-white">
                  <h3 className="text-base sm:text-lg font-bold font-display text-[#FFF8ED]">
                    {currentTitle}
                  </h3>
                  <p className="text-[11px] text-[#E9CD78] line-clamp-2">
                    {currentDesc}
                  </p>
                </div>
              </div>

              {/* Badge Strip */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-[#E9CD78] pointer-events-none z-10">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D6A638]" />
                  <span>China Hut Official HD</span>
                </span>
                <span className="font-mono bg-black/60 px-2 py-0.5 rounded text-white text-[10px]">
                  MP4 / 16:9
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Order Prompt */}
        <div className="bg-[#F3E9D7] rounded-2xl p-3.5 sm:p-4 border border-[#D6A638]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D6A638] shrink-0" />
            <span className="font-bold text-[#65051F]">
              ১টি বা ২টি বোতলের যেকোনো অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOrderClick()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs text-[#65051F] bg-gradient-to-r from-[#D6A638] via-[#E9CD78] to-[#D6A638] hover:brightness-105 shadow-xs transition-all whitespace-nowrap cursor-pointer"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>
    </section>
  );
};
