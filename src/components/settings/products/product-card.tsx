'use client';
import {Tab, Tabs} from "@heroui/react";
import React from "react";
import ProductManager from "@/components/settings/products-settings";
import {useSearchParams} from "next/navigation";
import {ProductDataFull} from "@/lib/actions/product";
import {useTranslations} from "next-intl";

export const ProductCard: React.FC<{productsData: ProductDataFull; productsOrder: Record<string, string[]>}> = ({ productsData, productsOrder }) => {



    const t = useTranslations("ProductSettings");
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
            <Tab key="products" title={t("ProductManager")}>
                <ProductManager
                    productsOrder={productsOrder}
                    productsData={productsData}
                />
            </Tab>
        </Tabs>
    );
}