import '@/styles/globals.css'
import React from "react";
import type {Metadata} from "next";
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";
import {extractSessionRole} from "@/lib/actions/session-actions";
import {CartProvider} from "@/components/providers/cart-provider";
import {fetchStoreId} from "@/lib/actions-server-only/store-actions";
import {notFound} from "next/navigation";
import {ProductDialogProvider} from "@/components/providers/product-provider";


export const metadata: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s | All-in-One Platform for Artisanal Bakers`
    },
    description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
    keywords: "bakery, artisanal, bakers, platform, webshop, orders, business growth, bakery management, online bakery marketplace",
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    alternates: {
        canonical: 'https://www.TheBakerz.com/',
    },
    openGraph: {
        title: 'TheBakerz',
        description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        url: 'https://www.TheBakerz.com/',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/webStorage/TheBakerzLogo-50OzU9kUKfg3O3kD1MT1p8bBfdxxY2.png',
                width: 1200,
                height: 630,
                alt: 'TheBakerz - All-in-One Platform for Artisanal Bakers',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'TheBakerz',
        description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        images: ['https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/webStorage/TheBakerzLogo-50OzU9kUKfg3O3kD1MT1p8bBfdxxY2.png'],
        creator: '@the_bakerz',
    },
}

export default async function RootLayout({
                                             children,
                                             params
                                         }: Readonly<{
    children: React.ReactNode;
    params: { id: string };
}>) {


    const [sessionRole, storeData] = await Promise.all([
        extractSessionRole(),
        fetchStoreId(params?.id)
    ]);

    const { login, role, name } = sessionRole;


    return (
        <>
            <CartProvider
                storeData={storeData}
            >
                <ProductDialogProvider>
                    <Header
                        storeId={storeData?.storeId}
                        main={false}
                        login={login}
                        role={role}
                        name={name}
                    />
                    {children}
                </ProductDialogProvider>
            </CartProvider>
            <Footer />
        </>
    );
}