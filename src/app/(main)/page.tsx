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
import {backdropEffect} from "@/lib/local-variables";
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
                Why Choose TheBakerz?
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

    const [pricingOut, PricingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });



    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleCreate = () => {
        setLoading(true);
        router.push('#join-thebakerz');
        router.refresh();
        setLoading(false);
    };

    return (
        <section
            id="pricing-section"
            className="w-full sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
            aria-labelledby="pricing-section"
        >
            <Modal
                backdrop={backdropEffect}
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
                <ModalContent
                >
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                Transparent pricing
                            </ModalHeader>
                            <ModalBody>
                                <div className={'w-full flex flex-row space-x-3 items-center'}>
                                    <IconBadge className={`w-8 h-8 text-text`}/>
                                    <div className={'w-full flex flex-col'}>
                                        <p>
                                            €29.99/month subscription
                                        </p>
                                    </div>
                                </div>
                                <div className={'w-full flex flex-row space-x-3 items-center'}>
                                    <IconBadge className={`w-8 h-8 text-text`}/>
                                    <div className={'w-full flex flex-col'}>
                                        <p>
                                            Payment and service fee 4.9%
                                        </p>
                                        <p
                                            className={`text-tiny cm:text-small text-grayText`}
                                        >
                                            4.9% of sales to host website, operational and payment services
                                        </p>
                                    </div>
                                </div>
                                <div className={'w-full flex flex-row space-x-3 items-center mb-4'}>
                                    <IconBadge className={`w-8 h-8 text-text`}/>
                                    <div className={'w-full flex flex-col'}>
                                        <p>
                                            100% Tips
                                        </p>
                                        <p
                                            className={`text-tiny cm:text-small text-grayText`}
                                        >
                                            Keep the cherry on top with you
                                        </p>
                                    </div>
                                </div>
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
                            FREE TRIAL
                        </span>
                    </Chip>
                </CardFooter>
                <CardBody className={``}>
                    <div className={`flex flex-row`}>
                        <span className={`text-6xl ${pacifico.className}`}>€29</span>
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
                            Transparent pricing
                        </Button>
                    </div>
                    <hr/>
                    <div>
                        <p
                            className={`text-small md:text-lg italic text-grayText text-center my-3`}
                        >
                            Exclusive offer: start for 3 months for free!
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
                                Loading...
                            </>
                        ) : (

                                <div className={`flex flex-col text-xl desktop:text-2xl`}>
                                    Get started with TheBakerz
                                </div>
                        )}
                    </Button>

                    <div className={`w-full space-y-4 pt-6`}>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    You own webshop
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    Professional online store to showcase and sell your baked creations
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    All Messages in One Place
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    Connect your WhatsApp, Instagram, and Facebook messages in a single view
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    Recipe & Order Control
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    Easy-to-use system to manage your recipes and track all orders
                                </p>
                            </div>
                        </div>
                        <div className={'w-full flex flex-row space-x-3 items-center'}>
                            <IconBadgeCheck className={`w-10 h-10 text-success`}/>
                            <div className={'w-full flex flex-col'}>
                                <p>
                                    Smart Calendar
                                </p>
                                <p
                                    className={`text-tiny cm:text-small text-grayText`}
                                >
                                    Plan your production and keep track of daily tasks
                                </p>
                            </div>
                        </div>
                    </div>
                </CardBody>

            </Card>
        </section>
    );
};


// Footer Component
const Footer = () => {
    const [footerRef, footerInView] = useInView<HTMLDivElement>({threshold: 0});
    const isMobile = useMediaQuery("(max-width: 768px)");

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
            <span className={`text-[3vh] py-12 text-primary text-center ${pacifico.className}`}>We want you to succeed</span>
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
