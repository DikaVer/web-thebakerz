import ContactUsComponent from "@/components/support/contact-us-component";
import {getLocale, getTranslations} from "next-intl/server";
import {Metadata} from "next";
import {getLocalizedMetadata} from "@/components/metadata";

const pageTitle = "Contact TheBakerz Support | Get Help"; // Specific title < 60
const pageDescription = "Need help with TheBakerz? Contact our support team for assistance with your account, orders, or any other inquiries. Reach out now!"; // Specific desc < 160, CTA
const pageUrl = "https://www.thebakerz.com/support/contact-us";

export async function generateMetadata(): Promise<Metadata> {
    // const locale = await getLocale(); // Not strictly needed for content if only 'en'
    const baseMetadata = getLocalizedMetadata('en');

    return {
        ...baseMetadata,
        title: pageTitle,
        description: pageDescription,
        alternates: {
            ...baseMetadata.alternates,
            canonical: pageUrl,
            languages: { // Hreflang for this specific page
                'en-US': pageUrl,
                'x-default': pageUrl,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageTitle, // Use specific title
            description: pageDescription, // Use specific description
            url: pageUrl, // Use specific URL
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageTitle,
            description: pageDescription,
        }
    };
}

export default async function Page() {
    const t = await getTranslations("app/(return_page)/support/contact-us/page");
    
    const contactPageSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": pageTitle,
        "description": pageDescription,
        "url": pageUrl,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "TheBakerz",
            "logo": {
                "@type": "ImageObject",
                "url": "https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg"
            }
        }
        // Potentially add "contactPoint" with email/phone if displayed on page
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
            />
            <div className={'flex flex-col w-full justify-center items-center'}>
                <div
                    className={'flex flex-col items-center justify-center w-full max-w-xl text-center py-12 px-4'}
                >
                    <h2
                        className={`font-medium`}
                    >
                        {t("support")}
                    </h2>
                    <h1
                        className={`text-3xl font-medium tracking-tight lg:text-5xl`}
                    >
                        {t("contactUs")}
                    </h1>
                    <h2
                        className={`mt-2 text-medium text-default-500 lg:mt-4 lg:text-large`}
                    >
                        {t("contactUsDescription")}
                    </h2>
                </div>
                <ContactUsComponent/>
            </div>
        </>
    );
}