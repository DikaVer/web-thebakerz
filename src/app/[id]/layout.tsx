import {Header} from '@/components/header';
import StoreProvider from "@/components/store-provider";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <StoreProvider>
                <Header/>
                <main className="z-10 flex-grow container mx-auto pt-2">
                    {children}
                </main>
            </StoreProvider>
        </div>
    );
}