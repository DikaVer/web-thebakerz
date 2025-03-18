import { getLocalizedMetadata } from "@/components/metadata";
import SupportComponent from "@/components/support/support-component";
import {Metadata} from "next";
import { getLocale } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();

    return {
        ...getLocalizedMetadata(locale),
        title: 'Support',
        description: 'Get help and support for your account, orders, and more. Our support team is here to assist you.',
        openGraph: {
            title: 'Support',
            description: 'Get help and support for your account, orders, and more. Our support team is here to assist you.'
        },
    };
}

export default async function Page() {

    return <SupportComponent/>
}