import React from "react";
import rehypeSanitize from "rehype-sanitize";
import ReactMarkdown from "react-markdown";
import {privacyEnglishBakerz} from "@/app/(return_page)/policies/privacy-policy/content";


export default async function Page() {



    return (
        <div className="flex flex-col min-h-screen">
            <main className="z-10 grid container mx-auto py-6 gap-y-3 justify-center">
                <ReactMarkdown
                    rehypePlugins={[rehypeSanitize]}
                    className="prose text-grayText prose-headings:text-text prose-strong:text-grayText prose-a:text-grayText max-w-5xl"
                >
                    {privacyEnglishBakerz.content}
                </ReactMarkdown>
            </main>
        </div>
    );
}
