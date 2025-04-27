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

interface ProductListBaseProps {
    productsData: ProductDataFull;
    productsByCategories: { [key: string]: ProductData[] };
    categories: string[];
}

export const ProductListBase: React.FC<ProductListBaseProps> = ({
                                                                    productsData,
                                                                    productsByCategories,
                                                                    categories
                                                                }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { isSticky } = useStore();
    const [scroll, setScroll] = useState(window.scrollY);
    const isSmall = useMediaQuery('(max-width: 768px)');
    const [isVisible, setVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const { setProductsDataLocal} = useProductDialog();
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const t = useTranslations('app/(store)/components/product-list');

    // Update local product data
    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData]);

    // Handle scroll event
    useEffect(() => {
        const onScroll = () => {
            const addY = isVisible ? - 10 : 4;
            setVisible(window.scrollY + addY < scroll || !isSmall || !isSticky);
            setScroll(window.scrollY);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [scroll, isSmall, isSticky]);

    const filteredProductsByCategories = useFilteredProducts(
        productsByCategories,
        categories,
        searchTerm
    );


    // Use custom scroll observer to update selected category on scroll
    useScrollObserver({ categoryRefs, isSmall, selectedTab, setSelectedTab });

    const scrollToCategory = (category: string) => {
        const element = categoryRefs.current[category];
        if (element) {
            const headerOffset = isSmall ? 280 : 320;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            setSelectedTab(category);
        }
    };

    // Scroll to first category when search term changes
    useEffect(() => {
        if (searchTerm.trim() !== '') {
            const categories = Object.keys(filteredProductsByCategories);
            if (categories.length > 0) {
                scrollToCategory(categories[0]);
            }
        }
    }, [searchTerm, filteredProductsByCategories]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const setCategoryRef = (category: string, el: HTMLDivElement | null) => {
        categoryRefs.current[category] = el;
    };

    return (
        <div className="flex w-full flex-col">
            <div
                className={`flex flex-col-reverse md:flex-row transition-all justify-between items-center w-full ${
                    isSticky &&
                    `sticky ${isVisible ? 'top-16' : 'top-4 pt-3 rounded-3xl'} z-50 p-4 bg-background rounded-b-3xl shadow-medium`
                }`}
            >
                <ProductTabs
                    categories={Object.keys(filteredProductsByCategories)}
                    selectedTab={selectedTab}
                    onTabSelect={scrollToCategory}
                />
                <Spacer y={2} />
                <ProductSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            </div>
            <Spacer y={8} />
            {Object.keys(filteredProductsByCategories).map((category) => (
                <CategoryProducts
                    key={category}
                    category={category}
                    products={filteredProductsByCategories[category]}
                    setCategoryRef={setCategoryRef}
                />
            ))}
            {Object.keys(filteredProductsByCategories).length === 0 && (
                <div className="flex justify-center w-full">
                    <span className="text-default-400 text-lg">{t("noProductsFound")}</span>
                </div>
            )}
        </div>
    );
};