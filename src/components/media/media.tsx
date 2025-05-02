import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { pacifico } from "@/components/fonts";
import GradientText from '@/components/ui/gradient-text';

export const Media = () => {
  return (
    <div className="flex flex-col items-center max-w-screen-lg mx-auto px-4 py-12 md:py-16 gap-10">
      {/* Logo and Title */}
      <div className="flex flex-col items-center">
        <div className="bg-default-200 rounded-full p-2 mb-4">
          <Image 
            src="/images/TheBakerzLogo.svg" 
            alt="TheBakerz Logo" 
            width={150} 
            height={150} 
            className="rounded-full"
          />
        </div>
        <div className={`text-4xl md:text-5xl font-bold ${pacifico.className}`}>
          <GradientText 
            colors={["#a2119d", "#730C6F", "#a2119d", "#730C6F", "#a2119d"]}
            className="py-2"
          >
            TheBakerz
          </GradientText>
        </div>
        <p className="text-center mt-2 text-base md:text-lg">Connect with us on our social channels</p>
      </div>

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

      {/* Action Buttons */}
      <div className="flex flex-col w-full space-y-4 max-w-md mx-auto">
        <a href="/search" className="bg-gradient-primary text-white rounded-lg p-4 text-center font-semibold hover:opacity-90 transition-opacity relative">
          Discover All Bakers
        </a>
        <a href="/become-partner#join-thebakerz" className="bg-gradient-primary text-white rounded-lg p-4 text-center font-semibold hover:opacity-90 transition-opacity relative">
          Join as a Baker
        </a>
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
    </div>
  );
};

export default Media;
