'use client';

import React, { useState, useMemo, ChangeEvent, ReactElement } from "react";
import { Search } from "lucide-react";
import { ProductByCategory, StoreData, ProductDataField } from "@/lib/definitions";
import {ProductBakerz, ProductUser} from "@/components/store/product/product";
import {createNanoid} from "@/lib/utils";

interface ProductListBaseProps<P> {
    storeId: string;
    productsByCategories: ProductByCategory;
    renderProduct: (product: ProductDataField, index: number) => ReactElement;
}

export const ProductListBase = <P,>({
                                        storeId,
                                        productsByCategories,
                                        renderProduct,
                                    }: ProductListBaseProps<P>) => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const filteredProductsByCategories = useMemo(() => {
        if (!searchTerm.trim()) return productsByCategories;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return Object.keys(productsByCategories).reduce((acc, category) => {
            const filteredProducts = productsByCategories[category].filter(
                (product) =>
                    product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    category.toLowerCase().includes(lowerCaseSearchTerm)
            );
            if (filteredProducts.length > 0) {
                acc[category] = filteredProducts;
            }
            return acc;
        }, {} as ProductByCategory);
    }, [productsByCategories, searchTerm]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const renderSearchInput = () => (
        <div className="flex flex-row w-full justify-center">
            <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    type="text"
                    placeholder="Search product by name or category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        </div>
    );

    const renderCategoryProducts = (category: string, products: ProductDataField[]) => (
        <div className="mt-2" key={category}>
            <span className="text-xl font-bold">{category}</span>
            <ul className="grid gap-4 grid-cols-1 store-sm:grid-cols-2 py-3">
                {products.map((product, index) => renderProduct(product, index))}
            </ul>
        </div>
    );

    return (
        <div className="my-4">
            {renderSearchInput()}
            {Object.keys(filteredProductsByCategories).map((category) =>
                renderCategoryProducts(category, filteredProductsByCategories[category])
            )}
        </div>
    );
};

interface ProductListBakerzProps {
    storeId: string;
    productsByCategories: ProductByCategory;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
}

export const ProductListBakerz: React.FC<ProductListBakerzProps> = ({
                                                                        storeId,
                                                                        productsByCategories,
                                                                        isPending,
                                                                        setPending,
                                                                        setStoreData,
                                                                    }) => {
    const renderProduct = (product: ProductDataField, index: number) => (
        <ProductBakerz
            key={product.id + index}
            productData={{
                store_id: storeId,
                name: product.name,
                description: product.description,
                rating: product.rating,
                category: product.category,
                price: product.price,
                image_url: product.image_url,
                id: product.id,
            }}
            isPending={isPending}
            setStoreData={setStoreData}
            setPending={setPending}
        />
    );

    return (
        <ProductListBase<ProductListBakerzProps>
            storeId={storeId}
            productsByCategories={productsByCategories}
            renderProduct={renderProduct}
        />
    );
};

interface ProductListUserProps {
    storeId: string;
    productsByCategories: ProductByCategory;
}

export const ProductListUser: React.FC<ProductListUserProps> = ({
                                                                    storeId,
                                                                    productsByCategories,
                                                                }) => {
    const renderProduct = (product: ProductDataField, index: number) => (
        <ProductUser
            key={product.id + index}
            productData={{
                store_id: storeId,
                name: product.name,
                description: product.description,
                rating: product.rating,
                category: product.category,
                price: product.price,
                image_url: product.image_url,
                id: product.id,
            }}
            // Add any additional props specific to ProductUser if necessary
        />
    );

    return (
        <ProductListBase<ProductListUserProps>
            storeId={storeId}
            productsByCategories={productsByCategories}
            renderProduct={renderProduct}
        />
    );
};