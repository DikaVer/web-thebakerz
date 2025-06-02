'use client';

import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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
                            src="https://www.youtube.com/embed/2hlFLVs1oMk?rel=0&modestbranding=1&showinfo=0&controls=1&autoplay=0"
                            title="Baker decorating cupcakes"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
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
                <h2 className="text-3xl md:text-4xl font-bold text-[#191919] dark:text-[#191919] mb-4">
                {t("bakersGrowthSectionTitle")}
                </h2>
                
                <p className="text-base md:text-lg mb-6 text-[#191919] dark:text-[#191919] max-w-xl">
                    {t("bakersGrowthSectionDescription")}
                </p>
                
                    <div className="flex w-full justify-end">
                        <Button 
                            aria-label="Become a Bakerz"
                            color="primary" 
                            size="lg"
                            className="px-8 py-3 bg-gradient-primary rounded-full text-white font-medium"
                            onPress={handleBecomeBakerz}
                        >
                            {t('become')}
                        </Button>
                    </div>
            </div>
            </div>
        </div>
        </section>
    );
}; 