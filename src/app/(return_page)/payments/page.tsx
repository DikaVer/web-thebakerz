import {UnderConstruction} from "@/app/(error_layout)/not-found";
import type { Metadata } from 'next';

const pageTitle = "Manage Payments | TheBakerz";
const pageDescription = "View and manage your payment methods and history on TheBakerz. Securely handle your bakery transactions (Page under construction).";
const pageUrl = "https://www.thebakerz.com/payments";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: pageTitle,
        description: pageDescription,
        robots: {
            index: false,
            follow: false
        },
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            type: 'website',
            siteName: 'TheBakerz',
        },
        twitter: {
            card: 'summary',
            title: pageTitle,
            description: pageDescription,
        }
    };
}

export default async function Page() {

    return UnderConstruction();
}