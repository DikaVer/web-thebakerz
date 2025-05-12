'use client';
import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSession } from "@/components/providers/session-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSignInModal } from "@/components/ui/modal-signin";

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
    name: string;
    price: number;
    description: string;
    constId: string;
    storeId: string;
    totalLikes: number;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
    name,
    price,
    description,
    constId,
    storeId,
    totalLikes
}) => {
    const { session } = useSession();
    const { isProductFavorite, addProductToFavorites, removeProductFromFavorites } = useFavorites();
    const { openModal } = useSignInModal();
    
    const [isFavorite, setIsFavorite] = useState(isProductFavorite(storeId, constId));
    const [likeCount, setLikeCount] = useState(totalLikes);
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
            await removeProductFromFavorites(storeId, constId);
        } else {
            setIsFavorite(true);
            setLikeCount((prev: number) => prev + 1);
            await addProductToFavorites(storeId, constId);
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="flex flex-col gap-2 relative">
            <Button
                radius="full"
                variant="light"
                color="secondary"
                size="sm"
                className={`absolute top-2 right-2 z-30 bg-black/60 font-bold text-lg text-white transition-all duration-300 ${
                    isAnimating ? 'scale-105' : 'scale-100'
                }`}
                onPress={() => handleFavoriteToggle()}
            >
                {likeCount > 0 && (  
                    <AnimatedNumber value={likeCount} />
                )}
                <AnimatedHeart isFavorite={isFavorite} />
            </Button>
            <div className="flex justify-between items-center w-full">
                <p className={`font-semibold text-2xl`}>
                    {formatCurrency(price)}
                </p>
            </div>
            <p className={`text-base font-medium`}>
                {name}
            </p>
            <p className={'font-light text-sm whitespace-pre-wrap'}>{description}</p>
        </div>
    );
}; 