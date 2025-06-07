"use client";

import React, {useEffect, useState} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Divider, Button, useDisclosure, Spinner, Badge, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {DeliverySubheader} from "@/components/store/store-header/delivery-subheader";
import {useSession} from "@/components/providers/session-provider";
import StoreDescription from "@/components/store/store-header/description/store-description";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import Image from "next/image";
import ImageForm from "@/components/image/image-form";
import { updateStoreBackground } from "@/lib/actions/store-actions";
import { ImageUploader } from "@/components/image/image-upload";
import { ImageSchema } from "@/lib/utils/schemas";
import showErrorMessage from "@/components/toast/toast-error";
import { useSignInModal } from "@/components/ui/modal-signin";
import { useFavorites } from "@/components/providers/favorites-provider";
import { ReportStoreModal } from "./report-store-modal";
import clarity from "@microsoft/clarity";

interface StoreHeaderProps {

}

const AnimatedHeart = ({ isFavorite }: { isFavorite: boolean }) => {
    return (
        <Icon 
            icon="solar:heart-bold" 
            width={24} 
            className={`transition-all duration-300 transform ${
                isFavorite 
                    ? "text-danger-500 scale-110" 
                    : "text-foreground scale-100"
            }`} 
        />
    );
};

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

export function StoreHeader( {  }: StoreHeaderProps) {
    const { store } = useStore();
    const { session } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const { isOpen: isBackgroundUpload, onOpen: onBackgroundUpload, onOpenChange: onBackgroundChange } = useDisclosure();
    const { isOpen: isReportOpen, onOpen: onReportOpen, onOpenChange: onReportChange } = useDisclosure();
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);
    const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(store.background || undefined);
    const { openModal, ModalSign } = useSignInModal();
    const { isStoreFavorite, addStoreToFavorites, removeStoreFromFavorites } = useFavorites();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isFavorite, setIsFavorite] = useState(isStoreFavorite(store.id));
    const [likeCount, setLikeCount] = useState(isStoreFavorite(store.id) ? store.totalLikes + 1 : store.totalLikes);

    useEffect(() => {
        clarity.setTag("store_id", store.id);
        clarity.setTag("store_name", store.storeName || "");
        clarity.setTag("store_owner", store.ownerName || "");
    }, [store.id]);

    // Check if user is a baker and owns this store
    const isOwner = session?.user?.role === "bakerz" && session.user.id === store.user_id;

    const handleUploadBackground = async (file: File) => {
        if (!isOwner) return;
        
        setIsUploading(true);
        
        try {
            // Validate the file
            const validateFile = ImageSchema.safeParse(file);
            if (!validateFile.success) {
                showErrorMessage({ error: validateFile.error.errors[0].message });
                return;
            }

            // Update the store background in the database
            await updateStoreBackground(store.id, file);

            // Force refresh to update the store data
            router.refresh();     
        } catch (error) {
            console.error("Error uploading background:", error);
            showErrorMessage({ error: t("failedToUploadImage") });
        } finally {
            setIsUploading(false);
            setFile(undefined);
        }
    };
    
    const handleFavoriteToggle = async () => {
        if(!session?.user) {
            openModal();
            return;
        }

        setIsAnimating(true);
        if (isFavorite) {
            setIsFavorite(false);
            setLikeCount((prev: number) => prev - 1);
            await removeStoreFromFavorites(store.id);
        } else {
            setIsFavorite(true);
            setLikeCount((prev: number) => prev + 1);
            await addStoreToFavorites(store.id, store.ownerName || "Undefined", store.background || "/search/store_front_clean.webp");
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* Sign-in modal */}
            <ModalSign 
                message="And you can access social media profiles and like the store and their products"
            />
            <ReportStoreModal 
                isOpen={isReportOpen}
                onOpenChange={onReportChange}
                storeName={store.storeName || ""}
            />
            <ImageUploader
                type={"background"}
                file={file}
                isOpen={isBackgroundUpload}
                onClose={onBackgroundChange}
                container={"background"}
                setImageURL={(file, url) => {
                    setBackgroundUrl(url);
                    handleUploadBackground(file);
                }}
            />
            <div className="relative w-full  h-[400px] max-h-[400px] rounded-lg overflow-hidden mb-4">
                <Image 
                    src={backgroundUrl || "/search/store_front_clean.webp"} 
                    alt={store.storeName || "Store"} 
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover w-full"
                />
                
                {isOwner && (
                    <div className="absolute bottom-4 right-4">
                        <Badge
                            showOutline
                            classNames={{
                                badge: "w-5 h-5",
                            }}
                            content={
                                isUploading ? (
                                    <Spinner size="sm" color="primary" />
                                ) : (
                                    <ImageForm
                                        setFile={setFile}
                                        onUpload={onBackgroundUpload}
                                    />
                                )
                            }
                            placement="bottom-right"
                            shape="circle"
                        >
                            <div className="h-10 w-10 rounded-full flex items-center justify-center"/>
                        </Badge>
                    </div>
                )}
                <div className="absolute top-0 left-0 right-0 flex justify-between items- h-full p-4 bg-gradient-to-r from-black/80 to-black/20">
                    <div className="flex items-start gap-x-4 w-full">
                        <div className="flex flex-col justify-center gap-8 w-full">
                            <div className="flex items-center justify-between gap-x-2 w-full">
                                <div className="flex items-center gap-x-2">
                                    {store?.instagram_url && (
                                        <Link key="Instagram" isExternal className="text-white h-6"
                                            href="#"
                                            onClick={(e) => {
                                                if (!session?.user) {
                                                    e.preventDefault();
                                                    openModal();
                                                } else {
                                                    window.open(store.instagram_url, '_blank', 'noopener,noreferrer');
                                                }
                                            }}>
                                            <span className="sr-only">{t("instagram")}</span>
                                            <Icon 
                                                icon="line-md:instagram" 
                                                width={64} 
                                                className="w-10" 
                                            />
                                        </Link>
                                    )}
                                    {store?.facebook_url && (
                                        <Link key="Facebook" isExternal className="text-white h-6"
                                            href="#"
                                            onClick={(e) => {
                                                if (!session?.user) {
                                                    e.preventDefault();
                                                    openModal();
                                                } else {
                                                    window.open(store.facebook_url, '_blank', 'noopener,noreferrer');
                                                }
                                            }}>
                                            <span className="sr-only">{t("facebook")}</span>
                                            <Icon 
                                                icon="line-md:facebook" 
                                                width={64} 
                                                className="w-10" 
                                            />
                                        </Link>
                                    )}  
                                </div>
                                <Button 
                                    aria-label="Share"
                                    isIconOnly
                                    variant="light"
                                    className="text-white h-10 min-w-10 p-0"
                                    onPress={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: store.storeName || "Check out this store",
                                                text: `Check out ${store.storeName || "this store"} on TheBakerz!`,
                                                url: window.location.href
                                            }).catch(err => console.log("Share failed:", err));
                                        } else {
                                            // Fallback for browsers that don't support Web Share API
                                            navigator.clipboard.writeText(window.location.href);
                                        }
                                    }}
                                >
                                    <span className="sr-only">Share</span>
                                    <Icon 
                                        icon="icon-park-outline:share" 
                                        width={64} 
                                        className="w-8" 
                                    />
                                </Button>
                            </div>
                            <Spacer y={10}/>
                            {store?.ownerName && (
                                <div className="flex flex-col justify-start items-start gap-x-3">
                                    <div className="flex items-center gap-x-4">
                                        <p className={`text-5xl whitespace-pre-wrap font-medium text-white ${pacifico.className}`}>
                                            {store.ownerName}
                                        </p>
                
                                    </div>
                                 </div>
                            )}
                            <div className="flex flex-col justify-start items-start gap-2">
                                    {store?.slug && (
                                        <p className="text-xs md:text-sm whitespace-pre-wrap font-light text-white/90">
                                            {store.slug}
                                        </p>
                                    )}
                                    {store.totalLikesProduct > 0 && (
                                        <div className="flex items-end gap-2">
                                            <Icon 
                                                icon="tabler:user-heart" 
                                                className="text-white/90"
                                                width={24} 
                                            />
                                            <p className="text-xs md:text-sm whitespace-pre-wrap font-light text-white/90">
                                                {store.totalLikesProduct} total likes
                                            </p>
                                        </div>
                                    )}
                                <div className="flex items-center gap-2">  
                                    <Button
                                        aria-label="Open description"
                                        variant="light"
                                        className="aspect-square w-12 h-12 min-w-0 p-0 bg-white/70 text-foreground"
                                        onPress={onOpen}
                                    >
                                        <Icon 
                                            icon="solar:info-circle-linear" 
                                            width={36} 
                                        />
                                    </Button>
                                    <Button
                                        aria-label="Like store"
                                        variant="light"
                                        className={`text-3xl font-medium w-fit h-12 min-w-0 p-0 px-2 bg-white/70 text-foreground transition-all duration-300 ${
                                            isAnimating ? 'scale-105' : 'scale-100'
                                        }`}
                                        onPress={handleFavoriteToggle}
                                    >
                                        <div className="flex items-center gap-2">
                                            <AnimatedHeart isFavorite={isFavorite} />
                                            {likeCount > 0 && (
                                                <AnimatedNumber value={likeCount} />
                                            )}
                                        </div>
                                    </Button>
                                </div>
                                <div className="flex w-full justify-end items-center gap-2">
                                    <Button
                                        aria-label="Report store"
                                        variant="light"
                                        className="aspect-square w-12 h-12 min-w-0 p-0 text-white"
                                        onPress={() => {
                                            if (!session?.user) {
                                                openModal();
                                                return;
                                            }
                                            onReportOpen();
                                        }}
                                    >
                                        <Icon 
                                            icon="solar:flag-linear" 
                                            width={36} 
                                        />
                                    </Button>   
                                </div>
                            </div>


                        </div>
                    </div>
                    
                    <StoreDescription isOpen={isOpen} onOpenChange={onOpenChange} />
                </div>
            </div>
            <Divider />
            <DeliverySubheader />
        </div>
    );
}