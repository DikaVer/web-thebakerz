'use client';
import React, {useRef, useEffect, useState} from 'react';
import { Spacer, Divider } from '@heroui/react';
import { ProductBase } from '@/components/store/product/product';
import { ProductData } from '@/lib/actions/product';
import GradientText from "@/components/ui/gradient-text";
import { useStore } from '@/components/providers/store-provider';
import { useSession } from '@/components/providers/session-provider';
import { useTranslations } from "next-intl";
import { useDelivery } from '@/components/providers/delivery-provider';
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

    const constIds: Record<string, boolean> = {};
    const topRef = useRef<HTMLDivElement>(null);
    const { store } = useStore();
    const { session } = useSession();
    const { isDelivery, validationResult } = useDelivery();
    
    // Use the top element as the category reference
    useEffect(() => {
        if (topRef.current) {
            setCategoryRef(category, topRef.current);
        }
    }, [category, setCategoryRef]);

    return (
        <div>
            {/* Top observer target element */}
            <div 
                ref={topRef}
                className="category-observer-target top"
                style={{ height: '2px', marginTop: '-2px' }}
                data-category-position="top"
            />
            <Spacer y={8}/>
            <div className={'flex flex-row items-start justify-start w-full'}>
                <GradientText
                    colors={["#a2119d", "#730C6F", "#a2119d", "#730C6F", "#a2119d"]}
                    animationSpeed={10}
                    showBorder={false}
                    className="text-xl desktop:text-2xl cursor-default font-bold items-start"
                >
                    {category}
                </GradientText>
            </div>
            <Spacer y={4}/>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center items-center w-full">
                {products.map((product) => {
                    if (constIds[product.id]) {
                        return null;
                    }
                    constIds[product.id] = true;

                    return (
                        <div key={product.id} className={`m-1 ${(store?.user_id === session?.user?.id && product.hide_product) ? "opacity-50" : (product.hide_product || (isDelivery && validationResult.deliveryRegion?.isPostDelivery && validationResult.deliveryRegion?.isPostDelivery !== product.isPostDelivery) && store?.user_id !== session?.user?.id) && "hidden"}`}>
                            <ProductBase productData={product}/>
                        </div>
                    );
                })}
            </div>
            <Spacer y={8}/>
            <Divider/>
            {/* Bottom observer target element */}
            <div 
                className="category-observer-target bottom"
                style={{ height: '2px', marginBottom: '-2px' }}
                data-category-position="bottom"
                data-category={category}
            />
        </div>
    )
};
