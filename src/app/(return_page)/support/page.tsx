import { getLocalizedMetadata } from "@/components/metadata";
import SupportComponent from "@/components/support/support-component";
import {Metadata} from "next";
// import { getLocale } from "next-intl/server"; // Not strictly needed if hardcoding to en

const pageTitle = "TheBakerz Support Center | Help & FAQs"; // Specific title < 60
const pageDescription = "Find help with TheBakerz account, orders, and platform features in our Support Center. Browse FAQs or contact us for assistance."; // Specific desc < 160, CTA
const pageUrl = "https://www.thebakerz.com/support";

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
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage", // Could be QAPage if it primarily hosts FAQs
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
        // If QAPage, add mainEntity with Question and Answer items
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
            />
            <SupportComponent/>
        </>
    )
}