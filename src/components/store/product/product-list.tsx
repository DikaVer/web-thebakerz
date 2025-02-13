'use client';

import React, { useState, useMemo, ChangeEvent, ReactElement } from "react";
import {ChevronLeft, ChevronRight, Search} from "lucide-react";

import {ProductBase} from "@/components/store/product/product";
import {ProductData} from "@/lib/actions/product";
import {useMediaQuery} from "usehooks-ts";
import {Input, Spacer, Tab, Tabs} from "@heroui/react";
import {Icon} from "@iconify/react";
import {EmblaOptionsType} from "embla-carousel";
import Carousel, {
    Slider,
    SliderContainer, SliderDotButton,
    SliderNextButton,
    SliderPrevButton, SliderProgress, SliderSnapDisplay
} from "@/components/store/product/carousel/carousel";

interface ProductListBaseProps<P> {
    productsData: ProductData[];
    productsByCategories: { [key: string]: ProductData[] };
}

export const ProductListBase = <P,>({
                                        productsByCategories,
                                    }: ProductListBaseProps<P>) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const isMobile = useMediaQuery("(max-width: 560px)");
    const OPTIONS: EmblaOptionsType = { loop: false };

    const filteredProductsByCategories = useMemo(() => {
        if (!searchTerm.trim()) return productsByCategories;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return Object.keys(productsByCategories).reduce((acc, category) => {
            const filteredProducts = productsByCategories[category].filter(
                (product) =>
                    product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    category.toLowerCase().includes(lowerCaseSearchTerm)
            );
            if (filteredProducts.length > 0) {
                acc[category] = filteredProducts;
            }
            return acc;
        }, {} as typeof productsByCategories);
    }, [productsByCategories, searchTerm]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const renderSearchInput = () => (
        <div className="flex flex-row w-full justify-center">
            {/*<div className={`flex bg-outline flex-row items-center w-full ${isMobile ? "max-w-[440px]" : "max-w-2xl"} shadow-md px-3 rounded-xl hover:bg-outline-foreground`}>*/}
            {/*    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />*/}
            {/*    <input*/}
            {/*        type="text"*/}
            {/*        placeholder="Search by product name or category..."*/}
            {/*        value={searchTerm}*/}
            {/*        onChange={handleSearchChange}*/}
            {/*        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"*/}
            {/*    />*/}
                <Input
                    className={`w-full `}
                    classNames={{
                        mainWrapper: "rounded-xl shadow",
                        inputWrapper: `bg-background"}`
                    }}
                    placeholder={"Search by product name or category..."}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    type={"text"}
                    startContent={<Icon
                        icon={"solar:magnifer-broken"}
                        width={24}
                        className={'text-default-400'}
                    />}
                />
            {/*</div>*/}
        </div>
    );

    const renderCategoryProducts = (category: string, products: ProductData[]) => (
        <div key={category}>
            <Spacer y={4} />
            <span className="text-xl desktop:text-2xl font-bold">{category}</span>
            {/*<ul className={`grid gap-4 ${!isMobile && "grid-cols-2"} py-3`}>*/}
            <Spacer y={4} />
                <Carousel options={OPTIONS} activeSlider >
                    <SliderContainer>

                            {products.map((product) => (
                                <Slider className='embla__slide px-2'>
                                    <ProductBase
                                        productData={product}
                                    />
                                </Slider>
                            ))}

                    </SliderContainer>

                    {/*<SliderPrevButton>*/}
                    {/*    <ChevronLeft />*/}
                    {/*</SliderPrevButton>*/}

                    {/*<SliderNextButton>*/}
                    {/*    <ChevronRight />*/}
                    {/*</SliderNextButton>*/}

                    <div className='flex justify-center py-2'>
                        <SliderDotButton/>
                    </div>

                </Carousel>
            {/*</ul>*/}
        </div>
    );

    const renderCategoryTabs = (category: string) => (
        <Tab key={category} title={category} />
    );

    return (

        <div className={`w-full max-w-2xl`}>
            {renderSearchInput()}
            <Spacer y={4} />
            <Tabs
                key={"underlined_tabs"}
                aria-label="Tabs Category Navigation"
                variant={"underlined"}
                className={'mx-0 px-0 max-w-2xl'}
            >
                {Object.keys(filteredProductsByCategories).map((category) =>
                    renderCategoryTabs(category)
                )}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}
                {/*<Tab key="music" title="Music" />*/}

            </Tabs>
            {Object.keys(filteredProductsByCategories).map((category) =>
                renderCategoryProducts(category, filteredProductsByCategories[category])
            )}
        </div>
    );
};