/**
 * @fileoverview Image gallery for the customer product view.
 *
 * Exports the ProductImageGallery client component, which shows the main
 * product image and, when additional images exist, a row of clickable
 * thumbnails that swap the displayed image, with responsive sizing for small
 * screens.
 */
'use client';
import React, { useState } from "react";
import { Image, Card, cn } from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";

interface ProductImageGalleryProps {
    mainImage: string | null | undefined;
    additionalImages?: string[];
    productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    mainImage: initialMainImageInput,
    additionalImages = [],
    productName
}) => {
    const initialMainImage = initialMainImageInput || '';
    const [mainImage, setMainImage] = useState(initialMainImage);
    const isSmall = useMediaQuery("(max-width: 432px)");

    // Function to handle image swapping
    const handleImageSwap = (image: string) => {
        setMainImage(image);
    };

    return (
        <>
            <div className={cn('w-full md:w-[258px] aspect-square',
                isSmall ? "max-w-full" : "max-w-[400px]"
            )}>
                <Card shadow="none"
                    isFooterBlurred
                    className={cn(`flex w-full justify-start items-start shadow-none rounded-none ml-4`,
                        isSmall ? "ml-0" : "ml-4"
                    )}
                >
                    <Image
                        removeWrapper
                        alt={productName}
                        radius={'none'}
                        className={cn("w-full",
                            isSmall ? "rounded-none border-none" : "rounded-xl"
                        )}
                        src={mainImage}
                    />
                </Card>
            </div>
            {(additionalImages.length > 0) && (
                <div className="flex flex-row gap-2 mt-2 justify-start w-full px-4">
                    <div
                        className={cn(
                            "relative flex justify-center items-center w-20 h-20 opacity-50 cursor-pointer border-1",
                            "rounded-lg",
                            mainImage === initialMainImage && 'opacity-100'
                        )}
                        onClick={() => setMainImage(initialMainImage)}
                    >
                        <Image
                            removeWrapper
                            alt="Main product image"
                            className={cn("object-cover w-full h-full", "rounded-lg")}
                            src={initialMainImage}
                        />
                    </div>
                    {additionalImages.map((img, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative flex justify-center items-center w-20 h-20 opacity-50 cursor-pointer border-1",
                                "rounded-lg",
                                mainImage === img && 'opacity-100'
                            )}
                            onClick={() => handleImageSwap(img)}
                        >
                            <Image
                                removeWrapper
                                alt={`Additional image ${index + 1}`}
                                className={cn("object-cover w-full h-full ", "rounded-lg")}
                                src={img}
                            />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}; 