import ContactUsComponent from "@/components/support/contact-us-component";
import {getLocale, getTranslations} from "next-intl/server";
import {Metadata} from "next";
import {getLocalizedMetadata} from "@/components/metadata";

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
    const t = await getTranslations("ContactUsComponent");

    return (
        <div className={'flex flex-col w-full justify-center items-center'}>
            <div
                className={'flex flex-col items-center justify-center w-full max-w-xl text-center py-12 px-4'}
            >
                <h2
                    className={`font-medium`}
                >
                    {t("Support")}
                </h2>
                <h1
                    className={`text-3xl font-medium tracking-tight lg:text-5xl`}
                >
                    {t("Contact Us")}
                </h1>
                <h2
                    className={`mt-2 text-medium text-default-500 lg:mt-4 lg:text-large`}
                >
                    {t("Contact Us Description")}
                </h2>
            </div>
            <ContactUsComponent/>
        </div>
    );
}