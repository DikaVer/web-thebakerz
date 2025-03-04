'use client';
import React, {useState} from 'react';
import { Spacer, Divider } from '@heroui/react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    SliderDotButton,
} from '@/components/ui/carousel';
import { ProductBase } from '@/components/store/product/product';
import { ProductData } from '@/lib/actions/product';
import GradientText from "@/components/ui/gradient-text";

interface CategoryProductsProps {
    category: string;
    products: ProductData[];
    setCategoryRef: (category: string, el: HTMLDivElement | null) => void;
}

export const CategoryProducts: React.FC<CategoryProductsProps> = ({
                                                                      category,
                                                                      products,
                                                                      setCategoryRef,
                                                                  }) => {

    return (
        <div ref={(el) => setCategoryRef(category, el)}>
            <Spacer y={8}/>
            <div className={'flex flex-row items-start justify-start w-full'}>
                <GradientText
                    colors={["#a2119d", "#730C6F", "#a2119d", "#730C6F", "#a2119d"]}
                    animationSpeed={10}
                    showBorder={false}
                    className="text-xl desktop:text-2xl font-bold items-start"
                >
                    {category}
                </GradientText>
            </div>
            <Spacer y={4}/>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center items-center w-full">

                    {products.map((product) => (
                            <div key={product.constId} className={'m-0.5'}>
                                <ProductBase productData={product} />
                            </div>
                    ))}
            </div>
            <Spacer y={8}/>
            <Divider/>
        </div>
    )
};
