'use client';

import React, { useState } from "react";
import { Product } from "@/components/store/product";
import { ProductByCategory } from "@/lib/definitions";
import { Search } from "lucide-react";

export function ProductList({ productsByCategories }: { productsByCategories: ProductByCategory }) {
    const [searchTerm, setSearchTerm] = useState("");

    // Helper function to filter products based on the search term
    const filterProductsByCategory = (productsByCategories: ProductByCategory, searchTerm: string) => {
        return Object.keys(productsByCategories).reduce((acc, category) => {
            const filteredProducts = productsByCategories[category].filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredProducts.length > 0) {
                acc[category] = filteredProducts;
            }
            return acc;
        }, {} as ProductByCategory);
    };

    const filteredProductsByCategories = filterProductsByCategory(productsByCategories, searchTerm);

    // Render search input component
    const renderSearchInput = () => (
        <div className="flex flex-row w-full justify-center">
            <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
        </div>
    );

    // Render category and product list
    const renderCategoryProducts = (category: string, products: ProductByCategory[string]) => (
        <div className="mt-4" key={category}>
            <span className="text-xl font-bold">{category}</span>
            <ul className="grid gap-4 grid-cols-1 store-sm:grid-cols-2 py-3">
                {products.map(product => (
                    <Product
                        key={product.product_id}
                        name={product.name}
                        description={product.description}
                        rating="4.5" // Assuming rating is a static value for now
                        price={`$${product.price}`}
                        image={product.image_url}
                        productId={product.product_id}
                    />
                ))}
            </ul>
        </div>
    );

    return (
        <div className="my-6">
            {renderSearchInput()}
            {Object.keys(filteredProductsByCategories).map(category =>
                renderCategoryProducts(category, filteredProductsByCategories[category])
            )}
        </div>
    );
}
