import {Header} from '@/components/header';
import {Footer} from "@/components/footer";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="z-10 flex-grow container mx-auto pt-2">
                {children}
            </main>
        </div>
    );
}