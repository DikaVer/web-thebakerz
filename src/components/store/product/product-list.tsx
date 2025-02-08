'use client';

import React, { useState, useMemo, ChangeEvent, ReactElement } from "react";
import { Search } from "lucide-react";
import { ProductByCategory, StoreData, ProductDataField } from "@/lib/definitions";
import {ProductBakerz, ProductUser} from "@/components/store/product/product";
import {createNanoid} from "@/lib/utils";
import {IconSearch} from "@/components/ui/icons";
import {Input} from "@heroui/input";
import MyInput from "@/components/ui/search";
import {useSearchParams} from "next/navigation";

interface ProductListBaseProps<P> {
    storeId: string;
    productsByCategories: ProductByCategory;
    renderProduct: (product: ProductDataField, index: number) => ReactElement<any>;
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
            <div className="flex bg-outline flex-row items-center w-80 shadow-md px-3 rounded-xl hover:bg-outline-foreground">
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
            <span className="text-xl desktop:text-2xl font-bold">{category}</span>
            <ul className="grid gap-4 grid-cols-2 store-sm:grid-cols-3 py-3">
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
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%-43rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%-55rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>

            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(65%+5rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>


            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(60%+20rem)] -z-10 transform-gpu overflow-hidden sm:hidden blur-3xl sm:top-[calc(65%-55rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-11rem)]  sm:w-[73rem]"
                />
            </div>

            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-23rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-45rem)]"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                />
            </div>
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
    const searchParams = useSearchParams();

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
            isShared={searchParams.get("share") === product.id}
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
    const searchParams = useSearchParams();
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
            isShared={searchParams.get("share") === product.id}
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