/**
 * @fileoverview Product name, price, and description block for the customer
 * product view.
 *
 * Exports the ProductInfo client component, which shows the formatted price
 * (with strikethrough original price and discount badge in rescue-deal mode),
 * name, description, and an animated favorite/like button backed by the
 * favorites provider and gated by sign-in. Also defines the internal
 * AnimatedHeart and AnimatedNumber helper components.
 */
'use client';
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "@/components/providers/session-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSignInModal } from "@/components/ui/modal-signin";
import { RescueDealProduct } from "@/lib/actions/rescue-deal";

// Add AnimatedHeart component
const AnimatedHeart = ({ isFavorite }: { isFavorite: boolean }) => {
    return (
        <Icon 
            icon="solar:heart-bold" 
            width={20} 
            className={`transition-all duration-300 transform ${
                isFavorite 
                    ? "text-danger-500 scale-110" 
                    : "text-white scale-100"
            }`} 
        />
    );
};

// Add AnimatedNumber component
const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== displayValue) {
            setIsAnimating(true);
            const startValue = displayValue;
            const endValue = value;
            const duration = 500; // Animation duration in ms
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuad = (t: number) => t * (2 - t);
                const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuad(progress));

                setDisplayValue(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value]);

    return (
        <span className={`transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {displayValue}
        </span>
    );
};

interface ProductInfoProps {
    id: string;
    name: string;
    price: number;
    description: string;
    storeId: string;
    totalLikes: number;
    image: string;
    rescueDealInfo?: RescueDealProduct | null;  
    isRescueDeal?: boolean;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
    id,
    name,
    price,
    description,
    storeId,
    totalLikes,
    image,
    rescueDealInfo,
    isRescueDeal
}) => {
    const { session } = useSession();
    const { isProductFavorite, addProductToFavorites, removeProductFromFavorites } = useFavorites();
    const { openModal, ModalSign } = useSignInModal();
    
    const [isFavorite, setIsFavorite] = useState(isProductFavorite(storeId, id));
    const [likeCount, setLikeCount] = useState(isFavorite ? totalLikes + 1 : totalLikes);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleFavoriteToggle = async () => {
        if(!session?.user) {
            openModal();
            return;
        }

        setIsAnimating(true);
        if (isFavorite) {
            setIsFavorite(false);
            setLikeCount((prev: number) => prev - 1);
            await removeProductFromFavorites(storeId, id);
        } else {
            setIsFavorite(true);
            setLikeCount((prev: number) => prev + 1);
            await addProductToFavorites(storeId, id, name, image);
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="flex flex-col gap-2 relative">
            <ModalSign message={"And you add this product to your favorites"} />
            <Button
                aria-label="Favorite"
                radius="full"
                variant="light"
                color="secondary"
                size="sm"
                className={`absolute top-2 right-2 z-30 bg-black/20 font-bold text-lg text-white transition-all duration-300 ${
                    isAnimating ? 'scale-105' : 'scale-100'
                }`}
                onPress={() => handleFavoriteToggle()}
            >
                {likeCount > 0 && (  
                    <AnimatedNumber value={likeCount} />
                )}
                <AnimatedHeart isFavorite={isFavorite} />
            </Button>
            <div className="flex justify-between items-center w-full relative">
                <div className="flex flex-row items-start w-full gap-3">
                    {(rescueDealInfo && isRescueDeal) && (
                        <div className="relative">
                            <p className="text-lg text-default-600 font-medium">
                                {formatCurrency(price)}
                            </p>
                            {/* Custom line-through that's more prominent */}
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full h-0.5 bg-danger-500 transform rotate-12"></div>
                            </div>
                        </div>
                    )}
                    <p className={`font-semibold text-2xl`}>
                        {(rescueDealInfo && isRescueDeal) ? 
                            formatCurrency(price * (1 - rescueDealInfo.promotionPercent / 100)) :
                            formatCurrency(price)
                        }
                    </p>
                    {/* Rescue Deal Badge */}
                    {(rescueDealInfo && isRescueDeal) && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-danger-500 text-white text-xs font-bold shadow-lg">
                            <Icon icon="solar:fire-bold" width={14} />
                            <span>{rescueDealInfo.promotionPercent}% OFF</span>
                        </div>
                    )}
                </div>
            </div>
            <p className={`text-base font-medium`}>
                {name}
            </p>
            <p className={'font-light text-sm whitespace-pre-wrap'}>{description}</p>
        </div>
    );
}; 