'use client';
import React from 'react';
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

interface CategoryProductsProps {
    category: string;
    products: ProductData[];
    setCategoryRef: (category: string, el: HTMLDivElement | null) => void;
}

export const CategoryProducts: React.FC<CategoryProductsProps> = ({
                                                                      category,
                                                                      products,
                                                                      setCategoryRef,
                                                                  }) => (
    <div ref={(el) => setCategoryRef(category, el)}>
        <Spacer y={8} />
        <span className="text-xl desktop:text-2xl font-bold">{category}</span>
        <Spacer y={4} />
        {/*<Carousel opts={{ align: "start" }} className="w-full">*/}
        {/*    <CarouselContent>*/}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center items-center w-full">
            {products.map((product) => (
                // <CarouselItem key={product.id} className="sm:basis-1/2 lg:basis-1/3">
                <div key={product.id} className={'m-0.5'}>
                    <ProductBase productData={product}/>
                </div>
                // </CarouselItem>
            ))}
        </div>
        {/*    </CarouselContent>*/}
        {/*    <CarouselPrevious />*/}
        {/*    <CarouselNext />*/}
        {/*    <Spacer y={4} />*/}
        {/*    <div className="flex justify-center">*/}
        {/*        <SliderDotButton />*/}
        {/*    </div>*/}
        {/*</Carousel>*/}
        <Spacer y={8} />
        <Divider />
    </div>
);
