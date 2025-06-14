'use client';
import React, { useEffect} from 'react';
import { useStore } from '@/components/providers/store-provider';
import { useProductDialog } from '@/components/providers/product-provider';
import { ProductDataFull } from '@/lib/actions/product';
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";
import BakerzProductView from "@/components/store/product-page/products-bakerz-view";
import { ProductPageView } from '../user-view/ProductPageView';
import { DeliverySubheader } from '../store-header/delivery-subheader';
import { RescueDeal } from '@/lib/actions/rescue-deal';

interface ProductViewProps {
    productsData: ProductDataFull;
    productId: string;
    rescueDeals?: RescueDeal | null;
}

export const ProductView: React.FC<ProductViewProps> = ({
    productsData,
    productId,
    rescueDeals
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
        p.id === productId
    );

    // Get rescue deal info for the specific product
    const rescueDealInfo = rescueDeals?.products?.find(p => p.id === productId) || null;

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
            <>
                <ProductPageView
                    productData={product}
                    rescueDealInfo={rescueDealInfo}
                />
                <DeliverySubheader />
            </>
        ) : (
            <div className="text-center">
                <p className="text-2xl my-10">{t("productNotFound")}</p>
            </div>
        )
    );
};