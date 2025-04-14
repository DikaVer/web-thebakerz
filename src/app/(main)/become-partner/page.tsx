// Add imports for metadata generation at the top
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata';

// Define page-specific metadata translations
const pageMetadataTranslations = {
    en: {
        title: "Become a Partner | Grow Your Bakery with TheBakerz",
        description: "Join TheBakerz platform! Get your own webshop, streamline orders, manage recipes, and reach more customers. Start your free trial today.",
        keywords: "join thebakerz, bakery partner program, bakery software signup, webshop for bakers, online bakery platform, grow bakery business, bakery order management, free trial bakery software",
        ogTitle: "Partner with TheBakerz & Grow Your Bakery Business",
        ogDescription: "Expand your reach and simplify operations. Get a dedicated webshop, order management, and more with TheBakerz. Sign up now!",
        twitterTitle: "Grow Your Bakery with TheBakerz | Become a Partner",
        twitterDescription: "Ready to boost your bakery sales? Join TheBakerz for a free trial and get your own webshop, order tools, and more. #bakerybusiness #onlinebakery #pastrychef"
    },
    nl: {
        title: "Word Partner | Laat Je Bakkerij Groeien met TheBakerz",
        description: "Sluit je aan bij het TheBakerz platform! Krijg je eigen webshop, stroomlijn bestellingen, beheer recepten en bereik meer klanten. Start vandaag nog je gratis proefperiode.",
        keywords: "word lid van thebakerz, partnerprogramma bakkerij, aanmelden bakkerij software, webshop voor bakkers, online bakkerij platform, bakkerij laten groeien, orderbeheer bakkerij, gratis proefversie bakkerij software",
        ogTitle: "Word Partner van TheBakerz & Laat Je Bakkerij Groeien",
        ogDescription: "Vergroot je bereik en vereenvoudig je activiteiten. Krijg een eigen webshop, orderbeheer en meer met TheBakerz. Meld je nu aan!",
        twitterTitle: "Laat Je Bakkerij Groeien met TheBakerz | Word Partner",
        twitterDescription: "Klaar om je bakkerijomzet te verhogen? Sluit je aan bij TheBakerz voor een gratis proefperiode en krijg je eigen webshop, besteltools en meer. #bakkerij #onlinebakkerij #patissier"
    }
};

// GenerateMetadata function (must be outside client component scope)
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale);

    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const partnerUrl = `https://www.thebakerz.com/become-partner`;

    // Merge keywords
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageKeywords]));

    return {
        ...baseMetadata,
        title: pageSpecifics.title,
        description: pageSpecifics.description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: partnerUrl,
            languages: {
                'en-US': `https://www.thebakerz.com/become-partner`,
                'nl-NL': `https://www.thebakerz.com/become-partner`,
                'x-default': `https://www.thebakerz.com/become-partner`,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: partnerUrl,
            // Consider a specific OG image for this page?
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
            // Consider a specific Twitter image for this page?
        },
    };
}

"use client";

import React, {useState} from "react";
import Image from "next/image";
import {
    IconBadge,
    IconBadgeCheck,
    IconBadgeInfo,
    IconClose,
    IconHeart,
} from "@/components/ui/icons";
import { FirstView } from "@/components/landing/first-view";
import {pacifico} from "@/components/fonts";
import {useInView} from "@/lib/hooks/useInView";
import {
    Card,
    CardBody,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    CardFooter,
    Chip
} from "@heroui/react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {Icon} from "@iconify/react";
import ScrollTriggered from "@/components/landing/scroll-triggered";
import ApplyComponent from "@/components/landing/apply-component";
import {useMediaQuery} from "usehooks-ts";
import {useTheme} from "next-themes";
import {useTranslations} from "next-intl";

export default function Page() {
    return (
        <>
            <div className="flex flex-col min-h-screen relative z-10 items-center">
                <FirstView/>
                <div className="flex flex-col container mx-auto items-center justify-center">
                    {/*<WhyChooseSection/>*/}
                    <ApplyComponent/>
                    <WhyChooseSectionAnimated/>
                    <PricingSection/>
                </div>

                {/* Succeed Footer */}
                <Footer/>
            </div>
        </>

    );
}

const WhyChooseSectionAnimated = () => {
    const [whyChooseRef, whyChooseInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const t = useTranslations("app/(main)/page");

    return (
        <section
            id="why-choose"
            className="w-full px-4 sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
            aria-labelledby="why-choose-section"
        >
            <h2
                ref={whyChooseRef}
                id="why-choose-heading"
                className={`text-3xl sm:text-4xl font-extrabold text-center bg-gradient-text
                            opacity-0 transform
                            ${whyChooseInView ? 'animate-fadeInUp' : ''}`}
            >
                {t('whyChooseTheBakerz')}
            </h2>
            <ScrollTriggered />
        </section>
    );
};

const PricingSection = () => {
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const { theme } = useTheme();
    const t = useTranslations("app/(main)/page");

    const [pricingOut, PricingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });

    const handleCreate = () => {
        setLoading(true);
        const element = document.getElementById('join-thebakerz');
        if (element) {
            element?.scrollIntoView({ behavior: 'smooth' });
        }
        setLoading(false);
    };

    return (
        <section
            id="pricing-section"
            className="w-full sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
            aria-labelledby="pricing-section"
        >
            <Modal
                backdrop={"blur"}
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                size={'xl'}
                shadow={"lg"}
                placement={"center"}
                className={"bg-background"}
                classNames={{
                    closeButton: 'p-1'
                }}
                closeButton={
                    <div className={'absolute w-full right-0'}>
                        <IconClose size={32} primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                   secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />
                    </div>
                }
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                {t('transparentPricing')}
                            </ModalHeader>
                            <ModalBody>
                                <div className={'w-full flex flex-row space-x-3 items-center'}>
                                    <IconBadge className={`w-8 h-8 text-text`}/>
                                    <div className={'w-full flex flex-col'}>
                                        <p>
                                            {t('monthlySubscription')}
                                        </p>
                                    </div>
                                </div>
                                <div className={'w-full flex flex-row space-x-3 items-center'}>
                                    <IconBadge className={`w-8 h-8 text-text`}/>
                                    <div className={'w-full flex flex-col'}>
                                        <p>
                                            {t('paymentFee')}
                                        </p>
                                        <p
                                            className={`text-tiny cm:text-small text-grayText`}
                                        >
                                            {t('paymentFeeInfo')}
                                        </p>
                                    </div>
                                </div>
                                {/*<div className={'w-full flex flex-row space-x-3 items-center mb-4'}>*/}
                                {/*    <IconBadge className={`w-8 h-8 text-text`}/>*/}
                                {/*    <div className={'w-full flex flex-col'}>*/}
                                {/*        <p>*/}
                                {/*            {t('Tips')}*/}
                                {/*        </p>*/}
                                {/*        <p*/}
                                {/*            className={`text-tiny cm:text-small text-grayText`}*/}
                                {/*        >*/}
                                {/*            {t('Tips Info')}*/}
                                {/*        </p>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Card
                className={`w-full max-w-2xl h-fit py-4 px-2 desktop:px-10 opacity-0 bg-gradient-card
                ${PricingInView ? 'animate-fadeInUp' : ''}`}
                ref={pricingOut}
            >
                <CardFooter className={`justify-end`}>
                    <Chip
                        startContent={<Icon icon={`solar:heart-angle-broken`} width={26} height={26} className={`text-redBakerz`} />}
                        variant="light"
                        className={`text-lg cm:text-xl text-text`}
                    >
                        <span className={'font-semibold'}>
                            {t('freeTrial')}
                        </span>
                    </Chip>
                </CardFooter>
                <CardBody className={``}>
                    <div className={`flex flex-row`}>
                        <span className={`text-6xl ${pacifico.className}`}>€9</span>
                        <div className={'flex flex-col mt-3'}>
                            <span className={`text-xl font-light -mb-2`}>99</span>
                            <span className={`text-xl font-light`}>/mo</span>
                        </div>
                    </div>
                    <div>
                        <Button
                            startContent={<IconBadgeInfo className={`w-4 h-4`}/>}
                            variant={"ghost"}
                            className={`w-48 px-3 h-8 gap-1 text-sm justify-start`}
                            onPress={() => setOpen(true)}
                        >
                            {t('transparentPricing')}
                        </Button>
                    </div>
                    <hr/>
                    <div>
                        <p
                            className={`text-small md:text-lg italic text-grayText text-center my-3`}
                        >
                            {t('exclusiveOffer')}
                        </p>
                    </div>
                    <Button
                        isLoading={isLoading}
                        disabled={isLoading}
                        className={`py-6 -px-1 ${isLoading ? "px-6" : "-px-1"} text-2xl bg-gradient-primary rounded-lg shadow-xl`}
                        //@ts-ignore
                        variant={"default"}
                        onPress={handleCreate}
                    >
                        {isLoading ? (
                            <>
                                {t('loading')}
                            </>
                        ) : (
                            <div className={`flex flex-col text-xl desktop:text-2xl`}>
                                {t('getStarted')}
                            </div>
                        )}
                    </Button>

                    <div className={`w-full space-y-4 pt-6`}>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    {t('ownWebshop')}
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    {t('professionalStore')}
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    {t('allMessagesInOnePlace')}
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    {t('connectMessages')}
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    {t('recipeOrderControl')}
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    {t('easyToUseSystem')}
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    {t('smartCalendar')}
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    {t('planProduction')}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </section>
    );
};

const Footer = () => {
    const [footerRef, footerInView] = useInView<HTMLDivElement>({threshold: 0});
    const isMobile = useMediaQuery("(max-width: 768px)");
    const t = useTranslations("app/(main)/page");

    return (
        <div
            ref={footerRef}
            className={`relative lg:px-16 bg-secondary w-full flex justify-between items-center rounded-lg mt-12
            opacity-0 transform translate-y-10
            ${footerInView ? 'animate-fadeInUp' : ''}
            `}
        >
            <div className={"flex flex-row items-end"}>
                <IconHeart viewBox={"0 0 512 512"} className="hidden heart-display:block w-32 h-32"
                           color={"heart"}/>
                <IconHeart viewBox={"0 0 512 512"} className="hidden heart-display:block w-10 h-10"
                           color={"heart"}/>
            </div>
            <div
                ref={footerRef}
                className={` hidden md:flex relative ${isMobile ? "w-16 mb-20" : "w-36 mb-36"}
                opacity-0 transform translate-y-10
                ${footerInView ? 'animate-fadeInUp' : ''}
                `}
            >
                <div
                    className={`absolute`}
                    style={{width: `${isMobile ? "90px" : "150px"}`, height: '192px'}}
                >
                    <Image
                        src="/images/Mickey.svg"
                        alt="TheBakerz - Mickey"
                        className={`absolute z-50`}
                        width={isMobile ? 90 : 150}
                        height={192}
                        quality={100}
                    />
                </div>
            </div>
            <span className={`text-[3vh] py-12 text-primary text-center ${pacifico.className}`}>
                {t('wantYouToSucceed')}
            </span>
            <div
                ref={footerRef}
                className={`hidden md:flex relative ${isMobile ? "w-16 mb-20" : "w-36 mb-36"}
                opacity-0 transform translate-y-10
                ${footerInView ? 'animate-fadeInUp' : ''}
                `}
            >
                <div
                    className={`absolute`}
                    style={{width: `${isMobile ? "90px" : "150px"}`, height: '192px'}}
                >
                    <Image
                        src="/images/Wiki.svg"
                        alt="TheBakerz - Wiki"
                        className={`absolute z-50`}
                        width={isMobile ? 90 : 150}
                        height={192}
                        quality={100}
                    />
                </div>
            </div>
            <div className={"flex flex-row items-end"}>
                <IconHeart viewBox={"0 0 512 512"} className="hidden heart-display:block w-10 h-10"
                           color={"heart"}/>
                <IconHeart viewBox={"0 0 512 512"} className="hidden heart-display:block w-32 h-32"
                           color={"heart"}/>
            </div>
        </div>
    );
};