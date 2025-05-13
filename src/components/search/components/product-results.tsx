'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllProductsByFilter } from '@/lib/actions/product';
import { ProductData } from '@/lib/actions/product';
import { FilterParams, useProductDialog } from '@/components/providers/product-provider';
import { ProductBase } from '@/components/store/product/product';
import { Spinner, Spacer } from '@heroui/react';

// Global cache for all products by page
const productsCache: Record<number, ProductData[]> = {};
let hasMoreCache = true;

// Helper to check if filter params are empty/default
function isEmptyFilters(filters: FilterParams): boolean {
  return !filters.categories?.length && 
         !filters.allergies?.length && 
         !filters.dietary?.length && 
         filters.minPrice === undefined && 
         filters.maxPrice === undefined;
}

interface ProductResultsProps {
  // No props needed for now
}

const ProductResults: React.FC<ProductResultsProps> = () => {
  const { filterParams } = useProductDialog();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of the previous filters to detect changes
  const prevFiltersRef = useRef<string>("");
  
  // Ref for the observer
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Ref to track if a request is in progress to avoid duplicate requests
  const isRequesting = useRef(false);

  // Function to fetch products
  const fetchProducts = useCallback(async (currentPage: number, currentFilterParams: FilterParams) => {
    if (isRequesting.current || (!hasMore && currentPage > 1)) return;
    
    try {
      isRequesting.current = true;
      setLoading(true);
      setError(null);
      
      // Check if we're showing all products
      const showingAllProducts = isEmptyFilters(currentFilterParams);
      
      // If showing all products and we have cached data for this page, use it
      if (showingAllProducts && productsCache[currentPage]) {
        console.log('Using cached products for page', currentPage);
        
        if (currentPage === 1) {
          setProducts(productsCache[1]);
        } else {
          setProducts(prev => [...prev, ...productsCache[currentPage]]);
        }
        
        setHasMore(hasMoreCache);
        return;
      }
      
      // Otherwise, fetch from API
      const filtersToUse = showingAllProducts ? {} : currentFilterParams;
      
      console.log('Fetching with filters:', filtersToUse, 'Page:', currentPage);
      
      const result = await getAllProductsByFilter(filtersToUse, currentPage, 20);
      console.log('Fetched products:', result.products.length, 'Has more:', result.hasMore);
      
      // If showing all products, cache the result
      if (showingAllProducts) {
        productsCache[currentPage] = result.products;
        hasMoreCache = result.hasMore;
      }
      
      setProducts(prevProducts => 
        currentPage === 1 
          ? result.products 
          : [...prevProducts, ...result.products]
      );
      
      setHasMore(result.hasMore);
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
      console.log('Loading next page:', page + 1);
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

  // Effect for initial load and when filterParams change
  useEffect(() => {
    // Create a stable string representation of the current filters
    const currentFiltersString = JSON.stringify({
      minPrice: filterParams.minPrice,
      maxPrice: filterParams.maxPrice,
      categories: filterParams.categories?.sort(),
      allergies: filterParams.allergies?.sort(),
      dietary: filterParams.dietary?.sort()
    });
    
    // Check if filters have actually changed
    if (currentFiltersString === prevFiltersRef.current) {
      return; // Skip if nothing changed
    }
    
    console.log('Filter params changed, resetting and fetching page 1');
    
    // Update the reference
    prevFiltersRef.current = currentFiltersString;
    
    // Reset everything when filters change
    setProducts([]);
    setPage(1);
    setHasMore(true);
    isRequesting.current = false;
    
    // Clear cache if filters are applied
    if (!isEmptyFilters(filterParams)) {
      Object.keys(productsCache).forEach(key => delete productsCache[Number(key)]);
    }
    
    // Fetch first page with new filters
    fetchProducts(1, filterParams);
    
    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [filterParams, fetchProducts]);

  // Effect for loading more products when page changes
  useEffect(() => {
    if (page > 1) {
      console.log('Page changed to', page, 'fetching more products');
      fetchProducts(page, filterParams);
    }
  }, [page, fetchProducts, filterParams]);

  if (products.length === 0 && loading) {
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
            <p className="text-sm">Try adjusting your filters.</p>
        </div>
    );
  }

  return (
    <div className="min-h-svh">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => {
          const isLastElement = products.length === index + 1;
          return (
            <div 
              key={`${product.id}-${index}`}
              ref={isLastElement ? lastProductElementRef : null} 
              className="m-1"
            >
              <ProductBase productData={product} />
            </div>
          );
        })}
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