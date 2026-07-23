/**
 * @fileoverview Order confirmation page rendered at /[id]/order/success.
 *
 * Server component shown after a successful checkout. Displays a localized
 * "order placed" message, an email-confirmation illustration, and a link
 * back to the store. Renders NotFound when the store slug does not resolve,
 * and exports noindex metadata via generateMetadata.
 */
import {getStoreIdAPI} from "@/lib/api/GET/store-api";
import NotFound from "@/app/(error_layout)/not-found";
import {pacifico} from "@/components/fonts";
import Image from "next/image";
import {ExternalLink} from "@/components/external-link";
import React from "react";
import {getTranslations} from "next-intl/server";

interface StorePageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export async function generateMetadata({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const storeData = await getStoreIdAPI(id);

    if (!storeData) {
        return {
            title: "Order Success",
            description: "Your order has been placed successfully"
        };
    }

    return {
        title: `Order Success | ${storeData.ownerName}`,
        description: `Your order at ${storeData.ownerName} has been placed successfully`,
        robots: {
            index: false,
            follow: false
        }
    };
}


export default async function Page(props: StorePageProps) {

    const params = await props.params;

    const { id } = await params

    const storeData = await getStoreIdAPI(id);

    if (!storeData) {
        return NotFound();
    }

    const t = await getTranslations("app/(store)/id/order/success")

    return (
        <div className="flex flex-col mb-20 min-h-screen">
            <div className="z-10 flex flex-col justify-center items-center container mx-auto text-center ">
                <p className={`text-3xl my-10 ${pacifico.className}`}>{t("orderPlaced")}</p>
                <div className="w-[300px] h-2/3 ml-14 mb-2">
                    <Image
                        src="/images/VerifyEmail.svg"
                        alt={t("verifyEmail")}
                        width={200}
                        height={200}
                        className="w-full h-full"
                        priority
                    />
                </div>
                <p>
                    {t("checkEmail")}
                </p>
                <ExternalLink href={`/${id}`}>
                    {t("returnToStore")}
                </ExternalLink>
            </div>
        </div>
    );
}