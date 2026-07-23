/**
 * @fileoverview Refund policy page at /policies/refund-policy.
 *
 * Server component that renders the Markdown refund and remediation policy
 * from the sibling content module via ReactMarkdown with remark-gfm and
 * rehype-sanitize, injects schema.org WebPage structured data, and exports
 * static SEO metadata.
 */
import React from "react";
import { getLocalizedMetadata } from "@/components/metadata";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import {refundEnglishBakerz} from "@/app/(return_page)/policies/refund-policy/content";
import remarkGfm from "remark-gfm";

const pageTitle = "Refund & Cancellation Policy | TheBakerz";
const pageDescription = "TheBakerz Refund & Cancellation Policy for bakery purchases. Understand your rights & our procedures. Read details here.";
const pageUrl = "https://www.thebakerz.com/policies/refund-policy";

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
                dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema)}}
            />
            <div className="flex flex-col min-h-screen">
                <main className="z-10 grid container mx-auto py-6 gap-y-3 justify-center">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[[rehypeSanitize]]}
                        className="prose text-grayText prose-headings:text-text prose-strong:text-grayText prose-a:text-grayText dark:text-white dark:prose-headings:text-white dark:prose-strong:text-white dark:prose-a:text-white max-w-5xl prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-td:border prose-td:border-gray-300 prose-td:p-2"
                    >
                        {refundEnglishBakerz.content}
                    </ReactMarkdown>
                </main>
            </div>
        </>
    );
}
