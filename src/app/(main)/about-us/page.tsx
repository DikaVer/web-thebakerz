import {pacifico} from "@/components/fonts";
import Image from 'next/image';
import React from "react";
import {FollowUs} from "@/components/about-us/follow-us";
import {FooterImage} from "@/components/about-us/footer-image";

export default async function Page() {

    return (
        <div className="flex flex-col min-h-screen">
            <main className="z-10 grid container mx-auto py-6 gap-y-3 text-[#1F2937]">
                <section id={'nice-to-meet-you'}>
                    <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 relative">
                        <div
                            className="flex items-center justify-center bg-gradient-to-tl from-secondary to-white rounded-none rounded-b-lg lg:rounded-none lg:rounded-l-lg">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className={`text-left text-4xl lg:text-6xl font-bold mb-10 ${pacifico.className}`}>
                                    Nice to meet you
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light ">
                                    <p className={'text-left'}>
                                        We’re David and Dumitru, and TheBakerz means a lot to us. After seeing our
                                        friends and family who bake struggle with late-night orders, juggling too many
                                        apps, and feeling like they never had time for the craft they love, we knew
                                        something had to change.
                                        <br/><br/>
                                        So we stepped in to help.
                                    </p>
                                </div>

                            </div>
                        </div>
                        <div className="relative w-full h-[500px] lg:h-auto">
                            <Image
                                src="/images/hero.webp"
                                alt="TheBakerz Hero"
                                fill
                                className="object-cover rounded-none rounded-t-lg lg:rounded-none lg:rounded-r-lg"
                                priority
                            />
                        </div>
                    </div>
                </section>
                <section id={'bake-more-manage-less'}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 relative bg-gradient-to-tl from-secondary to-white rounded-lg">
                        <div
                            className="relative overflow-hidden w-full">

                            <div className={`h-full flex justify-center`}>
                                <Image
                                    src="/images/HomeKitchen.svg"
                                    alt="TheBakerz Hero"
                                    width={1920}
                                    height={1536}
                                    className="rounded-none rounded-t-lg lg:rounded-none lg:rounded-r-lg"
                                    priority
                                />
                            </div>

                        </div>
                        <div
                            className="flex items-center justify-center">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                                    Bake More, Manage Less
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light">
                                    <p>
                                        TheBakerz puts everything bakers need in one place. Instead of bouncing between
                                        spreadsheets, emails, and messages, you can handle all your orders, schedules,
                                        and customer details from a single, organized spot. Less hassle, fewer
                                        headaches,
                                        and more energy for doing what you do best—baking.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
                <section id={'bake-more-manage-less'}>
                    <div className="flex flex-col lg:grid lg:grid-cols-2 relative">
                        <div className="flex items-center justify-center bg-gradient-to-tl from-secondary to-white rounded-lg">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                                    Why We Do This
                                </h2>

                                <div className="mb-6 text-md lg:text-lg font-light">
                                    <p>
                                        For us, TheBakerz isn’t just another idea—it’s a direct response to what
                                        our friends and family bakers told us they need. We’re here to make it easier,
                                        so you can focus on what you love most. Follow us on social and let’s shape
                                        a better future together.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center text-text">
                            <div
                                className="justify-center max-w-[620px] flex flex-col h-full lg:text-left px-4 py-12 lg:px-12 mx-auto lg:mx-0">

                                <h2 className={`text-4xl lg:text-6xl font-bold text-center mb-6 ${pacifico.className}`}>
                                    Follow Us
                                </h2>
                                <div className="flex space-x-6">
                                    <FollowUs/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className={`w-full flex justify-center`}>
                    <FooterImage/>
                </div>

            </main>
        </div>
    );
}

