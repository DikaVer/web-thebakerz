"use client";

import React, {useState} from "react";
import Image from "next/image";
import {
    HeartIcon, IconBadge, IconBadgeCheck, IconBadgeInfo,
    IconHeart, IconStar,
} from "@/components/ui/icons";
import { FirstView } from "@/components/landing/first-view";
import {pacifico} from "@/components/fonts";
import {useInView} from "@/lib/hooks/useInView";
import {backdropEffect} from "@/lib/local-variables";
import {Avatar, AvatarIcon, Card, CardBody, Modal, ModalBody, ModalContent, ModalHeader} from "@nextui-org/react";
import VerticalStepsLanding from "@/components/ui/vertical-steps-landing";
import {CardFooter, CardHeader} from "@nextui-org/card";
import {Chip} from "@nextui-org/chip";
import {Image as NextImage} from "@nextui-org/react";
import {formatCurrency} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function Page() {
    return (
            <div className="flex flex-col min-h-screen relative z-10 items-center">
                <FirstView/>
                <div className="flex flex-col container mx-auto items-center justify-center">

                     {/*Why Choose Section */}
                    <WhyChooseSection/>
                    {/*<CheckItOutSection/>*/}
                    <PricingSection/>
                </div>

                {/* Succeed Footer */}
                <Footer/>
            </div>

    );
}

// WhyChooseSection Component
const WhyChooseSection = () => {
    const [whyChooseRef, whyChooseInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const [whyChooseMilestoneRef, whyChooseMilestoneInView] = useInView<HTMLHeadingElement>({ threshold: 0 });

    return (
        <section
            id="why-choose"
            className="w-full px-4 sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
            aria-labelledby="why-choose-section"
        >
            <h2
                ref={whyChooseRef}
                id="why-choose-heading"
                className={`text-3xl sm:text-4xl font-extrabold text-center 
                            opacity-0 transform translate-y-10 
                            ${whyChooseInView ? 'animate-fadeInUp' : ''}`}
            >
                Why Choose TheBakerz?
            </h2>
            <div className={` opacity-0 ${whyChooseMilestoneInView ? 'animate-fadeInUp' : ''}`}
                 ref={whyChooseMilestoneRef}>
                <VerticalStepsLanding
                    defaultStep={0}
                    steps={[
                        {
                            title: "Online Store",
                            description: "We create your own online store to showcase your delicious creations and accept orders seamlessly.",
                        },
                        {
                            title: "Order Management",
                            description: "Easily track and manage all your orders in one place, reducing the risk of errors and missed orders.",
                        },
                        {
                            title: "All Chats in One Place",
                            description: "Connect customer chats from Instagram, Facebook, and WhatsApp to orders in one place for easy communication.",
                        },
                        {
                            title: "Flexible Support",
                            description: "Our dedicated team is here to help during our available hours, ensuring your queries are addressed promptly.",
                        },
                    ]}
                />
            </div>
        </section>
    );
};

const CheckItOutSection = () => {
    const [checkItOut, checkItOutInView] = useInView<HTMLHeadingElement>({ threshold: 0 });
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);



    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleRedirectToStore = () => {
        setLoading(true);
        router.push(`/cakes_and_more`);
        router.refresh();
    };

    return (
        <section
            id="check-it-out-section"
            className="w-full px-4 sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
            aria-labelledby="check-it-out-section"
        >
            <Card
                className={`h-[400px] p-4 w-full max-w-2xl flex flex-col justify-center bg-gradient-to-tr from-primary to-secondary opacity-0
                ${checkItOutInView ? 'animate-fadeInUp' : ''}`}
                ref={checkItOut}
            >
                <Card
                    isBlurred
                    className="w-full h-full border-none bg-background/60 border-1 p-3 gap-y-4"
                    shadow="sm"
                >
                    <div className={`flex flex-row justify-between mb-2`}>
                        <Avatar
                            showFallback
                            //@ts-ignore
                            src={`https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/avatars/Ky1PcdRrD1WpyyUnpqwm-HvUuFoy7hkJRJNL5ltjFJPMfY1yVdT.undefined`}
                            icon={<AvatarIcon/>}
                            className={"w-24 h-24 items-center"}
                            //@ts-ignore
                            width={96}
                            height={96}
                            classNames={{
                                base: "bg-gradient-to-br from-primary to-secondary",
                                icon: "text-black/80",
                            }}
                        />
                        <span
                            className={`text-2xl  cm:text-3xl font-bold clamp-title ${pacifico.className} hover:scale-102 transition duration-300`}>
                                Cakes and more
                        </span>
                    </div>
                    {/*<Slider*/}
                    {/*    width="190px"*/}
                    {/*    duration={40}*/}

                    {/*    pauseOnHover={false}*/}
                    {/*    blurBorders={false}*/}
                    {/*>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Marble cake',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/0AmYIk5mGaph7H4Xt1GI-BNy8VvXYgDQ1IAKl53fRGyVWkb7ekv.image/jpeg',*/}
                    {/*            price: 2600}}*/}
                    {/*        />*/}

                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Roses of Love',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/HEUXwdCalDSQzts6eE3C-mCvSZxLozAiNOUajBymYtrSPtz2FZH.image/jpeg',*/}
                    {/*            price: 43000}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Black Gold',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/kU4eGnbmxWCKFfugWhXF-nnrNSOVTKzrZqKl1IWwWFbeL01g7a0.image/jpeg',*/}
                    {/*            price: 25000}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Lime Mille Crepe',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/ZDfQH42suEq8DNDVqVGB-te4yFqibN5qPUE0g25gAoElBdWGAG0.image/jpeg',*/}
                    {/*            price: 2300}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Chocolate mousse',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/PvpCdbFIAFUk9PSsTc78-9wRrJYKMHIbGg1pvcAzuROXs86C2UM.image/jpeg',*/}
                    {/*            price: 2499}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Tropical Dream',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/dkSx2WjBKpYVoNkn8Nn0-fGt6qDOTNV9vYnCXwbTxlaOtnLrKvq.image/jpeg',*/}
                    {/*            price: 2450}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Red Velvet',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/cuRBLmWsFOI5JKO1mRsE-tcecXzsUbJlZ8Ydx7SuHwdGpVk4j5P.image/jpeg',*/}
                    {/*            price: 2400}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Orange Sunset ',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/0axrou2Q0sjqiEBvmBQX-1z0ERvTPWdWCfh7sdfCVRog36OMn6f.image/png',*/}
                    {/*            price: 3000}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*    <Slider.Slide>*/}
                    {/*        <DumpProduct productData={{*/}
                    {/*            name: 'Strawberry Cake',*/}
                    {/*            image_url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/storeProducts/JIyRcYneXW/iHWMGasKz4bsNXzxNqU2-I3TJuQDqN1rVhS0CgKg2HCMRa7edHI.image/jpeg',*/}
                    {/*            price: 2330}}*/}
                    {/*        />*/}
                    {/*    </Slider.Slide>*/}
                    {/*</Slider>*/}
                    <div className={`flex w-full justify-end`}>
                        <Button
                            className=" text-sm text-background bg-black/20 dark:bg-white/20"
                            //@ts-ignore
                            variant={"flat"}
                            color="default"
                            isLoading={isLoading}
                            //@ts-ignore
                            size={"md"}
                            onPress={() => handleRedirectToStore()}
                        >
                            Review Store
                        </Button>
                    </div>
                </Card>

            </Card>


        </section>
    );
};

const DumpProduct = ({ productData }: { productData: { name: string; image_url: string; price: number } }) => {

    return (
        <div>
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none mx-2`}
            >
                <CardHeader className={"absolute z-10 top-1 flex-row !items-start justify-between"}>
                    {Math.random() < 0.4 ? (
                        <Chip className={`bg-secondary font-bold text-md text-black desktop:text-lg`}>New</Chip>
                    ) : (
                        <div className={"w-1"}></div>
                    )}

                </CardHeader>
                <div className="z-0 w-full max-w-[600px] aspect-[3/2]">
                    <NextImage
                        isZoomed
                        removeWrapper
                        alt={productData.name}
                        className="object-cover"
                        src={productData.image_url}
                        sizes="(max-width: 768px) 100vw, 600px"
                    />
                </div>
                <CardFooter
                    className="justify-between bg-background/40 border-white/20 border-1 aspect-[6/1] store-image:aspect-[6/1] 2xl:aspect-[8/1] overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                    <div className={`flex w-full items-end`}>
                        <Chip
                            startContent={<IconStar className="w-5 cm:w-6 text-warning"/>}
                            variant="light"
                            className={`text-lg cm:text-xl`}
                        >
                            {(Math.random() * 0.5 + 4.5).toFixed(1)}
                        </Chip>
                    </div>
                    <p className={`text-xl cm:text-2xl ${pacifico.className}`}>{formatCurrency(productData.price)}</p>
                </CardFooter>
            </Card>
        </div>
    );
}

const PricingSection = () => {
    const router = useRouter();
    const [isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);

    const [pricingOut, PricingInView] = useInView<HTMLHeadingElement>({ threshold: 0 });



    // Redirects the user to the sign-in page, appending the current path for post-authActions redirection
    const handleCreate = () => {
        setLoading(true);
        router.push('/join-thebakerz');
        router.refresh();
    };

    return (
        <section
            id="pricing-section"
            className="w-full px-4 sm:px-6 lg:px-8 py-12 rounded-lg max-w-2xl"
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
                className={`w-full max-w-2xl h-fit py-4 px-2 desktop:px-10 opacity-0 bg-gradient-to-br from-grayBgComp to-grayBg
                ${PricingInView ? 'animate-fadeInUp' : ''}`}
                ref={pricingOut}
            >
                <CardFooter className={`justify-end`}>
                    <Chip
                        startContent={<HeartIcon className="w-5 cm:w-6 text-primary" filled={true}/>}
                        variant="light"
                        className={`text-lg cm:text-xl border-1 border-primary text-text`}
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
                            className={`text-small girl-md:text-lg italic text-primary text-center my-3`}
                        >
                            Exclusive offer: start for 3 months for free!
                        </p>
                    </div>
                    <Button
                        isLoading={isLoading}
                        disabled={isLoading}

                        className={`py-6 -px-1 ${isLoading ? "px-6" : "-px-1"} text-2xl gradient-background`}
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
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%-43rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-55rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>

            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%+5rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>


            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%+20rem)] -z-10 transform-gpu overflow-hidden sm:hidden blur-3xl sm:top-[calc(65%-55rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>

            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-23rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-45rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                />
            </div>
        </section>
    );
};

// FeatureCard Component
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard = ({icon, title, description}: FeatureCardProps) => {
    const [featureCardRef, featureCardInView] = useInView<HTMLDivElement>({threshold: 0});
    const [isOpen, onClose] = useState(false);

    return (
        <>
            <article
                ref={featureCardRef}
                className={`flex flex-col items-center text-center p-6 border-2 border-grayBg hover:bg-grayBg rounded-lg shadow-sm
                opacity-0 transform translate-y-10 
                ${featureCardInView ? 'animate-fadeInUp' : ''}`}
                onClick={() => onClose(true)}
            >
                <div className="bg-secondary p-4 rounded-full mb-6">
                    {icon}
                </div>
                <h3 className="flex text-xl sm:text-2xl lg:h-12 lg:items-center lg:justify-center font-semibold mb-4">{title}</h3>
                <p className=" text-lg sm:text-xl">{description}</p>
            </article>
            <Modal backdrop={backdropEffect} isOpen={isOpen} onClose={() => onClose(false)} size={'xl'} shadow={"lg"}>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody>
                            <article
                                ref={featureCardRef}
                                className={`flex flex-col items-center text-center p-6 rounded-lg shadow-sm
                                opacity-0 transform translate-y-10 
                                ${featureCardInView ? 'animate-fadeInUp' : ''}`}
                            >
                            <div className="bg-secondary p-4 rounded-full mb-6">
                                    {icon}
                                </div>
                                <h3 className="flex text-xl sm:text-2xl lg:h-12 lg:items-center lg:justify-center font-semibold mb-4">{title}</h3>
                                <p className=" text-lg sm:text-xl">{description}</p>
                            </article>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
};

// Footer Component
const Footer = () => {
    const [footerRef, footerInView] = useInView<HTMLDivElement>({threshold: 0});

    return (
        <div
            ref={footerRef}
            className={`relative lg:px-16 bg-secondary w-full flex justify-between items-center rounded-lg
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
                className={`relative w-36 proportional-girl-mb girl-md:mb-28
                opacity-0 transform translate-y-10 
                ${footerInView ? 'animate-fadeInUp' : ''}
                `}
            >
                <Image
                    src="/images/Mickey.svg"
                    alt="TheBakerz - Mickey"
                    className={`absolute z-50`}
                    width={192}
                    height={279}
                    quality={100}
                />
            </div>
            <span className={`text-[3vh] text-primary text-center ${pacifico.className}`}>We want you to succeed</span>
            <div
                ref={footerRef}
                className={`relative w-36 proportional-girl-mb girl-md:mb-32
                opacity-0 transform translate-y-10 
                ${footerInView ? 'animate-fadeInUp' : ''}
                `}
            >
                <Image
                    src="/images/Wiki.svg"
                    alt="TheBakerz - Wiki"
                    className={`absolute z-50 pb-20`}
                    width={185}
                    height={278}
                    quality={100}
                />
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
