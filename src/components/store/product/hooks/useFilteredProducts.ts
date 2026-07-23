/**
 * @fileoverview Hook that filters a store's categorized product map by a
 * search term.
 *
 * Exports useFilteredProducts, which memoizes the products-by-category map in
 * the given category order and, when a search term is present, keeps only
 * categories whose name or product names match the lowercased term.
 */
import { useMemo } from 'react';
import { ProductData } from '@/lib/actions/product';

export const useFilteredProducts = (
    productsByCategories: { [key: string]: ProductData[] },
    categoriesOrder: string[],
    searchTerm: string
) => {
    return useMemo(() => {
        if (!searchTerm.trim()) {
            // Return categories in the specified order
            const orderedResult = {} as typeof productsByCategories;
            categoriesOrder.forEach(category => {
                if (productsByCategories[category]) {
                    orderedResult[category] = productsByCategories[category];
                }
            });
            return orderedResult;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return categoriesOrder.reduce((acc, category) => {
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
