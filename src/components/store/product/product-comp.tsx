import React, { useMemo } from "react";
import { ProductData, ProductDataField, StoreData } from "@/lib/definitions";
import {ProductListBakerz, ProductListUser} from "@/components/store/product/product-list";

interface ProductComponentBaseProps {
    storeId: string;
    productData: ProductData;
    isPending?: boolean;
    setPending?: (isPending: boolean) => void;
    setStoreData?: (data: StoreData) => void;
    ProductListComponent: React.ComponentType<ProductListComponentProps>;
}

export interface ProductListComponentProps {
    storeId: string;
    productsByCategories: { [key: string]: ProductDataField[] };
    isPending?: boolean;
    setStoreData?: (data: StoreData) => void;
    setPending?: (isPending: boolean) => void;
}

export const ProductComponentBase: React.FC<ProductComponentBaseProps> = ({
                                                                              storeId,
                                                                              productData,
                                                                              isPending = false,
                                                                              setPending = () => {},
                                                                              setStoreData = () => {},
                                                                              ProductListComponent,
                                                                          }) => {
    // Remove duplicate products based on 'id' using useMemo for performance optimization
    const uniqueProductData: ProductData = useMemo(() => {
        const productMap = new Map<string, ProductDataField>();
        productData.forEach((product) => {
            productMap.set(product.id, product); // If duplicate, the last one will overwrite
        });
        return Array.from(productMap.values());
    }, [productData]);

    // Categorize products by their category
    const productsByCategory: { [key: string]: ProductDataField[] } = useMemo(() => {
        return uniqueProductData.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
        }, {} as { [key: string]: ProductDataField[] });
    }, [uniqueProductData]);

    if (uniqueProductData.length === 0) {
        return (
            <div className="text-center">
                <p className="text-2xl my-10">Store does not have any products yet.</p>
            </div>
        );
    }

    return (
        <ProductListComponent
            storeId={storeId}
            productsByCategories={productsByCategory}
            isPending={isPending}
            setStoreData={setStoreData}
            setPending={setPending}
        />
    );
};

interface ProductComponentBakerzProps {
    storeId: string;
    productData: ProductData;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
}

export const ProductComponentBakerz: React.FC<ProductComponentBakerzProps> = ({
                                                                                  storeId,
                                                                                  productData,
                                                                                  isPending,
                                                                                  setPending,
                                                                                  setStoreData,
                                                                              }) => {
    return (
        <ProductComponentBase
            storeId={storeId}
            productData={productData}
            isPending={isPending}
            setPending={setPending}
            setStoreData={setStoreData}
            // @ts-ignore
            ProductListComponent={ProductListBakerz}
        />
    );
};

interface ProductComponentUserProps {
    storeId: string;
    productData: ProductData;
}

export const ProductComponentUser: React.FC<ProductComponentUserProps> = ({
                                                                              storeId,
                                                                              productData,
                                                                          }) => {
    return (
        <ProductComponentBase
            storeId={storeId}
            productData={productData}
            ProductListComponent={ProductListUser}
        />
    );
};