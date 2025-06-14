import React from "react";
import {getCurrentStoreId} from "@/lib/api/store-api";
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
    const storeData = await getCurrentStoreId(id);
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