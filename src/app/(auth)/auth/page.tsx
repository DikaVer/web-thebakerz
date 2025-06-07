import { Metadata } from "next"
 import { redirect } from "next/navigation";
 import { pacifico } from "@/components/fonts";
 import React from "react";
 import TwoStepAuthForm from "@/components/authentication/two-step-auth-form";
 import { globalGETRateLimit } from "@/lib/utils/helper/requests";
 import { getCurrentSession } from "@/lib/actions/session";
 import { getTranslations, getLocale } from "next-intl/server";
 import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata';

// Define page-specific translations outside the function if static
const pageMetadataTranslations = {
    en: {
        title: "Sign In | TheBakerz",
        description: "Access your TheBakerz account. Sign in to manage your bakery, orders, or browse the marketplace.",
        keywords: "sign in, login, authentication, baker account, customer account, thebakerz login",
        ogTitle: "Sign In to TheBakerz",
        ogDescription: "Access your TheBakerz bakery management or customer account.",
        twitterTitle: "Sign In | TheBakerz",
        twitterDescription: "Sign in to manage your bakery or browse the marketplace on TheBakerz."
    },
    nl: {
        title: "Inloggen | TheBakerz",
        description: "Krijg toegang tot uw TheBakerz-account. Log in om uw bakkerij, bestellingen te beheren of de marktplaats te doorzoeken.",
        keywords: "inloggen, aanmelden, authenticatie, bakkersaccount, klantaccount, thebakerz login",
        ogTitle: "Inloggen bij TheBakerz",
        ogDescription: "Krijg toegang tot uw TheBakerz bakkerijbeheer- of klantaccount.",
        twitterTitle: "Inloggen | TheBakerz",
        twitterDescription: "Log in om uw bakkerij te beheren of de marktplaats te doorzoeken op TheBakerz."
    }
};

// Replace static metadata with generateMetadata function
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale);

    let localeKey: 'en' = 'en';

    const pageSpecifics = pageMetadataTranslations[localeKey];

    // Merge keywords
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageKeywords]));

    return {
        ...baseMetadata,
        title: pageSpecifics.title,
        description: pageSpecifics.description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            // Keep base OG image unless a specific one for auth is desired
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
            // Keep base Twitter image unless a specific one for auth is desired
        },
    };
}

 export default async function Page() {
     // Check rate limit
     if (!globalGETRateLimit()) {
         return "Too many requests";
     }

     // Redirect if already logged in
     const { session } = await getCurrentSession();
     if (session !== null) {
         return redirect("/");
     }

     // Get translations
     const t = await getTranslations("app/(auth)/page");

     return (
         <main className="relative flex flex-col isolate min-h-screen items-center justify-center">
             {/* Top gradient background */}
             <div
                 aria-hidden="true"
                 className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
             >
                 <div
                     style={{
                         clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                     }}
                     className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                 />
             </div>

             {/* Bottom gradient background */}
             <div
                 aria-hidden="true"
                 className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-30rem)]"
             >
                 <div
                     style={{
                         clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                     }}
                     className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)] sm:w-[73rem]"
                 />
             </div>

             {/* Auth form */}
             <div className="lg:p-8 w-full">
                 <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
                     <div className="container flex flex-col items-center w-full gap-1">
                         <p className={`flex text-7xl ${pacifico.className}`}>TheBakerz</p>
                         <p className="flex text-grayText">{t("authDescription")}</p>
                     </div>
                     <TwoStepAuthForm />
                 </div>
             </div>
         </main>
     );
 }