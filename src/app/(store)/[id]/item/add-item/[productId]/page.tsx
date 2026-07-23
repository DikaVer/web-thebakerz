/**
 * @fileoverview Product editing page rendered at /[id]/item/add-item/[productId].
 *
 * Server component that resolves the store by slug (rendering NotFound if it
 * does not exist) and renders the ItemPage editor for the given product ID.
 */
import React from "react";
import {getStoreIdAPI} from "@/lib/api/GET/store-api";
import {ItemPage} from "@/components/store/add-item/item-page";
import NotFound from "@/app/(error_layout)/not-found";
interface PageProps {
    params: Promise<{
        id: string;
        productId: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id, productId } = await params;
    const storeData = await getStoreIdAPI(id);
    if (!storeData) {
        return <NotFound />;
    }


    return (
        <div className="flex flex-col min-h-screen relative z-10 items-center">
            <div className="flex flex-col container mx-auto items-center justify-center">
                <ItemPage
                    storeId={storeData.id}
                    productId={productId}
                />
            </div>
        </div>
    );
}