
import { ExternalLink } from '@/components/external-link'
import React from "react";

export default function NotFound() {
    return (
        <main>
            <div className="text-center">
                <p className={"text-3xl my-10"}>Sorry, this page isn't available.</p>
                <p>The link you followed may be broken, or the page may have been removed. <ExternalLink href="/">Go back to TheBakerz</ExternalLink>
                </p>
            </div>
        </main>
    );
}