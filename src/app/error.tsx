/**
 * @fileoverview Root error boundary UI for the App Router.
 *
 * Client component rendered when an unhandled error occurs in a route
 * segment. Shows a translated error message with the error text, an
 * illustration, and a button that navigates back and refreshes the router.
 */
'use client';

import React from 'react';
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import {Button} from "@heroui/react";
import {Icon} from "@iconify/react";
import { useRouter } from 'next/navigation';
import {useTranslations} from "next-intl";

export default function Error({ error, reset } : { error: Error, reset: () => void }) {
    const router = useRouter();
    const t = useTranslations("app/(error_layout)/error");

    return (
        <div className="flex flex-col mb-20 min-h-screen">
            <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                <p className={`text-3xl my-10 ${pacifico.className}`}>{t("somethingWentWrong")}</p>
                <div className="w-2/3 h-2/3 ml-14 mb-2">
                    <Image
                        src="/images/HomeBaker.svg"
                        alt="Error Image"
                        width={200}
                        height={200}
                        className="w-full h-full"
                        priority
                    />
                </div>
                <p>{t("error")}</p>
                <strong>{error.message}</strong>
                <Button
                    aria-label="Go back to TheBakerz"
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
                    {t("goBackToTheBakerz")}
                </Button>
            </div>
        </div>
    );
}