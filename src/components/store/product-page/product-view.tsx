'use client';
import React, { useEffect} from 'react';
import { useStore } from '@/components/providers/store-provider';
import { useProductDialog } from '@/components/providers/product-provider';
import { ProductDataFull } from '@/lib/actions/product';
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import BakerzProductView from "@/components/store/product-page/products-bakerz-view";
import { ProductPageView } from '../user-view/ProductPageView';

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

    // Find product by either web_name or id
    const product = Object.values(productsData).find(p => 
        p.id === productId || p.web_name === productId
    );

    if (!product && store.user_id !== session?.user?.id) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">{t("productNotFound")}</p>
            </div>
        );
    }

    return  store.user_id === session?.user?.id ? (
        <BakerzProductView
            storeId={store.id}
            productData={product}
        />
    ) : (
        product ? (
            <ProductPageView
                productData={product} 
             />
        ) : (
            <div className="text-center">
                <p className="text-2xl my-10">{t("productNotFound")}</p>
            </div>
        )
    );
};