'use server';
import { ExternalLink } from '@/components/external-link'
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import React from "react";
import {IconHeartCrack} from "@/components/ui/icons";
import {StoreProvider} from "@/components/providers/store-provider";
import LayoutComp from "@/components/layout-comp";
import {getTranslations} from "next-intl/server";

export default async function NotFound() {
    const t = await getTranslations("app/(error_layout)/not-found");
    return (
        <>
            <div className="flex flex-col mb-20 min-h-screen">
                <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                    <p className={`text-3xl my-10 ${pacifico.className}`}>{t('sorry')}</p>
                    <div className="w-2/3 h-2/3 ml-14 mb-2">
                        <Image
                            src="/images/Search.svg"
                            alt="Verify Email Image"
                            width={200} // Adjust based on desired size
                            height={200} // Adjust based on desired size
                            className="w-full h-full"
                            priority
                        />
                    </div>
                    <p>
                        {t("brokenLink")}
                    </p>
                    <ExternalLink href="/">
                        {/*<TranslateOnServer key={'Not Found'} value={"Go back to TheBakerz"}/>*/}
                        {t("goBackToTheBakerz")}
                    </ExternalLink>
                </div>
            </div>
        </>
    );
}

export async function ComingSoon() {
    return (
        <>
            <div className={`flex flex-col gap-y-10 my-10 items-center justify-center min-h-screen`}>
                <p className={`text-center text-5xl ${pacifico.className}`}>
                    Coming Soon!
                </p>
                <div className={`h-10`}>
                    <ExternalLink href="/">
                        Go back to TheBakerz
                    </ExternalLink>
                </div>
                <div className="w-2/3 h-2/3">
                    <Image
                        src="/images/HomeBaker.svg"
                        alt="Home Baker Image"
                        width={200} // Adjust based on desired size
                        height={200} // Adjust based on desired size
                        className="w-full h-full"
                        priority
                    />
                </div>
            </div>
        </>
    );
}

export async function UnderConstruction(
    link: string = "/"
) {
    const t = await getTranslations("app/(error_layout)/not-found");
    return (
        <>
            <div className={`flex flex-col gap-y-10 my-10 items-center justify-center min-h-screen`}>
                <p className={`text-5xl text-center ${pacifico.className}`}>
                    {t("underConstruction")}
                </p>
                <div
                    className={`h-10`}
                >
                    <ExternalLink
                        href={link}
                    >
                        {t('goBackToTheBakerz')}
                    </ExternalLink>
                </div>
                <div className="w-full max-w-2xl">
                    <IconHeartCrack className="w-full h-full text-primary" />
                </div>
                <p className={`text-3xl text-grayText text-center`}>{t('subtitle')}</p>
            </div>
        </>
    );
}