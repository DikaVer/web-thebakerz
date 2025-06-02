'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import ProductDialog from "@/components/store/product/dialog/product-dialog";
import { ProductData, ProductDataFull } from "@/lib/actions/product";
import { ItemCart} from "@/lib/actions/cart";
import showErrorMessage from "@/components/toast/toast-error";
import {useRouter, useSearchParams} from "next/navigation";
import { logger } from '@/lib/logger';
import { categories as canonicalCategoriesMap } from '@/lib/local-variables'; // Import canonical categories

// Define filter parameters interface
export interface FilterParams {
    minPrice?: number;
    maxPrice?: number;
    categories?: string[];
    allergies?: string[];
    dietary?: string[];
    searchTerm?: string;
}

interface ProductDialogContextProps {
    handleOpen: (productId: string, isBakerzStore: boolean, itemCart?: ItemCart) => void;
    getProductDataById: (productId: string) => ProductData | undefined;
    handleOpenWithProduct: (product: ProductData, isBakerzStore: boolean, itemCart?: ItemCart) => void;
    setProductsDataLocal: (data: ProductDataFull) => void;
    productsDataLocal: ProductDataFull;
    // Add filter parameters
    filterParams: FilterParams;
    setFilterParams: (params: FilterParams) => void;
    // Add function to toggle search UI visibility
    toggleProductSearch: () => void;
    isProductSearchOpen: boolean;
}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);

const canonicalCategoryNames = Object.keys(canonicalCategoriesMap);
const categoryNameToCanonicalMap = new Map<string, string>();
canonicalCategoryNames.forEach(name => {
    categoryNameToCanonicalMap.set(name.toLowerCase(), name);
});

export const ProductDialogProvider: React.FC<{ children: ReactNode;  productsDataServer?: ProductDataFull;}> = ({children, productsDataServer}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>();
    const [productsData, setProductsData] = useState<ProductDataFull>(productsDataServer ? productsDataServer : {});
    const [itemCart, setItemCartId] = useState<ItemCart | undefined>();
    const [isBakerzStore, setIsBakerzStore] = useState<boolean>(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Parse initial filter params from URL
    const parseFiltersFromUrl = (): FilterParams => {
        const filters: FilterParams = {};
        
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const categoriesParam = searchParams.get('categories');
        const allergies = searchParams.get('allergies');
        const dietary = searchParams.get('dietary');
        const searchTerm = searchParams.get('q');

        // logger.debug('[ProductProvider] parseFiltersFromUrl - raw categoriesParam:', String(categoriesParam));
        
        if (minPrice) filters.minPrice = parseInt(minPrice);
        if (maxPrice) filters.maxPrice = parseInt(maxPrice);
        if (categoriesParam) {
            const urlCategories = categoriesParam.split(',');
            const matchedCategories: string[] = [];
            urlCategories.forEach(urlCat => {
                const canonicalName = categoryNameToCanonicalMap.get(urlCat.trim().toLowerCase());
                if (canonicalName) {
                    matchedCategories.push(canonicalName);
                }
            });
            if (matchedCategories.length > 0) {
                filters.categories = matchedCategories;
            }
            // logger.debug('[ProductProvider] parseFiltersFromUrl - parsed and matched filters.categories:', String(filters.categories));
        }
        if (allergies) filters.allergies = allergies.split(',');
        if (dietary) filters.dietary = dietary.split(',');
        if (searchTerm) filters.searchTerm = searchTerm;
        
        // logger.debug('[ProductProvider] parseFiltersFromUrl - resulting filters object:', JSON.stringify(filters));
        return filters;
    };
    
    const initialParsedFilters = parseFiltersFromUrl();
    // console.log('initialParsedFilters', initialParsedFilters);
    logger.debug('[ProductProvider] Initial parsed filters for state:', JSON.stringify(initialParsedFilters));
    const [filterParams, setFilterParamsState] = useState<FilterParams>(initialParsedFilters);
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(searchParams.get('isProductSearch') === 'true');

    // Update URL when filter params change
    const setFilterParams = (params: FilterParams) => {
        logger.debug('[ProductProvider] setFilterParams called with params:', JSON.stringify(params));
        if (params.categories) {
            logger.debug('[ProductProvider] Categories in params for setFilterParams:', JSON.stringify(params.categories));
        }
        setFilterParamsState(params);
        
        const newSearchParams = new URLSearchParams(searchParams.toString());
        
        // Clear existing filter params
        newSearchParams.delete('minPrice');
        newSearchParams.delete('maxPrice');
        newSearchParams.delete('categories');
        newSearchParams.delete('allergies');
        newSearchParams.delete('dietary');
        newSearchParams.delete('q');
        
        // Add new filter params
        if (params.minPrice !== undefined) newSearchParams.set('minPrice', params.minPrice.toString());
        if (params.maxPrice !== undefined) newSearchParams.set('maxPrice', params.maxPrice.toString());
        if (params.categories && params.categories.length > 0) {
            newSearchParams.set('categories', params.categories.join(','));
            logger.debug('[ProductProvider] setFilterParams - Setting categories in URL:', params.categories.join(','));
        }
        if (params.allergies && params.allergies.length > 0) newSearchParams.set('allergies', params.allergies.join(','));
        if (params.dietary && params.dietary.length > 0) newSearchParams.set('dietary', params.dietary.join(','));
        if (params.searchTerm) newSearchParams.set('q', params.searchTerm);
        
        logger.debug('[ProductProvider] setFilterParams - newSearchParams before replace:', newSearchParams.toString());
        router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    };

    // Toggle product search and update URL
    const toggleProductSearch = () => {
        const newValue = !isProductSearchOpen;
        setIsProductSearchOpen(newValue);
        
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (newValue) {
            newSearchParams.set('isProductSearch', 'true');
        } else {
            newSearchParams.delete('isProductSearch');
        }
        
        router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    };

    // Update state when URL changes (e.g., browser back/forward)
    useEffect(() => {
        logger.debug('[ProductProvider] useEffect [searchParams] triggered. Current searchParams:', searchParams.toString());
        const newFilters = parseFiltersFromUrl();
        setFilterParamsState(newFilters);
        setIsProductSearchOpen(searchParams.get('isProductSearch') === 'true');
        logger.debug('[ProductProvider] useEffect [searchParams] - updated filterParams state:', JSON.stringify(newFilters));
    }, [searchParams]);

    const onClose = () => {
        setIsOpen(false);
        setItemCartId(undefined);
        setProductData(undefined);
    };

    const handleOpen = (productId: string, isBakerzStore: boolean, itemCart?: ItemCart) => {
        setProductData(getProductDataById(productId));
        setItemCartId(itemCart);
        setIsBakerzStore(isBakerzStore);
        setIsOpen(true);
    };

    const handleOpenWithProduct = (product: ProductData, isBakerzStore: boolean, itemCart?: ItemCart) => {
        if (product) {
            setProductData(product);
            setItemCartId(itemCart);
            setIsBakerzStore(isBakerzStore);
            setIsOpen(true);
        } else {
            showErrorMessage({ error: 'Product not found' });
        }
    };

    const getProductDataById = (productId: string) => {
        return productsData ? productsData[productId] : undefined;
    };

    const setProductsDataLocal = (data: ProductDataFull) => {
        setProductsData(data);
    };

    return (
        <ProductDialogContext.Provider
            value={{
                handleOpenWithProduct,
                handleOpen,
                getProductDataById,
                setProductsDataLocal,
                productsDataLocal: productsData,
                filterParams,
                setFilterParams,
                toggleProductSearch,
                isProductSearchOpen,
            }}
        >
            <ProductDialog
                productData={productData}
                isOpen={isOpen}
                onClose={onClose}
                itemCart={itemCart}
                isBakerzStore={isBakerzStore}
            />
            {children}
        </ProductDialogContext.Provider>
    );
};
