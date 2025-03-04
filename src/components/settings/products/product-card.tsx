'use client';
import {Tab, Tabs} from "@heroui/react";
import React from "react";
import ProductManager from "@/components/settings/products-settings";
import {useSearchParams} from "next/navigation";
import {ProductDataFull} from "@/lib/actions/product";
import {useSession} from "@/components/providers/session-provider";
import {useStore} from "@/components/providers/store-provider";
import NotFound from "@/app/(error_layout)/not-found";

export const ProductCard: React.FC<{productsData: ProductDataFull}> = ({ productsData }) => {

    const {session} = useSession();
    const { store } = useStore();


    if (!session || !session?.store || !store || store?.id !== session?.store?.id) {
        return <NotFound />;
    }


    const searchParams = useSearchParams();

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";

    return (
        <Tabs

            defaultSelectedKey={selectedTab}
            // onValueChange will update the URL query parameter to reflect the selected tab.
            //@ts-ignore
            fullWidth
            classNames={{
                base: "mt-6",
                cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
                panel: "w-full p-0 pt-4",
            }}
        >
            <Tab key="products" title="Products">
                <ProductManager
                    productsData={productsData}
                />
            </Tab>
            <Tab key="categories" title="Categories">
                <></>
            </Tab>
        </Tabs>
    );
}