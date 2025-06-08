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
import {ProductSearch} from "@/components/store/product/components/product-search";
import {useTranslations} from "next-intl";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { logger } from '@/lib/logger';
import { useSession } from "@/components/providers/session-provider";
import { useDelivery } from '@/components/providers/delivery-provider';

interface ProductListBaseProps {
    productsData: ProductDataFull;
    productsOrder: Record<string, string[]>;
}

export const ProductListBase: React.FC<ProductListBaseProps> = ({
    productsData,
    productsOrder
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { isSticky } = useStore();
    const [scroll, setScroll] = useState(window.scrollY);
    const isSmall = useMediaQuery('(max-width: 768px)');
    const isShowDelivery = useMediaQuery("(max-width: 1200px)");
    const { sentinelRef } = useStore();
    const [isVisible, setVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const { productsDataLocal, setProductsDataLocal, filterParams, setFilterParams } = useProductDialog();
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const t = useTranslations('app/(store)/components/product-list');
    const { session } = useSession();
    const { store } = useStore();
    const { isDelivery, validationResult } = useDelivery();


    // Determine if the current user is the owner of the store
    const isStoreOwner = !!(session?.user?.role === "bakerz" && store?.user_id && session.user.id === store.user_id);

    // Update search term in filter params when it changes
    useEffect(() => {
        if (searchTerm !== filterParams.searchTerm) {
            setFilterParams({
                ...filterParams,
                searchTerm: searchTerm
            });
        }
    }, [searchTerm, filterParams, setFilterParams]);

    useEffect(() => {
        setProductsDataLocal(productsData);
    }, [productsData, setProductsDataLocal]);

    // Get sorted and filtered products
    const getFilteredProducts = () => {
        if (!productsDataLocal) return {};
        
        // First, categorize all products by category
        const productsArray: ProductData[] = Object.values(productsDataLocal);
        
        // Categorize products by their category
        const initialProductsByCategories: Record<string, ProductData[]> = {};
        
        productsArray.forEach(product => {
            if (!initialProductsByCategories[product.category]) {
                initialProductsByCategories[product.category] = [];
            }
            initialProductsByCategories[product.category].push(product);
        });
        
        // Apply sorting to each category based on productsOrder
        const sortedProductsByCategories: Record<string, ProductData[]> = {};
        
        Object.keys(initialProductsByCategories).forEach(category => {
            const orderForCategory: string[] = productsOrder[category] || [];
            sortedProductsByCategories[category] = sortItems<ProductData>(
                initialProductsByCategories[category],
                orderForCategory,
                (product: ProductData) => product.id,
                (a: ProductData, b: ProductData) => a.name.localeCompare(b.name)
            );
        });

        let productsAfterStandardFilters: Record<string, ProductData[]>;

        // Apply standard filtering based on filterParams (price, categories, allergies, dietary, searchTerm)
        if (Object.keys(filterParams).length === 0) {
            productsAfterStandardFilters = sortedProductsByCategories;
        } else {
            const currentlyFiltered: Record<string, ProductData[]> = {};
            Object.entries(sortedProductsByCategories).forEach(([category, products]) => {
                const filteredProductList = products.filter(product => {
                    const productPrice = product.price;
                    
                    // Price filter
                    if (filterParams.minPrice !== undefined && productPrice < filterParams.minPrice) {
                        logger.debug('price_filter', 'Product filtered by min price', {
                            productName: product.name, productPrice, minPrice: filterParams.minPrice
                        });
                        return false;
                    }
                    if (filterParams.maxPrice !== undefined && productPrice > filterParams.maxPrice) {
                        logger.debug('price_filter', 'Product filtered by max price', {
                            productName: product.name, productPrice, maxPrice: filterParams.maxPrice
                        });
                        return false;
                    }
                    
                    // Category filter - if categories are selected, only include products in those categories
                    if (filterParams.categories && filterParams.categories.length > 0) {
                        if (!filterParams.categories.includes(product.category)) {
                            return false;
                        }
                    }
                    
                    // Allergies filter (exclude products with selected allergies)
                    if (filterParams.allergies && filterParams.allergies.length > 0) {
                        if (product.allergies && product.allergies.some(allergy => 
                            filterParams.allergies!.includes(allergy))) {
                            return false;
                        }
                    }
                    
                    // Dietary filter (only include products with selected dietary preferences)
                    if (filterParams.dietary && filterParams.dietary.length > 0) {
                        if (!product.dietary || !product.dietary.length) {
                            return false;
                        }
                        const hasSelectedDietary = product.dietary.some(diet => 
                            filterParams.dietary!.includes(diet)
                        );
                        if (!hasSelectedDietary) {
                            return false;
                        }
                    }
                    
                    // Search term filter
                    if (filterParams.searchTerm && filterParams.searchTerm.trim() !== '') {
                        const searchLower = filterParams.searchTerm.toLowerCase();
                        if (!(product.name.toLowerCase().includes(searchLower) || 
                            (product.description && product.description.toLowerCase().includes(searchLower)))) {
                            return false;
                        }
                    }
                    
                    return true;
                });
                
                if (filteredProductList.length > 0) {
                    currentlyFiltered[category] = filteredProductList;
                }
            });
            productsAfterStandardFilters = currentlyFiltered;
        }
        
        // Debug price filter (kept from original code)
        logger.debug('price_filter', 'Current price filters', { 
            minPrice: filterParams.minPrice, 
            maxPrice: filterParams.maxPrice,
            filterParamsType: typeof filterParams
        });

        // New logic: Apply "hide_product" and category hiding for non-store owners
        const finalCategoriesToDisplay: Record<string, ProductData[]> = {};
        Object.entries(productsAfterStandardFilters).forEach(([category, productsInCat]) => {
            if (isStoreOwner) {
                // Store owners see all products that passed previous filters, regardless of hide_product flag
                finalCategoriesToDisplay[category] = productsInCat;
            } else {
                // For regular users, filter out individual hidden products
                const visibleProducts = productsInCat.filter(p => !p.hide_product && !(isDelivery && validationResult.deliveryRegion?.isPostDelivery && validationResult.deliveryRegion?.isPostDelivery !== p.isPostDelivery) || store?.user_id === session?.user?.id); // !p.hide_product is true if hide_product is false or undefined

                // If the category still has visible products after this, add it
                if (visibleProducts.length > 0) {
                    finalCategoriesToDisplay[category] = visibleProducts;
                }
                // If all products in the category were hidden (or filtered out such that only hidden ones remained),
                // visibleProducts will be empty, and the category won't be added to finalCategoriesToDisplay.
            }
        });
        
        return finalCategoriesToDisplay;
    };

    // Get filtered and sorted categories
    const filteredProductsByCategories = getFilteredProducts();
    
    // Get categories in proper order based on productsOrder
    const sortedCategories = sortItems(
        Object.keys(filteredProductsByCategories),
        Object.keys(productsOrder),
        (category: string) => category,
        (a: string, b: string) => a.localeCompare(b)
    );

    // Handle scroll event
    useEffect(() => {
        const onScroll = () => {
            const addY = isVisible ? - 10 : 4;
            setVisible(window.scrollY + addY < scroll || !isSmall || !isSticky);
            setScroll(window.scrollY);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [scroll, isSmall, isSticky, isVisible]);

    // Use custom scroll observer to update selected category on scroll
    useScrollObserver({ 
        categoryRefs, 
        isSmall, 
        selectedTab, 
        setSelectedTab, 
        categories: sortedCategories,
        isVisible,
        isShowDelivery 
    });

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
            if (sortedCategories.length > 0) {
                scrollToCategory(sortedCategories[0]);
            }
        }
    }, [searchTerm, sortedCategories]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const setCategoryRef = (category: string, el: HTMLDivElement | null) => {
        categoryRefs.current[category] = el;
    };

    return (
        <div className="flex w-full flex-col">
            <div ref={sentinelRef} className="h-1"></div>
            <div
                className={`flex flex-col-reverse md:flex-row transition-all justify-between items-center w-full ${
                    isSticky &&
                    `sticky ${isVisible ? isShowDelivery ? 'top-[143px] ' : 'top-[50px]' : 'top-[0px] pt-3'} z-50 py-4 bg-background`
                }`}
            >
                <ProductTabs
                    categories={sortedCategories}
                    selectedTab={selectedTab}
                    onTabSelect={scrollToCategory}
                />
                <Spacer y={2} />
                <ProductSearch searchTerm={searchTerm} onSearchChange={handleSearchChange} />
            </div>
            <div className={`w-full h-4 ${isSticky ? ' sticky top-[105px] z-40 shadow-xl' : ''} ${isVisible ? 'top-[0px]' : 'top-[98px]'}`}></div>
            <Spacer y={8} />
            {sortedCategories.map((category) => (
                <CategoryProducts
                    key={category}
                    category={category}
                    products={filteredProductsByCategories[category]}
                    setCategoryRef={setCategoryRef}
                />
            ))}
            {sortedCategories.length === 0 && (
                <div className="flex justify-center w-full">
                    <span className="text-default-400 text-lg">{t("noProductsFound")}</span>
                </div>
            )}
        </div>
    );
};