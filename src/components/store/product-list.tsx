'use client';

import React, { useState } from "react";
import { Product } from "@/components/store/product";
import { ProductByCategory } from "@/lib/definitions";

export function ProductList({ productsByCategories }: { productsByCategories: ProductByCategory }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProductsByCategories = Object.keys(productsByCategories).reduce((acc, category) => {
        const filteredProducts = productsByCategories[category].filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredProducts.length > 0) {
            acc[category] = filteredProducts;
        }
        return acc;
    }, {} as ProductByCategory);

    return (
        <div className={"my-6"}>
            <input
                type="text"
                placeholder="Search by name or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 p-2 border rounded"
            />
            {Object.keys(filteredProductsByCategories).map(category => (
                <div className={"mt-4"} key={category}>
                    <span className={"text-xl font-bold"}>{category}</span>
                    <ul className={"py-3 grid gap-4 grid-cols-1 store-sm:grid-cols-2"}>
                        {filteredProductsByCategories[category].map(product => (
                            <Product
                                key={product.product_id}
                                name={product.name}
                                description={product.description}
                                rating="4.5" // Assuming rating is a static value for now
                                price={`$${product.price}`}
                                image={product.image_url}
                            />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}