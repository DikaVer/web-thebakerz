import React from "react";
import NotFound from "@/app/(error_layout)/not-found";
import { verifyStoreAccess } from "../../store-utils";
import { generateStorePageMetadata } from "../../store-utils";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: { params: LayoutProps['params'] }) {
    const { id } = await params;
    return generateStorePageMetadata(id, 'Add Item', 'Add a new item to your store', { index: false, follow: false });
}

export default async function Layout({ children, params }: LayoutProps) {
    const { id } = await params;

    // Verify user has access to this store
    const storeData = await verifyStoreAccess(id);
    if (!storeData) {
        return <NotFound />;
    }

    return (
        <>
            {children}
        </>
    );
}
