import {Header} from '@/components/header';
import {Footer} from "@/components/footer";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-col">
            <Header/>
            <main className="flex-grow container mx-auto pt-18">
            {children}
            </main>
        </div>
    );
}