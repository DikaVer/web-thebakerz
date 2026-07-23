/**
 * @fileoverview Horizontally scrolling landing page section driven by GSAP ScrollTrigger.
 *
 * Exports the HorizontalScroll component, which pins a full-viewport slider
 * and translates three colored panels (deliveries, marketing, support)
 * horizontally as the user scrolls vertically, with snapping between panels.
 * Panel image content is currently commented out, leaving translated headings
 * only.
 */
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroll() {
  const component = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const t = useTranslations("app/landing/horizontal-scroll");

  // Check for mobile/small screens and track viewport width
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setViewportWidth(window.innerWidth);
    };
    
    // Initial check
    checkScreenSize();
    
    // Check on resize
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useLayoutEffect(() => {
    // Reset scroll position on component mount
    window.scrollTo(0, 0);
    
    // Make sure ScrollTrigger is refreshed on window resize
    window.addEventListener('resize', () => ScrollTrigger.refresh());

    // Kill any existing ScrollTriggers to avoid conflicts
    ScrollTrigger.getAll().forEach(st => st.kill());

    let ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".panel");
      const totalPanels = panels.length;
      
      // Calculate the total scroll distance
      let totalScroll = 100 * (totalPanels - 1);
      
      // Set initial position
      gsap.set(panels, { xPercent: -4.5 });
      
      // Create the scrollTrigger animation
      gsap.to(panels, {
        xPercent: -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: slider.current,
          start: "top top",
          pin: true,
          pinSpacing: true,
          scrub: 0.5,
          snap: {
            snapTo: 1 / (totalPanels - 1),
            duration: { min: 0.1, max: 0.3 },
            delay: 0.1,
            ease: "power1.inOut"
          },
          end: () => {
            if (!slider.current) return "+=0"; // Return 0 if ref is null
            return `+=${slider.current.scrollWidth - window.innerWidth}`;
          },
          markers: false,
          invalidateOnRefresh: true, // Recalculate on resize
        }
      });
      
    }, component);
    
    return () => {
      ctx.revert();
      // Clean up ScrollTriggers on component unmount
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // Calculate responsive left positions based on viewport width
  const getResponsiveLeft = (percentage: number): string => {
    return `calc(${percentage}% - ${percentage < 50 ? 100 : 75}px)`;
  };

  return (
    <div className="App w-full overflow-hidden" ref={component}>
      <div 
        ref={slider} 
        className="container flex w-full text-[#0E0205]"
        style={{ height: isMobile ? '100vh' : '100vh' }}
      >
        <div className="panel min-w-[100vw] flex flex-col items-center justify-center px-4 py-0 bg-[#FFEFD9]">
          <h2 className="panel-text text-[14.5vw] font-bold mt-8 text-center">{t("deliveries")}</h2>
          {/* <div className="relative w-full" style={{ height: '500px' }}> */}
            {/* <Image 
              src="/landing/delivery.webp" 
              alt="Delivery service" 
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            /> */}
          {/* </div> */}
        </div>
        
        <div className="panel min-w-[100vw] flex flex-col items-center justify-center px-4 py-0 bg-[#CA054D]">
          <h2 className="panel-text text-[14.5vw] font-bold mt-8 text-center">{t("marketing")}</h2>
          {/* <div className="relative w-full" style={{ height: '500px' }}> */}
            {/* <Image 
              src="/landing/marketing.webp" 
              alt="Marketing services" 
              fill
              className="object-contain rounded-xl"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            /> */}
          {/* </div> */}
        </div>
        
        <div className="panel min-w-[100vw] flex flex-col items-center justify-center px-4 py-0 bg-[#D4761A]">
          <h2 className="panel-text text-[14.5vw] font-bold mt-8 text-center">{t("support")}</h2>
          {/* <div className="relative w-full" style={{ height: '500px' }}> */}
            {/* <div className="absolute" style={{ 
              width: '300px', 
              height: '300px', 
              left: getResponsiveLeft(60), 
              top: '-10%', 
              transform: 'rotate(-12deg)', 
              zIndex: 10 
            }}>
              <Image 
                src="/landing/support_2.webp" 
                alt="Support service" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 33vw, 30vw"
              />
            </div>
            <div className="absolute" style={{ 
              width: '400px', 
              height: '400px', 
              left: getResponsiveLeft(30), 
              top: '10%', 
              transform: 'rotate(6deg)', 
              zIndex: 20 
            }}>
              <Image 
                src="/landing/support_1.webp" 
                alt="Support service" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="absolute" style={{ 
              width: '200px', 
              height: '200px', 
              left: getResponsiveLeft(50), 
              bottom: '-15%', 
              transform: 'rotate(-6deg)', 
              zIndex: 30 
            }}>
              <Image 
                src="/landing/support_3.webp" 
                alt="Support service" 
                fill
                className="object-contain"
                sizes="(max-width: 768px) 33vw, 30vw"
              />
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
