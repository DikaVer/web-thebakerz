import React from "react";
import Image from "next/image";
import {IconHeart, IconMessage, IconOrder, IconStore} from "@/components/ui/icons";
import {FirstView} from "@/components/landing/first-view";

export default async function Page() {

    return (
        <div className="flex flex-col min-h-screen">
            <div className="z-10 flex-grow container mx-auto">

                <FirstView/>

                {/* Why Choose Section */}
                <div className="mt-16 w-full px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose TheBakerz?</h2>
                    <div
                        className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-16">

                        {/* Online Store */}
                        <div className="flex flex-col items-center text-center w-60">
                            <div className="bg-secondary-hover p-4 rounded-full mb-4">
                                <IconStore viewBox={"0 0 576 512"} className={"w-10 h-10"} color={"primary"}/>
                            </div>
                            <h3 className="text-xl font-semibold">Online Store</h3>
                            <p className="mt-2 text-grayText">
                                We will create your own online store to showcase your delicious creations and accept
                                orders
                                seamlessly.
                            </p>
                        </div>

                        {/* Order Management */}
                        <div className="flex flex-col items-center text-center w-60">
                            <div className="bg-secondary-hover p-4 rounded-full mb-4">
                                <IconOrder viewBox={"0 0 384 512"} className={"w-10 h-10"} color={"primary"}/>
                            </div>
                            <h3 className="text-xl font-semibold">Order Management</h3>
                            <p className="mt-2 text-grayText">
                                Easily track and manage all your orders in one place, reducing the risk of errors and
                                missed
                                orders.
                            </p>
                        </div>

                        {/* All Chats in One Place */}
                        <div className="flex flex-col items-center text-center w-60">
                            <div className="bg-secondary-hover p-4 rounded-full mb-4">
                                <IconMessage viewBox={"0 0 24 24"} className={"w-10 h-10"} color={"primary"}/>
                            </div>
                            <h3 className="text-xl font-semibold">All chats in one place</h3>
                            <p className="mt-2 text-grayText">
                                Connect customer chats from Instagram and WhatsApp to orders in one place for easy
                                communication.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Succed Footer */}
            </div>
            <div
                className="relative mt-16 lg:px-16 bg-secondary w-full flex justify-between items-center rounded-lg">
                <div className={"flex flex-row items-end"}>
                    <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-32 heart-display:h-32"}
                               color={"heart"}/>
                    <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-10 heart-display:h-10"}
                               color={"heart"}/>
                </div>
                <div className="relative w-36 proportional-girl-mb girl-md:mb-28">
                    <Image
                        src="https://assets.api.uizard.io/api/cdn/stream/414fc800-4b1a-4e80-b649-3e4974d18001.png"
                        alt="TheBakerz - Mickey"
                        className="absolute z-50"
                        width={192}
                        height={279}
                        quality={100}
                    />
                </div>
                <span className="text-2xl font-bold text-primary text-center">We want you to succeed</span>
                <div className="relative w-36 proportional-girl-mb girl-md:mb-32">
                    <Image
                        src="https://assets.api.uizard.io/api/cdn/stream/ede886b8-4a63-4c38-b3a7-80f519ba6f13.png"
                        alt="TheBakerz - Wiki"
                        className="absolute z-50 pb-20"
                        width={185}
                        height={278}
                        quality={100}
                    />
                </div>
                <div className={"flex flex-row items-end"}>
                    <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-10 heart-display:h-10"}
                               color={"heart"}/>
                    <IconHeart viewBox={"0 0 512 512"} className={"w-0 h-0 heart-display:w-32 heart-display:h-32"}
                               color={"heart"}/>
                </div>
            </div>
        </div>
    );

}