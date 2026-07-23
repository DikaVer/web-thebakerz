/**
 * @fileoverview Loading skeleton for a store's product list page.
 *
 * Exports ProductListSkeleton, which mimics the product list layout with
 * react-loading-skeleton placeholders: a sticky bar of category tabs and a
 * search input, followed by three category sections each containing a title
 * row and an eight-item product grid.
 */
'use client';

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Spacer, Divider } from "@heroui/react";

export const ProductListSkeleton: React.FC = () => {
    return (
        <div className="flex w-full flex-col">
            {/* Search and tabs skeleton */}
            <div className="flex flex-col-reverse md:flex-row justify-between items-center w-full sticky top-16 z-50 p-4 bg-background rounded-b-3xl shadow-sm">
                {/* Tabs skeleton with multiple tab indicators */}
                <div className="mx-0 px-0 w-full md:w-2/3">
                    <div className="flex space-x-4">
                        <Skeleton height={40} width={80} />
                        <Skeleton height={40} width={100} />
                        <Skeleton height={40} width={90} />
                        <Skeleton height={40} width={120} />
                    </div>
                </div>
                <Spacer y={2} />
                {/* Search skeleton with icon */}
                <div className="flex flex-row w-full md:w-1/3 justify-center">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-3">
                            <Skeleton circle height={20} width={20} />
                        </div>
                        <Skeleton height={40} width="100%" borderRadius={12} />
                    </div>
                </div>
            </div>
            <Spacer y={8} />

            {/* Categories with products */}
            {[1, 2, 3].map((category) => (
                <div key={category}>
                    <Spacer y={8} />
                    {/* Category title and view more */}
                    <div className="flex flex-row items-center justify-between w-full">
                        <Skeleton height={32} width={180} />
                        <Skeleton height={24} width={100} />
                    </div>
                    <Spacer y={4} />
                    {/* Products grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-center items-center w-full">
                        {Array(8).fill(0).map((_, idx) => (
                            <div key={idx} className="m-0.5">
                                <div className="cursor-pointer max-w-smrounded-2xl overflow-hidden shadow-sm">
                                        <div className="w-full aspect-square">
                                            <Skeleton height="100%" className="rounded-xl object-cover w-full" />
                                        </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Spacer y={8} />
                    <Divider />
                </div>
            ))}
        </div>
    );
};