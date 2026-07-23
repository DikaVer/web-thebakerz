/**
 * @fileoverview Tab wrapper embedding the product manager in the settings page.
 *
 * Exports the ProductCard client component, which renders a HeroUI Tabs
 * container whose initial selection comes from the "tab" query parameter and
 * hosts the ProductManager with the provided product data and category
 * ordering.
 */
'use client';
import {Tab, Tabs} from "@heroui/react";
import React from "react";
import ProductManager from "@/components/settings/products-settings";
import {useSearchParams} from "next/navigation";
import {ProductDataFull} from "@/lib/actions/product";
import {useTranslations} from "next-intl";

export const ProductCard: React.FC<{productsData: ProductDataFull; productsOrder: Record<string, string[]>}> = ({ productsData, productsOrder }) => {
    const t = useTranslations("app/(return_page)/settings/components/products/product-card");
    const searchParams = useSearchParams();

    // Read the "tab" query parameter; default to "profile" if not provided.
    const tabParam = searchParams.get('tab');
    const selectedTab = tabParam ? tabParam : "profile";

    return (
        <Tabs
            defaultSelectedKey={selectedTab}
            //@ts-ignore
            fullWidth
            classNames={{
                base: "mt-6",
                cursor: "bg-content1 dark:bg-content1 bg-gradient-card",
                panel: "w-full p-0 pt-4",
            }}
        >
            <Tab key="products" title={t("productManager")}>
                <ProductManager
                    productsOrder={productsOrder}
                    productsData={productsData}
                />
            </Tab>
        </Tabs>
    );
}