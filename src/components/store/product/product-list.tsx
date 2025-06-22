'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Spacer } from '@heroui/react';
import { useStore } from '@/components/providers/store-provider';
import { useMediaQuery } from 'usehooks-ts';
import { useProductDialog } from '@/components/providers/product-provider';
import { ProductData, ProductDataFull } from '@/lib/actions/product';
import {ProductTabs} from "@/components/store/product/components/product-tabs";
import {CategoryProducts} from "@/components/store/product/components/category-products";
import {useScrollObserver} from "@/components/store/product/hooks/useScrollObserver";
import {useTranslations} from "next-intl";
import { sortItems } from "@/lib/utils/helper/sort-items-with-order";
import { logger } from '@/lib/logger';
import { useSession } from "@/components/providers/session-provider";
import { useDelivery } from '@/components/providers/delivery-provider';
import { RescueDeal, RescueDealProduct } from '@/lib/actions/rescue-deal';
import { RescueDealTimer } from '@/components/store/product/rescue-deals/rescue-deal-timer';
import { Icon } from '@iconify/react/dist/iconify.js';

interface ProductListBaseProps {
    rescueDeals: RescueDeal | null;
    productsOrder: Record<string, string[]>;
}

export const ProductListBase: React.FC<ProductListBaseProps> = ({
    rescueDeals,
    productsOrder
}) => {
    const { isSticky } = useStore();
    const [scroll, setScroll] = useState(window.scrollY);
    const isSmall = useMediaQuery('(max-width: 768px)');
    const isShowDelivery = useMediaQuery("(max-width: 1200px)");
    const { sentinelRef } = useStore();
    const [isVisible, setVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState('');
    const { productsDataLocal, filterParams, setFilterParams } = useProductDialog();
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const t = useTranslations('app/(store)/components/product-list');
    const { session } = useSession();
    const { store } = useStore();
    const { isDelivery, validationResult, isRescueDeal, toggleRescueDealMode } = useDelivery();


    // Determine if the current user is the owner of the store
    const isStoreOwner = !!(session?.user?.role === "bakerz" && store?.user_id && session.user.id === store.user_id);

    // Check if there are active filters
    const hasActiveFilters = React.useMemo(() => {
        return (
            (filterParams.minPrice !== undefined && filterParams.minPrice > 0) ||
            (filterParams.maxPrice !== undefined && filterParams.maxPrice < 100000) ||
            (filterParams.categories && filterParams.categories.length > 0) ||
            (filterParams.allergies && filterParams.allergies.length > 0) ||
            (filterParams.dietary && filterParams.dietary.length > 0) ||
            (filterParams.searchTerm && filterParams.searchTerm.trim() !== '')
        );
    }, [filterParams]);

    // Function to clear all filters
    const clearAllFilters = React.useCallback(() => {
        setFilterParams({});
    }, [setFilterParams]);

    // Search term is now handled by the filter component
    // No need for local search term state

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

        // Apply rescue deal filtering first if isRescueDeal is true
        if (isRescueDeal) {
            // Only get product IDs that are both in rescue deals AND have isSelected: true
            const selectedRescueDealProductIds = rescueDeals?.products
                ?.map(p => p.id) || [];
            const rescueDealCategories: Record<string, ProductData[]> = {};
            
            logger.debug('rescue_deal_filter', 'Filtering for selected rescue deals', {
                totalRescueDealProducts: rescueDeals?.products?.length || 0,
                selectedRescueDealProducts: selectedRescueDealProductIds.length,
                selectedRescueDealProductIds,
                isActive: rescueDeals?.isActive
            });
            
            Object.entries(sortedProductsByCategories).forEach(([category, products]) => {
                const rescueDealProductsInCategory = products.filter(product => 
                    selectedRescueDealProductIds.includes(product.id)
                );
                
                if (rescueDealProductsInCategory.length > 0) {
                    rescueDealCategories[category] = rescueDealProductsInCategory;
                    logger.debug('rescue_deal_filter', 'Found selected rescue deal products in category', {
                        category,
                        productCount: rescueDealProductsInCategory.length,
                        productIds: rescueDealProductsInCategory.map(p => p.id)
                    });
                }
            });
            
            productsAfterStandardFilters = rescueDealCategories;
        } else {
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
    
    // Create rescue deals lookup map by product ID for easy access
    const rescueDealsMap: Record<string, RescueDealProduct> = {};
    if (rescueDeals?.products) {
        rescueDeals.products.forEach(product => {
                rescueDealsMap[product.id] = {
                    promotionPercent: product.promotionPercent,
                    quantity: product.quantity,
                    isSelected: product.isSelected
            };
        });
    }
    
    // Get categories in proper order based on productsOrder
    // When isRescueDeal is true, still use productsOrder but only include categories that have rescue deal products
    const availableCategories = Object.keys(filteredProductsByCategories);
    
    const sortedCategories = sortItems(
        availableCategories,
        Object.keys(productsOrder),
        (category: string) => category,
        (a: string, b: string) => a.localeCompare(b)
    );

    // Check if we should show rescue deal messages
    const shouldShowRescueDeliveryMessage = isRescueDeal && isDelivery;
    const shouldShowNoRescueDealsMessage = isRescueDeal && !shouldShowRescueDeliveryMessage && sortedCategories.length === 0;

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

    // Scroll to first category when search term changes is now handled by the filter component

    const setCategoryRef = (category: string, el: HTMLDivElement | null) => {
        categoryRefs.current[category] = el;
    };

    return (
        <div className="flex w-full flex-col">
            <div ref={sentinelRef} className="h-1"></div>
            <div
                className={`flex flex-col-reverse md:flex-row justify-between items-center w-full
                    transition-all duration-300 ease-in-out
                    ${isSticky ? 
                        `sticky z-50 py-4 px-2 md:px-4 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm
                         ${isVisible ? 
                            (isShowDelivery ? 
                                (isRescueDeal ? 'top-[100px]' : 'top-[143px]') 
                                : 'top-[50px]'
                            ) 
                            : '-top-[21px]'
                         }` 
                        : 'relative py-2'
                    }`}
                style={{
                    transform: isSticky ? 'translateY(0)' : 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div className={`w-full transition-all duration-300 ease-in-out ${isSticky ? 'transform scale-95 md:scale-100' : 'transform scale-100'}`}>
                    <ProductTabs
                        categories={sortedCategories}
                        selectedTab={selectedTab}
                        onTabSelect={scrollToCategory}
                    />
                </div>
                <Spacer y={2} />
            </div>
            <div className={`w-full transition-all duration-300 ease-in-out ${isSticky ? 'h-4 bg-gradient-to-b from-background/20 to-transparent' : 'h-4'}`}></div>
            <Spacer y={8} />
            
            {/* Rescue Deal Timer - Show when rescue deals are available and active */}
            {rescueDeals && rescueDeals.isActive && Object.keys(rescueDealsMap).length > 0 && (
                <div className={`transition-all duration-500`}>
                    <RescueDealTimer schedule={store?.schedule} />
                </div>
            )}
            
            {shouldShowRescueDeliveryMessage ? (
                <div className="flex flex-col justify-center w-full gap-4 items-center">
                    <span className="text-foreground text-lg text-center px-4">
                        {t("rescueDealsOnlyAvailableForPickUpOrders")}
                    </span>
                    <button 
                        className="flex flex-row items-center gap-2 bg-background-secondary text-foreground text-lg text-center px-4 max-w-fit rounded-lg py-2" 
                        onClick={() => toggleRescueDealMode(false)}
                    >
                        {t("exploreDesserts")}
                        <Icon icon="solar:arrow-right-outline" width={20} />
                    </button>
                </div>
            ) : shouldShowNoRescueDealsMessage ? (
                <div className="flex flex-col justify-center w-full gap-4 items-center">
                    <span className="text-foreground text-lg text-center px-4">
                        {t("noRescueDealsProductsAtTheMoment")}
                    </span>
                    <button 
                        className="flex flex-row items-center gap-2 bg-background-secondary text-foreground text-lg text-center px-4 max-w-fit rounded-lg py-2" 
                        onClick={() => toggleRescueDealMode(false)}
                    >
                        {t("exploreDesserts")}
                        <Icon icon="solar:arrow-right-outline" width={20} />
                    </button>
                </div>
            ) : (
                <>
                    {sortedCategories.map((category) => (
                        <CategoryProducts
                            key={category}
                            category={category}
                            products={filteredProductsByCategories[category]}
                            setCategoryRef={setCategoryRef}
                            rescueDealsMap={rescueDealsMap}
                        />
                    ))}
                    {sortedCategories.length === 0 && !isRescueDeal && (
                        <div className="flex flex-col justify-center w-full gap-4 items-center">
                            <span className="text-foreground text-lg text-center px-4">{t("noProductsFound")}</span>
                            {hasActiveFilters && (
                                <button 
                                    className="flex flex-row items-center gap-2 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 text-sm px-4 py-2 rounded-lg transition-colors" 
                                    onClick={clearAllFilters}
                                >
                                    <Icon icon="solar:refresh-circle-outline" width={16} />
                                    {t("clearAllFilters")}
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};