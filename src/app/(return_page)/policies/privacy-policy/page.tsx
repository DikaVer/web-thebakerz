import React from "react";
import rehypeSanitize from "rehype-sanitize";
import ReactMarkdown from "react-markdown";
import {privacyEnglishBakerz} from "@/app/(return_page)/policies/privacy-policy/content";
import { getLocalizedMetadata } from "@/components/metadata";
import {Metadata} from "next";

const pageTitle = "Privacy Policy | TheBakerz";
const pageDescription = "Review TheBakerz Privacy Policy to see how we collect, use, and protect your data. Understand your rights. Read now.";
const pageUrl = "https://www.thebakerz.com/policies/privacy-policy";

export const metadata: Metadata = {
    ...(getLocalizedMetadata('en')),
    title: pageTitle,
    description: pageDescription,
    alternates: {
        canonical: pageUrl,
        languages: {
            'en-US': pageUrl,
            'x-default': pageUrl,
        }
    },
    openGraph: {
        ...(getLocalizedMetadata('en').openGraph || {}),
        title: pageTitle,
        description: pageDescription,
        url: pageUrl,
        type: 'article',
    },
    twitter: {
        ...(getLocalizedMetadata('en').twitter || {}),
        card: 'summary',
        title: pageTitle,
        description: pageDescription,
    }
};


export default async function Page() {
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
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
    };


    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <div className="flex flex-col min-h-screen">
                <main className="z-10 grid container mx-auto py-6 gap-y-3 justify-center">
                    <ReactMarkdown
                        rehypePlugins={[rehypeSanitize]}
                       className="prose text-grayText prose-headings:text-text prose-strong:text-grayText prose-a:text-grayText dark:text-white dark:prose-headings:text-white dark:prose-strong:text-white dark:prose-a:text-white max-w-5xl"
                    >
                        {privacyEnglishBakerz.content}
                    </ReactMarkdown>
                </main>
            </div>
        </>
    );
}
