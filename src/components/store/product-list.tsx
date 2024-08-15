'use client';

import React, { useState } from "react";
import { Product } from "@/components/store/product";
import { ProductByCategory } from "@/lib/definitions";
import {Search} from "lucide-react";

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
            <div className="flex flex-row w-full justify-center">
                <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>
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