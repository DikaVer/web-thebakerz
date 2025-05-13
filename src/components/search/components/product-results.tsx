'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllProductsByFilter } from '@/lib/actions/product';
import { ProductData } from '@/lib/actions/product';
import { FilterParams, useProductDialog } from '@/components/providers/product-provider';
import { ProductBase } from '@/components/store/product/product';
import { Spinner, Spacer, cn } from '@heroui/react';
import { logger } from '@/lib/logger';
import clarity from '@microsoft/clarity';

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

interface ProductResultsProps {
  storeIds?: string[];
  isLoading?: boolean;
}

const ProductResults: React.FC<ProductResultsProps> = ({ 
  storeIds = []
}) => {
  const { filterParams } = useProductDialog();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (isRequesting.current || (!hasMore && currentPage > 1)) return;
    
    try {
      isRequesting.current = true;
      setLoading(true);
      setError(null);
      
      // Check if we're showing all products
      const showingAllProducts = isEmptyFilters(currentFilterParams);
      const cacheKey = getCacheKey(currentStoreIds);
      
      // If showing all products and we have cached data for this page, use it
      if (showingAllProducts && productsCache[cacheKey]?.[currentPage]) {
        logger.debug('Using cached products for page', `page: ${currentPage} with storeIds: ${currentStoreIds}`);
        
        if (currentPage === 1) {
          setProducts(productsCache[cacheKey][1]);
        } else {
          setProducts(prev => [...prev, ...productsCache[cacheKey][currentPage]]);
        }
        
        setHasMore(hasMoreCache[cacheKey] || false);
        return;
      }
      
      // Otherwise, fetch from API
      const filtersToUse = showingAllProducts ? {} : currentFilterParams;
      
      logger.debug('Fetching with filters:', `filters: ${JSON.stringify(filtersToUse)}`);
      if (isEmptyFilters(filtersToUse)) {
        const result = await getAllProductsByFilter(filtersToUse, currentPage, 20, currentStoreIds.length > 0 ? currentStoreIds : undefined);
      
        logger.debug('Fetched products:', `products: ${result.products.length}`);
        
        // If showing all products, cache the result
        if (showingAllProducts) {
          if (!productsCache[cacheKey]) {
            productsCache[cacheKey] = {};
          }
          productsCache[cacheKey][currentPage] = result.products;
          hasMoreCache[cacheKey] = result.hasMore;
        }
        
        setProducts(prevProducts => 
          currentPage === 1 
            ? result.products 
            : [...prevProducts, ...result.products]
        );
        
        setHasMore(result.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
      isRequesting.current = false;
    }
  }, [hasMore]);

  // Handle intersection observer callback
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && hasMore && !loading && !isRequesting.current) {
      logger.debug('Loading next page:', `page: ${page + 1}`);
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, loading, page]);

  // Initialize observer and attach to last element
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      
      // Always disconnect previous observer before creating a new one
      if (observer.current) {
        observer.current.disconnect();
      }
      
      // Create new observer
      observer.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '100px', // Load earlier, before user reaches the bottom
        threshold: 0.1 // Trigger when 10% of the element is visible
      });
      
      // Observe the new last element
      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, handleObserver]
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
    if (!isEmptyFilters(filterParams)) {
      // Only clear filtered cache, keep all-products cache
      productsCache["filtered"] = {};
      hasMoreCache["filtered"] = true;
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

  if (products.length === 0 && !loading && !hasMore) {
    return (
        <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-default-600 min-h-svh">
            <p className="text-lg font-medium">No Products Found</p>
            <p className="text-sm">Try adjusting your filters or location.</p>
        </div>
    );
  }

  return (
    <div className={cn(isFiltered ? "block" : "hidden", "w-full")}>
      <div className={'flex w-full justify-center'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6  gap-4 w-full">
          {products.map((product, index) => {
            const isLastElement = products.length === index + 1;
            return (
                <div
                    key={`${product.id}-${index}`}
                    ref={isLastElement ? lastProductElementRef : null}
                    className=""
                >
                  <ProductBase productData={product}/>
                </div>
            );
          })}
        </div>
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <div className="text-center text-default-500 py-4">
          <p>No more products to load.</p>
        </div>
      )}
      <Spacer y={8} />
    </div>
  );
};

export default ProductResults; 