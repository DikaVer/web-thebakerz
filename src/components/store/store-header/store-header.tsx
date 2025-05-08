"use client";

import React, {useEffect, useState, useRef} from "react";
import {useStore} from "@/components/providers/store-provider";
import {Link, Avatar, Spacer, Divider, Button, useDisclosure, cn, Switch, ButtonGroup, Spinner, Badge} from "@heroui/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {DeliverySubheader} from "@/components/store/store-header/delivery-subheader";
import {useMediaQuery} from "usehooks-ts";
import {useSession} from "@/components/providers/session-provider";
import StoreDescription from "@/components/store/store-header/description/store-description";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import { useDelivery } from "@/components/providers/delivery-provider";
import Image from "next/image";
import ImageForm from "@/components/image/image-form";
import { updateStoreBackground } from "@/lib/actions/store";

interface StoreHeaderProps {

}

export function StoreHeader( {  }: StoreHeaderProps) {
    const { store } = useStore();
    const { session } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const isSmall = useMediaQuery("(max-width: 960px)");
    const t = useTranslations("app/(store)/components/store-header");
    const router = useRouter();
    const [file, setFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);
    const [backgroundUrl, setBackgroundUrl] = useState<string | undefined>(store.background || undefined);
    
    // Check if user is a baker and owns this store
    const isOwner = session?.user?.role === "bakerz" && session.user.id === store.user_id;
    
    // Determine if clicking on the header should trigger the cursor pointer style
    const showCursorPointer = session?.user?.role === "bakerz";

    const handleUploadBackground = async () => {
        if (!file || !isOwner) return;
        
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("container", "background");
            
            const response = await fetch(`/api/upload-image`, {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error("Failed to upload image");
            }
            
            const data = await response.json();
            
            if (data.url) {
                // Update the store background in the database
                await updateStoreBackground(store.id, data.url);
                
                setBackgroundUrl(data.url);
                // Force refresh to update the store data
                router.refresh();
            }
        } catch (error) {
            console.error("Error uploading background:", error);
        } finally {
            setIsUploading(false);
            setFile(undefined);
        }
    };
    
    // When file is selected, trigger upload
    useEffect(() => {
        if (file) {
            handleUploadBackground();
        }
    }, [file]);

    return (
        <div className="w-full max-w-screen-xl mx-auto flex flex-col">
            <div className="relative w-full h-[200px] rounded-lg overflow-hidden mb-4">
                <Image 
                    src={backgroundUrl || "/search/store_front_clean.webp"} 
                    alt={store.storeName || "Store"} 
                    fill
                    priority
                    className="object-cover"
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
                                        onUpload={() => {}}
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
                        <div className="flex flex-col justify-center gap-5 w-full">
                            <div className="flex items-center justify-between gap-x-2 w-full">
                                <div className="flex items-center gap-x-2">
                                    {store?.instagram_url && (
                                        <Link key="Instagram" isExternal className="text-white h-6"
                                            href={store.instagram_url}>
                                                        <span className="sr-only">{t("instagram")}</span>
                                                        <Icon 
                                                            icon="line-md:instagram" 
                                                            width={22} 
                                                            className="w-6" 
                                                        />
                                                    </Link>
                                                )}
                                                {store?.facebook_url && (
                                                    <Link key="Facebook" isExternal className="text-white h-6"
                                                        href={store.facebook_url}>
                                                        <span className="sr-only">{t("facebook")}</span>
                                                        <Icon 
                                                            icon="line-md:facebook" 
                                                            width={22} 
                                                            className="w-6" 
                                                        />
                                                    </Link>
                                    )}  
                                </div>
                                <Button 
                                    isIconOnly
                                    variant="light"
                                    className="text-white h-6 min-w-6 p-0"
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
                                        width={22} 
                                        className="w-6" 
                                    />
                                </Button>
                            </div>
                            {store?.ownerName && (
                                <div className="flex items-center gap-x-3">
                                    <p className={`text-4xl whitespace-pre-wrap font-medium text-white ${pacifico.className}`}>
                                        {store.ownerName}
                                    </p>
                                </div>
                            )}
                            {store?.slug && (
                                <p className="text-xs md:text-sm whitespace-pre-wrap font-light text-white/90">
                                    {store.slug}
                                </p>
                            )}
                            <Button
                                variant="light"
                                className="text-white aspect-square w-9 h-9 min-w-0 p-0 bg-white/70 text-foreground"
                                onPress={onOpen}
                            >
                                <Icon 
                                    icon="solar:info-circle-linear" 
                                    width={24} 
                                />
                            </Button>
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