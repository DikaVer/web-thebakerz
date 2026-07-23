/**
 * @fileoverview Filtered product results grid with infinite scroll for the
 * search page.
 *
 * Exports the ProductResults component, which fetches products matching the
 * current filter params (from the product dialog context) via
 * getAllProductsByFilter, shuffles and caches pages in module-level caches,
 * and loads more pages through an IntersectionObserver sentinel. Results are
 * limited to the given nearby stores, hide non-post-delivery products in
 * delivery mode, and fall back to a custom-order prompt when nothing matches.
 * Also exports the isEmptyFilters helper.
 */
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAllProductsByFilter } from '@/lib/actions/product';
import { ProductData } from '@/lib/actions/product';
import { FilterParams, useProductDialog } from '@/components/providers/product-provider';
import { ProductBase } from '@/components/store/product/product';
import { Spinner, Spacer, cn, Divider } from '@heroui/react';
import { logger } from '@/lib/logger';
import clarity from '@microsoft/clarity';
import { exampleStore } from '@/lib/local-variables';
import { NearbyStore } from '@/lib/actions/store';
import { useDelivery } from '@/components/providers/delivery-provider';
import { CustomOrderButton } from '@/components/ui/custom-order-button';
import { useTranslations } from 'next-intl';
// Global cache for all products by page
const productsCache: Record<string, Record<number, ProductData[]>> = {
  "all": {},
  "filtered": {}
};
const hasMoreCache: Record<string, boolean> = {
  "all": true,
  "filtered": true
};

// Helper to check if filter params are empty/default
export function isEmptyFilters(filters: FilterParams): boolean {
  return !filters.categories?.length && 
         !filters.allergies?.length && 
         !filters.dietary?.length && 
         filters.minPrice === undefined && 
         filters.maxPrice === undefined;
}

// Helper to generate a cache key based on storeIds
function getCacheKey(storeIds: string[] = []): string {
  return storeIds.length ? storeIds.sort().join('-') : 'all';
}

// Helper function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ProductResultsProps {
  storeIds?: string[];
  stores?: NearbyStore[];
  isLoading?: boolean;
}

const ProductResults: React.FC<ProductResultsProps> = ({ 
  storeIds = [],
  stores = []
}) => {
  const { filterParams } = useProductDialog();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDelivery } = useDelivery();
  const t = useTranslations("filter");
  const storeDictIds = useMemo(() => {
    return stores.reduce((acc, store) => {
      acc[store.id] = store;
      return acc;
    }, {} as Record<string, NearbyStore>);
  }, [stores]);

  const isFiltered = !isEmptyFilters(filterParams);
  
  // Keep track of the previous filters to detect changes
  const prevFiltersRef = useRef<string>("");
  const prevStoreIdsRef = useRef<string>("");
  
  // Ref for the observer
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Ref to track if a request is in progress to avoid duplicate requests
  const isRequesting = useRef(false);

  useEffect(() => {
    clarity.setTag("page", "search-product-results");
  }, []);

  // Function to fetch products
  const fetchProducts = useCallback(async (currentPage: number, currentFilterParams: FilterParams, currentStoreIds: string[]) => {
    if (isRequesting.current || !isFiltered) return;
    
    try {
      isRequesting.current = true;
      setLoading(true);
      setError(null);
      
      // Check if we're showing all products
      const showingAllProducts = isEmptyFilters(currentFilterParams);
      const cacheKey = getCacheKey(currentStoreIds);
      const cacheType = showingAllProducts ? cacheKey : "filtered";
      
      // If we have cached data for this page, use it
      if (productsCache[cacheType]?.[currentPage]) {
        logger.debug('Using cached products for page', `page: ${currentPage} with storeIds: ${currentStoreIds}`);
        
        if (currentPage === 1) {
          setProducts(productsCache[cacheType][1]);
        } else {
          setProducts(prev => [...prev, ...productsCache[cacheType][currentPage]]);
        }
        
        setHasMore(hasMoreCache[cacheType]);
        setLoading(false);
        isRequesting.current = false;
        return;
      }
      
      // Otherwise, fetch from API
      const filtersToUse = showingAllProducts ? {} : currentFilterParams;
      
      logger.debug('Fetching with filters:', `filters: ${JSON.stringify(filtersToUse)}`);

      // Exclude example store from the search
      const filteredStoreIds = currentStoreIds.filter(id => !exampleStore.includes(id));
    
      const result = await getAllProductsByFilter(filtersToUse, currentPage, 20, filteredStoreIds.length > 0 ? filteredStoreIds : undefined);
    
      logger.debug('Fetched products:', `products: ${result.products.length}`);
      
      // Shuffle the products before caching and setting state
      const shuffledProducts = shuffleArray(result.products);
      
      // Cache the shuffled result
      if (!productsCache[cacheType]) {
        productsCache[cacheType] = {};
      }
      productsCache[cacheType][currentPage] = shuffledProducts;
      hasMoreCache[cacheType] = result.hasMore;
      
      setProducts(prevProducts => 
        currentPage === 1 
          ? shuffledProducts 
          : [...prevProducts, ...shuffledProducts]
      );
      
      setHasMore(result.hasMore);
      
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please reload the page.");
    } finally {
      setLoading(false);
      isRequesting.current = false;
    }
  }, [isFiltered, filterParams, storeIds]); // Remove hasMore dependency to avoid stale closures

  // Handle intersection observer callback
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      // Use a ref to get the current values to avoid stale closures
      setPage(prevPage => {
        // Only increment if we're not already loading and we have more to load
        if (!isRequesting.current && hasMore) {
          logger.debug('Loading next page:', `page: ${prevPage + 1}`);
          return prevPage + 1;
        }
        return prevPage;
      });
    }
  }, [hasMore]); // Remove all dependencies to prevent unnecessary observer recreation

  // Initialize observer and attach to last element
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Always disconnect previous observer before creating a new one
      if (observer.current) {
        observer.current.disconnect();
      }
      
      // Don't create observer if there's no node, no more products to load, or no products yet
      if (!node || !hasMore || products.length === 0) return;
      
      // Create new observer
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '100px', // Load earlier, before user reaches the bottom
        threshold: 0.1 // Trigger when 10% of the element is visible
      });
      
      // Observe the new last element
      observer.current.observe(node);
    },
    [handleObserver, hasMore, products.length] // Add products.length dependency
  );

  // Effect for initial load and when filterParams or storeIds change
  useEffect(() => { // Don't fetch if we're still loading store IDs
    
    // Create a stable string representation of the current filters and storeIds
    const currentFiltersString = JSON.stringify({
      minPrice: filterParams.minPrice,
      maxPrice: filterParams.maxPrice,
      categories: filterParams.categories?.sort(),
      allergies: filterParams.allergies?.sort(),
      dietary: filterParams.dietary?.sort()
    });
    
    const currentStoreIdsString = storeIds.sort().join('-');
    
    // Check if filters or storeIds have actually changed
    if (currentFiltersString === prevFiltersRef.current && 
        currentStoreIdsString === prevStoreIdsRef.current) {
      return; // Skip if nothing changed
    }
    
    logger.debug('StoreIDs:', storeIds.join(', '));
    
    // Update the references
    prevFiltersRef.current = currentFiltersString;
    prevStoreIdsRef.current = currentStoreIdsString;
    
    // Reset everything when filters change
    setProducts([]);
    setPage(1);
    setHasMore(true);
    isRequesting.current = false;
    
    // Clear specific cache if needed
    const isCurrentlyFiltered = !isEmptyFilters(filterParams);
    const cacheKey = getCacheKey(storeIds);
    
    if (isCurrentlyFiltered) {
      // Clear filtered cache when filters are applied
      productsCache["filtered"] = {};
      hasMoreCache["filtered"] = true;
    } else {
      // Reset hasMore for the specific store cache when showing all products
      hasMoreCache[cacheKey] = true;
    }
    
    // Fetch first page with new filters and storeIds
    fetchProducts(1, filterParams, storeIds);
    
    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [filterParams, storeIds, fetchProducts]);

  // Effect for loading more products when page changes
  useEffect(() => {
    if (page > 1) {
      logger.debug('Page changed to', `page: ${page} fetching more products`);
      fetchProducts(page, filterParams, storeIds);
    }
  }, [page, fetchProducts, filterParams, storeIds]);

  if ((products.length === 0 && loading)) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger py-10">{error}</div>;
  }

  if (products.length === 0 && !loading && !hasMore && isFiltered) {
    return (
      <>
        <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-default-600 min-h-svh max-w-2xl mx-auto">
            <p className="text-lg font-medium">{t("noProductsFound")}</p>
            <p className="text-sm">{t("tryAdjustingFiltersOrLocation")}</p>
            <div>
            <div className="flex items-center gap-4 mt-4 justify-center">
            <Divider className="flex-1" />
            <span className="text-default-500">Or</span>
            <Divider className="flex-1" />
            </div>
            <p className="text-sm text-foreground-500 mt-4">{t("special")}</p>
            <CustomOrderButton 
              className="w-full mt-4 justify-center"
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn("w-full")}>
      <div className={'flex w-full justify-center'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6  gap-4 w-full">
          {products.map((product, index) => {
            const deliveryRegion = storeDictIds[product.store_id]?.deliveryRegion;
            // check on delivery region and if storeId is presented in storeIds
            if((isDelivery && !product.isPostDelivery && deliveryRegion?.isPostDelivery) || !storeIds.includes(product.store_id)) {
              return null;
            }

            return (
                <div
                    key={`${product.id}-${index}`}
                    className=""
                >
                  <ProductBase productData={product}/>
                </div>
            );
          }).filter(Boolean)}
        </div>
      </div>
      
      {/* Observer element for infinite scroll - placed after all visible products */}
      {hasMore && products.length > 0 && (
        <div 
          ref={lastProductElementRef}
          className="h-px w-full"
          style={{ marginTop: '100px' }}
        />
      )}
      
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          <div className="text-center text-default-500 py-4">
            <p>{t("noMoreProducts")}</p>
          </div>
          <div>
            <div className="flex items-center gap-4 mt-4 justify-center">
            <Divider className="flex-1" />
            <span className="text-default-500">Or</span>
            <Divider className="flex-1" />
            </div>
            <p className="text-sm text-foreground-500 mt-4">{t("special")}</p>
            <CustomOrderButton 
              className="w-full mt-4 justify-center"
            />
          </div>
        </div>
      )}
      <Spacer y={8} />
    </div>
  );
};

export default ProductResults; 