import { useMemo } from 'react';
import { ProductData } from '@/lib/actions/product';

export const useFilteredProducts = (
    productsByCategories: { [key: string]: ProductData[] },
    searchTerm: string
) => {
    return useMemo(() => {
        if (!searchTerm.trim()) return productsByCategories;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return Object.keys(productsByCategories).reduce((acc, category) => {
            const filteredProducts = productsByCategories[category].filter((product) =>
                product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                category.toLowerCase().includes(lowerCaseSearchTerm)
            );
            if (filteredProducts.length > 0) {
                acc[category] = filteredProducts;
            }
            return acc;
        }, {} as typeof productsByCategories);
    }, [productsByCategories, searchTerm]);
};
