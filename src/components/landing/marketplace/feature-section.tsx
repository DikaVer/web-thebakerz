'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import BlurText from '@/components/ui/blur-text';
import AnimatedContent from '@/components/ui/animated-content';
import { Divider } from '@heroui/react';

export const FeatureSection = () => {
    const t = useTranslations("app/landing/marketplace");

    const features = [
        {
            key: 'rescueDeals',
            image: '/landing/rescue-deals.png',
            alt: 'Rescue Deals - Discounted bakery items'
        },
        {
            key: 'hiddenGems',
            image: '/landing/allergies.png',
            alt: 'Allergy-friendly and dietary specific desserts'
        },
        {
            key: 'perfectBaker',
            image: '/landing/custom-cake.png',
            alt: 'Custom cakes and event baking services'
        }
    ];

    return (
        <section className="w-full relative">
            {/* Gradient background that transitions from hero to bakers growth */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f7f6f5] from-5% to-background-secondary"></div>
            
            <div className="relative z-10 container max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="space-y-16">
                    {features.map((feature, index) => (
                        <div key={feature.key}>
                            <Divider />
                                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                                    {/* Image Section */}
                                    <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''} relative`}>
                                        <AnimatedContent
                                            distance={75}
                                            direction="horizontal"
                                            reverse={index % 2 === 1}
                                            duration={1}
                                            ease="power3.out"
                                            initialOpacity={0}
                                            animateOpacity
                                            delay={0.2}
                                        >
                                            <div className="relative h-[300px] md:h-[400px] w-full">
                                                <div className="relative w-full h-full overflow-hidden">
                                                    <Image
                                                        src={feature.image}
                                                        alt={feature.alt}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                    {/* Subtle overlay */}
                                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none" />
                                                </div>
                                            </div>
                                        </AnimatedContent>
                                    </div>
                                    
                                    {/* Content Section */}
                                    <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''} flex flex-col justify-center`}>
                                        <AnimatedContent
                                            distance={75}
                                            direction="vertical"
                                            reverse={false}
                                            duration={1}
                                            ease="power3.out"
                                            initialOpacity={0}
                                            animateOpacity
                                            delay={0.1}
                                        >
                                            <BlurText
                                                once={true}
                                                text={t(`features.${feature.key}.title`)}
                                                delay={50}
                                                animateBy="words"
                                                direction="bottom"
                                                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight"
                                            />
                                            
                                            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl">
                                                {t(`features.${feature.key}.description`)}
                                            </p>
                                        </AnimatedContent>
                                    </div>
                                </div>
                            </div>
                    ))}
                    <Divider/>
                </div>
            </div>
        </section>
    );
}; 