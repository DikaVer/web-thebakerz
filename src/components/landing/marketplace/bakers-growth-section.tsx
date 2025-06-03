'use client';

import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import BlurText from '@/components/ui/blur-text';
import AnimatedContent from '@/components/ui/animated-content';

export const BakersGrowthSection = () => {

    const router = useRouter();
    const t = useTranslations("app/landing/marketplace");

    const handleBecomeBakerz = () => {
        router.push('/become-partner');
    }

    return (
        <section className="w-full bg-[#FFC454] py-12 md:py-16">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Video Section */}
            <div className="order-2 md:order-1">
                <div className="relative h-[300px] md:h-[400px] w-full">
                    {/* Apple-style video container */}
                    <div className="relative w-full h-full bg-black rounded-2xl shadow-2xl overflow-hidden border border-black/10">
                        <iframe
                            src="https://www.youtube-nocookie.com/embed/2hlFLVs1oMk?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0&enablejsapi=1&origin=window.location.origin"
                            title="Baker decorating cupcakes"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="absolute inset-0 w-full h-full rounded-2xl"
                            style={{
                                border: 'none',
                            }}
                        />
                        {/* Subtle overlay for Apple-like depth */}
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none" />
                    </div>
                </div>
            </div>
            
            {/* Content Section */}
            <div className="order-1 md:order-2 flex flex-col items-start">
                <h2 className="sr-only text-3xl md:text-4xl font-bold text-[#191919] dark:text-[#191919] mb-4">
                {t("bakersGrowthSectionTitle")}
                </h2>
                <BlurText
                    once={true}
                    text={t("joinBakerz")}
                    // text={t("bakersGrowthSectionTitle")}
                    delay={75}
                    animateBy="letters"
                    direction="top"
                    className="text-3xl md:text-4xl font-bold text-[#191919] dark:text-[#191919] mb-4"
                />
                
                <p className="text-base md:text-lg mb-6 text-[#191919] dark:text-[#191919] max-w-xl">
                    {t("bakersGrowthSectionDescription")}
                </p>
                
                <div className="flex w-full justify-end">
                    <AnimatedContent
                        distance={75}
                        direction="vertical"
                        reverse={false}
                        duration={1.2}
                        ease="power3.out"
                        initialOpacity={0}
                        animateOpacity
                        scale={1}
                        // threshold={0.2}
                        delay={0}
                    >
                        <Button 
                            aria-label="Become a Bakerz"
                            color="primary" 
                            size="lg"
                            className="px-8 py-3 bg-gradient-primary rounded-full text-white font-medium"
                            onPress={handleBecomeBakerz}
                        >
                            {t('become')}
                        </Button>  
                    </AnimatedContent>
                </div>
            </div>

            
            </div>
        </div>
        </section>
    );
}; 