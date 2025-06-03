'use client';

import { Button} from '@heroui/react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { pacifico } from '@/components/fonts';
import { LandingSigninButton } from '@/components/ui/landing-signin';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import clarity from "@microsoft/clarity";
import { useEffect, useState } from 'react';
import LanguageModal from "@/components/language-modal";
import Link from 'next/link';
import { LanguageButtonWithHint } from '@/components/ui/language-button-with-hint';

// Animated typing component
export const AnimatedPlaceholder = () => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = 'Enter address';
  
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        if (displayText.length < fullText.length) {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        } else {
          setIsTyping(false);
          // Start over after a pause
          setTimeout(() => {
            setDisplayText('');
            setIsTyping(true);
          }, 2000);
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [displayText, isTyping, fullText]);
  
  return (
    <span className="text-gray-500">
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
};

// LandingSection component with the address search
export const LandingHeroSection = () => {
  const t = useTranslations("app/landing/marketplace");
  useEffect(() => {
        clarity.setTag("page", "landing");
  }, []);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Show error message if API key is missing or initialization failed */}
      {/* The general errorMessage state handles errors, including loadError */}
      
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/landing/landingImage.webp"
          alt="Bakers with cakes and pastries"
          quality={100}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center bg-[#f7f6f5]"
        />
        <div className="absolute inset-0 bg-gradient-to-b bg-black bg-opacity-5"></div>
      </div>

      {/* <div className="absolute top-0 left-0 w-full h-full flex justify-center mt-[360px]">
        <BlurText
          once={true}
          text="TheBakerz"
          delay={150}
          animateBy="words"
          direction="top"
          className={`font-pacifico text-5xl sm:text-7xl text-[#0E0205] drop-shadow-xl ${pacifico.className}`}
        />
      </div> */}

      <div className=" flex w-full items-center gap-4 justify-end p-4 relative">
        <LanguageButtonWithHint 
          onLanguageOpen={() => setIsLanguageOpen(true)}
          isLanguageOpen={isLanguageOpen}
        />
        
        <LandingSigninButton className=" bg-gradient-primary text-lg shadow-xl rounded-3xl text-white border-0" />
      </div>

      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16">
           
        <div className="max-w-3xl mx-auto p-8 px-4 md:p-12 rounded-2xl mb-32">
          {/* <BlurText
            once={true}
            text="TheBakerz"
            delay={150}
            animateBy="words"
            direction="top"
            className={`font-pacifico text-5xl sm:text-7xl mb-16 text-[#0E0205] drop-shadow-xl ${pacifico.className} justify-center`}
          /> */}
          <h1 className={`font-pacifico text-5xl sm:text-7xl mb-16 text-[#0E0205] drop-shadow-xl ${pacifico.className} justify-center`}>TheBakerz</h1>

          {/* Visually hidden H1 for SEO and accessibility */}
          <h2 className="sr-only">{t("heroSectionTitle")}</h2>

          <BlurText
            once={true}
            text={t("heroSectionTitle")}
            delay={150}
            animateBy="words"
            direction="bottom"
            className="text-3xl sm:text-5xl font-bold text-[#0E0205] mb-8 drop-shadow-xl justify-center items-center"
          />

          {/* Apple-style Search Button */}
          <motion.div
            className="mt-8 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link className="group relative flex items-center w-full bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl hover:bg-white/95 transition-all duration-300 cursor-pointer" href="/search?openAddressModal=true" passHref>
                <Icon 
                  icon="material-symbols:search" 
                  width={24} 
                  className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" 
                />
                <div className="ml-4 flex-1 text-left">
                  <AnimatedPlaceholder />
                </div>
                <Icon 
                  icon="mdi:arrow-right" 
                  width={20} 
                  className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" 
                />
            </Link>
          </motion.div>
        </div>
      </div>
      {isLanguageOpen && <LanguageModal handAction={() => setIsLanguageOpen(false)}/>}
    </div>
  );
};