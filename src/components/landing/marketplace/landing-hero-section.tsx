'use client';

import { Button} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import { pacifico } from '@/components/fonts';
import { LandingSigninButton } from '@/components/ui/landing-signin';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import clarity from "@microsoft/clarity";
import { useEffect } from 'react';


// LandingSection component with the address search
export const LandingHeroSection = () => {
  const t = useTranslations("app/landing/marketplace");
  const router = useRouter();
  useEffect(() => {
        clarity.setTag("page", "landing");
  }, []);


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
          className="object-cover object-center bg-[#FCF1DC]"
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

      <div className=" flex w-full justify-end p-4">
        <LandingSigninButton className=" bg-gradient-primary text-lg shadow-xl rounded-3xl text-white border-0" />
      </div>

      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16">
           
        <div className="max-w-3xl mx-auto p-8 md:p-12 rounded-2xl mb-32">
          <BlurText
            once={true}
            text="TheBakerz"
            delay={150}
            animateBy="words"
            direction="top"
            className={`font-pacifico text-5xl sm:text-7xl mb-16 text-[#0E0205] drop-shadow-xl ${pacifico.className} justify-center`}
          />

          {/* Visually hidden H1 for SEO and accessibility */}
          <h1 className="sr-only">{t("heroSectionTitle")}</h1>

          <BlurText
            once={true}
            text={t("heroSectionTitle")}
            delay={150}
            animateBy="words"
            direction="top"
            className="text-3xl sm:text-5xl font-bold text-[#0E0205] mb-8 drop-shadow-xl justify-center items-center"
          />

          {/* All Desserts Button */}
          <motion.div
            className="mt-8"
          >
            <Button 
              onPress={() => router.push('/search')}
              size="lg"
              className="bg-gradient-primary text-white font-semibold text-lg px-8 py-3 rounded-full shadow-xl"
              endContent={<Icon icon="mdi:arrow-right" width={24} />}
            >
              All Desserts
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};