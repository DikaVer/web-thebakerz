'use client';
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Spacer } from '@heroui/react';
import { useStore } from '@/components/providers/store-provider';
import { useMediaQuery } from 'usehooks-ts';
import { useProductDialog } from '@/components/providers/product-provider';
import { ProductData, ProductDataFull } from '@/lib/actions/product';
import {ProductTabs} from "@/components/store/product/components/product-tabs";
import {CategoryProducts} from "@/components/store/product/components/category-products";
import {useScrollObserver} from "@/components/store/product/hooks/useScrollObserver";
import {useFilteredProducts} from "@/components/store/product/hooks/useFilteredProducts";
import {ProductSearch} from "@/components/store/product/components/product-search";
import {useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {ProductListSkeleton} from "@/components/skeleton/product-list-skeleton";
import UserProductView from "@/components/store/product-page/product-user-view";
import {useSession} from "@/components/providers/session-provider";
import BakerzProductView from "@/components/store/product-page/products-bakerz-view";

interface ProductViewProps {
    productsData: ProductDataFull;
    productId: string;
}

export const ProductView: React.FC<ProductViewProps> = ({
    productsData,
    productId
}) => {
    const { setProductsDataLocal} = useProductDialog();
    const { session } = useSession();
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/product-page");

    // Update local product data
    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    const product = productsData[productId];

    if (!product) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("productNotFound")}</p>
            </div>
        );
    }

    return session?.store && store.id === session?.store.id ? (
        <BakerzProductView productData={product} />
    ) : (
        <UserProductView productData={product} />
    );
};