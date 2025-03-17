import '@/styles/globals.css'
import React from "react";

type Params = Promise<{ id: string  }>

export async function generateMetadata({ params }: { // @ts-ignore
    params: Params }) {
    const { id } = await params
}

export default async function Layout({
                                         children,
                                         params,
                                     }: {
    children: React.ReactNode
    params: Params
}) {

    const { id } = await params

    return (
        <div className={'min-h-svh'}>
            {children}
        </div>
    );
}