'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export const VideoShowcase = () => {
  const t = useTranslations("app/become-partner");

  return (
    <section className="relative w-full overflow-hidden">
      {/* Gradient transition from MacbookScrollDemo dark background to page background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B0F]/90 to-background" />
      
      <div className="relative z-10 py-20 md:py-32">
        <div className="container max-w-6xl mx-auto px-4 md:px-6">

          {/* Apple-style Video Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Main video container */}
            <div className="relative bg-white/20 backdrop-blur-sm rounded-3xl p-4 md:p-6">
              <div className="relative aspect-video w-full bg-background rounded-2xl overflow-hidden shadow-2xl">
                {/* Video iframe */}
                <iframe
                  src="https://www.youtube-nocookie.com/embed/2hlFLVs1oMk?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0&color=white&theme=dark&enablejsapi=1&origin=window.location.origin"
                  title="TheBakerz Platform Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 w-full h-full"
                  style={{
                    border: 'none',
                  }}
                />
                
                {/* Subtle inner border for depth */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            
            {/* Reflection effect */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3/4 h-20 bg-gradient-to-b from-white/5 to-transparent rounded-b-3xl blur-xl opacity-50" />
          </div>

          {/* Additional decorative elements */}
          {/* <div className="relative mt-16 flex justify-center space-x-8 opacity-40">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          </div> */}
        </div>
      </div>
      
      {/* Bottom gradient to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}; 