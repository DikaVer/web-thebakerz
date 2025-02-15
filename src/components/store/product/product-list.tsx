'use client';

import React, {
    useState,
    useMemo,
    useRef,
    useEffect,
    ChangeEvent,
} from "react";

import { ProductBase } from "@/components/store/product/product";
import {ProductData, ProductDataFull} from "@/lib/actions/product";
import { Input, Spacer, Tab, Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { EmblaOptionsType } from "embla-carousel";
import Carousel, {
    Slider,
    SliderContainer,
    SliderDotButton,
} from "@/components/store/product/carousel/carousel";
import { useStore } from "@/components/providers/store-provider";
import { useMediaQuery } from "usehooks-ts";
import {useProductDialog} from "@/components/providers/product-provider";

interface ProductListBaseProps<P> {
    productsData: ProductDataFull;
    productsByCategories: { [key: string]: ProductData[] };
}

export const ProductListBase = <P,>({
                                        productsByCategories,
                                        productsData,
                                    }: ProductListBaseProps<P>) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const OPTIONS: EmblaOptionsType = { loop: false };
    const { isSticky } = useStore();
    const [scroll, setScroll] = useState(window.scrollY);
    const isSmall = useMediaQuery("(max-width: 768px)");
    const [isVisible, setVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState("");
    const { setProductsDataLocal } = useProductDialog();

    useEffect(() => {
        if (productsData) {
            setProductsDataLocal(productsData);
        }
    }, [productsData, setProductsDataLocal]);

    useEffect(() => {
        const onScroll = () => {
            setVisible(window.scrollY < scroll || !isSmall || !isSticky);
            setScroll(window.scrollY);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [scroll, isSmall, isSticky]);



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

    useEffect(() => {
        const headerOffset = isSmall ? 270 : 300; // adjust this value as needed.
        const observer = new IntersectionObserver(
            (entries) => {
                // Filter for entries that are intersecting.
                const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    // Sort by distance from top.
                    const sorted = visibleEntries.sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top
                    );
                    const topEntry = sorted[0];
                    const category = Object.keys(categoryRefs.current).find(
                        (key) => categoryRefs.current[key] === topEntry.target
                    );
                    if (category) {
                        setSelectedTab(category);
                    }
                }
            },
            {
                threshold: 1,
                rootMargin: `-${headerOffset}px 0px 0px 0px`,
            }
        );
        // Observe each category element.
        Object.values(categoryRefs.current).forEach((el) => {
            if (el) {observer.observe(el);
                }
        });
        return () => observer.disconnect();
    }, [filteredProductsByCategories, selectedTab]);

    // Use a persistent ref object to store category DOM elements.
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollToCategory = (category: string) => {
        const element = categoryRefs.current[category];
        if (element) {
            // headerOffset: scroll a bit above the element.
            const headerOffset = isSmall ? 280 : 320; // adjust this value as needed.
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            setSelectedTab(category);
        }
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const renderSearchInput = () => (
        <div className="flex flex-row w-full md:w-1/3 justify-center">
            <Input
                className="w-full"
                classNames={{
                    mainWrapper: "rounded-xl border-1",
                    inputWrapper: "bg-background",
                }}
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                type="text"
                startContent={
                    <Icon
                        icon="solar:magnifer-broken"
                        width={24}
                        className="text-default-400"
                    />
                }
            />
        </div>
    );


    const renderCategoryTabs = (category: string) => (
        <Tab
            key={category}
            title={category}
            // href={`#${category}`}
        />
    );

    // Use a callback ref to assign each category element to our ref object.
    const renderCategoryProducts = (category: string, products: ProductData[]) => (
        <div
            key={category}
            ref={(el) => {
                categoryRefs.current[category] = el;
            }}
        >
            <Spacer y={8} />
            <span className="text-xl desktop:text-2xl font-bold">{category}</span>
            <Spacer y={4}/>
            <Carousel options={OPTIONS} activeSlider>
                <SliderContainer>
                    {products.map((product) => (
                        <Slider key={product.id} className="embla__slide px-2">
                            <ProductBase productData={product} />
                        </Slider>
                    ))}
                </SliderContainer>
                <div className="flex justify-center py-2">
                    <SliderDotButton />
                </div>
            </Carousel>
        </div>
    );

    return (
        <div className="flex w-full flex-col">
            <Spacer y={8} />
            <div
                className={`flex flex-col-reverse md:flex-row transition-all justify-between items-center w-full ${
                    isSticky &&
                    `sticky ${isVisible ? "top-16" : "top-4 pt-3 rounded-3xl"} z-50 p-4 bg-background rounded-b-3xl shadow-medium`
                }`}
            >
                <Tabs
                    key="underlined_tabs"
                    aria-label="Tabs Category Navigation"
                    variant="underlined"
                    className="mx-0 px-0 w-full md:w-2/3"
                    onSelectionChange={(index) => {
                            scrollToCategory(index.toString());
                        }}
                    selectedKey={selectedTab}

                >
                    <Tab
                        key={"Profile"}
                        className={'hidden'}
                    >
                    </Tab>
                    {Object.keys(filteredProductsByCategories).map((category) =>
                        renderCategoryTabs(category)
                    )}
                </Tabs>
                <Spacer y={2} />
                {renderSearchInput()}
            </div>
            <Spacer y={8} />
            {Object.keys(filteredProductsByCategories).map((category) =>
                renderCategoryProducts(
                    category,
                    filteredProductsByCategories[category]
                )
            )}
        </div>
    );
};
