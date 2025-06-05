'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { pacifico } from "@/components/fonts";
import GradientText from '@/components/ui/gradient-text';
import {motion} from "framer-motion";
import {AnimatedPlaceholder} from "@/components/landing/marketplace/landing-hero-section";
import {useRouter} from "next/navigation";
import BlurText from "@/components/ui/blur-text";
import {Divider} from "@heroui/react";
import { CustomOrderButton } from '../ui/custom-order-button';
import { useTranslations } from 'next-intl';
export const Media = () => {
  const router = useRouter();
  const t = useTranslations("filter");
  return (
    <div className="flex flex-col items-center max-w-screen-lg mx-auto px-4 py-12 md:py-16 gap-10">
      {/* Logo and Title */}
      <div className="flex flex-col items-center">
        <div className={`text-4xl md:text-5xl font-bold ${pacifico.className}`}>
          <GradientText 
            colors={["#a2119d", "#730C6F", "#a2119d", "#730C6F", "#a2119d"]}
            className="py-2"
          >
            TheBakerz
          </GradientText>
        </div>
      </div>

      <BlurText
          once={true}
          text={"Discover artisanal bakeries near you"}
          delay={150}
          animateBy="words"
          direction="top"
          className="text-3xl sm:text-5xl font-bold text-[#0E0205] mt-4 mb-2 drop-shadow-xl justify-center items-center max-w-xl"
      />
      {/* Action Buttons */}
      <div className="flex flex-col w-full space-y-4 max-w-md mx-auto">
        {/* Apple-style Search Button */}
        <motion.div
            className="mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div
              onClick={() => router.push('/search?openAddressModal=true')}
              className="group relative flex items-center w-full bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl px-6 py-4 shadow-xl hover:shadow-2xl hover:bg-white/95 transition-all duration-300 cursor-pointer"
          >
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
          </div>
        </motion.div>
        {/* Custom Order Button with Animation */}
        <motion.div 
            className="mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mt-4 justify-center">
            <Divider className="flex-1" />
            <span>or</span>
            <Divider className="flex-1" />
            </div>
            <p className="text-sm text-foreground-500 mt-4 w-full text-center">{t("special")}</p>
            <CustomOrderButton 
              className="w-full mt-4 justify-center p-4"
            />
          </motion.div>
        <div className="flex items-center gap-4">
          <Divider className="flex-1" />
          <span>or</span>
          <Divider className="flex-1" />
        </div>
        <a href="/become-partner#join-thebakerz" className="bg-gradient-primary text-white rounded-lg p-4 text-center font-semibold hover:opacity-90 transition-opacity relative">
          Join as a Baker
        </a>
      </div>

      <p className="text-center mt-2 text-base md:text-lg">Connect with us on our social channels</p>


      {/* Social Links */}
      <div className="flex flex-wrap justify-center gap-5">
        <Link href="https://www.instagram.com/thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:instagram" width="24" height="24" />
        </Link>
        <Link href="https://www.tiktok.com/@thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:tiktok" width="24" height="24" />
        </Link>
        <Link href="https://www.youtube.com/@the_bakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:youtube" width="24" height="24" />
        </Link>
        <Link href="https://t.me/thebakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:telegram" width="24" height="24" />
        </Link>
        <Link href="https://www.linkedin.com/company/thebakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:linkedin" width="24" height="24" />
        </Link>
        <Link href="https://www.facebook.com/thebakerz.official" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:facebook" width="24" height="24" />
        </Link>
        <Link href="https://x.com/the_bakerz" target="_blank" className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon icon="line-md:twitter-x" width="24" height="24" />
        </Link>
      </div>

      {/* Contact Section */}
      <div className="border-2 border-primary w-full rounded-lg p-6 relative max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Press Contact</h2>
        <div className="flex items-center mb-3">
          <Icon icon="line-md:email" className=" mr-3" width="24" height="24" />
          <a href="mailto:info@thebakerz.com" className=" hover:underline">info@thebakerz.com</a>
        </div>
        <div className="flex items-center">
          <Icon icon="line-md:phone" className=" mr-3" width="24" height="24" />
          <a href="tel:+31684794739" className=" hover:underline">+31 6 84 79 47 39</a>
        </div>
      </div>

      <div className="bg-default-200 rounded-full p-2 mb-4">
        <Image
            src="/images/TheBakerzLogo.svg"
            alt="TheBakerz Logo"
            width={150}
            height={150}
            className="rounded-full"
            
        />
      </div>
    </div>
  );
};

export default Media;
