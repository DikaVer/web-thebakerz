"use client";

import React from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { pacifico } from "@/components/fonts";
import GradientText from '@/components/ui/gradient-text';

// Define types for social links
interface SocialLink {
  name: string;
  url: string;
  appUrl: string | null;
  icon: string;
}

export const Media = () => {
  // Function to handle social link clicks with app intent where possible
  const socialLinks: SocialLink[] = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/thebakerz.official",
      appUrl: "instagram://user?username=thebakerz.official",
      icon: "line-md:instagram"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@thebakerz.official",
      appUrl: "https://www.tiktok.com/@thebakerz.official",
      icon: "line-md:tiktok"
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@thebakerz.official",
      appUrl: "youtube://www.youtube.com/channel/thebakerz.official",
      icon: "line-md:youtube"
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/thebakerz",
      appUrl: "linkedin://company?id=thebakerz",
      icon: "line-md:linkedin"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/thebakerz.official",
      appUrl: "fb://page?id=thebakerz.official",
      icon: "line-md:facebook"
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/the_bakerz",
      appUrl: "twitter://user?screen_name=the_bakerz",
      icon: "line-md:twitter-x"
    }
  ];

  // Handle social link click - try app URL first, then fallback to web URL
  const handleSocialClick = (link: SocialLink) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Just open the URL - modern browsers and operating systems will
    // automatically redirect to the app if installed or web version if not
    window.location.href = link.appUrl || link.url;
  };

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
        {socialLinks.map((link) => (
          <a 
            key={link.name}
            href={link.url}
            onClick={handleSocialClick(link)}
            className="bg-default-200 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label={`Visit our ${link.name} page`}
            rel="noopener noreferrer"
          >
            <Icon icon={link.icon} width="24" height="24" />
          </a>
        ))}
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
          <a href="tel:+31645422552" className=" hover:underline">+31 6 45 42 25 52</a>
        </div>
      </div>
    </div>
  );
};

export default Media;
