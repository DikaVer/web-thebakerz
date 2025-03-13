'use client';

import React from 'react';
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import {Button} from "@heroui/react";
import {Icon} from "@iconify/react";
import { useRouter } from 'next/navigation';

export default function Error({ error, reset } : { error: Error, reset: () => void }) {

    const router = useRouter();

    return (
        <div className="flex flex-col mb-20 min-h-screen">
            <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                <p className={`text-3xl my-10 ${pacifico.className}`}>Something went wrong!</p>
                <div className="w-2/3 h-2/3 ml-14 mb-2">
                    <Image
                        src="/images/HomeBaker.svg"
                        alt="Verify Email Image"
                        width={200} // Adjust based on desired size
                        height={200} // Adjust based on desired size
                        className="w-full h-full"
                        priority
                    />
                </div>
                <p>Send this information to our support:</p>
                <p>{error.message}</p>
                <Button
                    size="md"
                    variant="light"
                    className="text-default-500"
                    onPress={() => {
                        router.back()
                        router.refresh();
                    }}
                    startContent={
                        <Icon
                            className="text-default-500"
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
                    }
                >
                    Go Back
                </Button>
            </div>
        </div>
    );
}