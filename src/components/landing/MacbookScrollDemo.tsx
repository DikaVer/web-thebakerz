import React from "react";
import { MacbookScroll } from "@/components/landing/macbook-scroll";
import BlurText from "../ui/blur-text";

export function MacbookScrollDemo() {
  return (
    <div className="overflow-hidden pt-20 bg-[#0B0B0F] bg-white w-full">
      <div className="absolute top-0 flex w-full h-[500px] bg-[#0B0B0F]"/>
      <MacbookScroll
        title={
          <BlurText
            once={true}
            text="Unlock your potential with TheBakerz"
            delay={150}
            animateBy="words"
            direction="top"
            className={`font-pacifico text-6xl sm:text-8xl text-white drop-shadow-xl justify-center max-w-4xl gap-y-8`}
          />
        }
        src={`/landing/store.png`}
        showGradient={true}
      />
    </div>
  );
}