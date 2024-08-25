'use client';

import { useRouter } from 'next/navigation';
import {Button} from "@/components/ui/button";
import Image from "next/image";
import React from "react";



export function FirstView() {
    // Inside your component
    const router = useRouter();

    const handleCreate = () => {
        router.push('/create')
        router.refresh()
    };

    return (
        <div className={"flex flex-col md:flex-row justify-center items-center"}>
            <div className="bg-white w-full md:w-1/2 py-12 flex flex-col items-center text-center">
                <h1 className="text-4xl font-bold">
                    Stop getting lost in customer messages, orders, and recipes.
                </h1>
                <p className="text-base my-2">
                    TheBakerz - the only platform you need to manage your business.
                </p>
                <p className="text-sm italic text-primary mb-1 mt-10">
                    Exclusive offer: start for 3 months for free!
                </p>
                <div className={"flex flex-col"}>
                    <Button className="py-2 px-6 rounded-lg text-base" variant={"default"} onClick={handleCreate}>
                        Create a bakery account
                    </Button>
                </div>
            </div>
            <div>
                <Image
                    src="https://assets.api.uizard.io/api/cdn/stream/113b1775-e8c3-42a6-b14a-65709fb5c983.png"
                    alt="Kitchen Illustration"
                    className="w-full h-auto"
                    width={1000}
                    height={1000}
                    quality={100}
                />
            </div>
        </div>
    );
}