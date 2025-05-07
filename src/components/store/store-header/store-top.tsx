"use client";

import React, {useState} from "react";
import {Icon} from "@iconify/react";
import {Button, Card, CardBody} from "@heroui/react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {useSession} from "@/components/providers/session-provider";
import {useProductDialog} from "@/components/providers/product-provider";
import {useStore} from "@/components/providers/store-provider";
import {useMediaQuery} from "usehooks-ts";
import StoreTopNext from "@/components/store/store-header/description/store-top-next";
import {useTranslations} from "next-intl";

interface StoreTopProps {}

export function StoreTop() {
    const { session} = useSession();
    const { store} = useStore();
    const { handleAddItem } = useProductDialog();
    const isSmall = useMediaQuery("(max-width: 960px)");
    const t = useTranslations("app/(store)/components/store-top");
    const [isAddLoading, setIsAddLoading] = useState(false);

    // Check if the current session user is a bakerz and owns this store
    const isOwner = session?.user?.role === "bakerz" &&
                session?.user?.id === store?.user_id;

    return (
        <div className={'w-full flex flex-col'}>
            <Card shadow="none"
                className={`w-full ${isSmall ? 'max-w-[474px]' : 'max-w-[950px]'}`}
            >
                <CardBody
                    className={'p-4'}
                >
                    <div className={'flex flex-col gap-x-24 md:flex-row md:items-start w-full'}>
                        <StoreHeader/>
                        {!isSmall && (
                            <StoreTopNext/>
                        )}
                    </div>
                </CardBody>
            </Card>
            {isOwner && (
                <div className={'flex flex-row  justify-end gap-x-4 mt-6'}>
                    <Button
                        className="w-[150px] h-12 justify-start bg-gradient-primary text-white font-medium"
                        isLoading={isAddLoading}
                        startContent={
                            <Icon
                                icon="solar:add-square-broken"
                                width={24}
                                className="text-white"
                            />
                        }
                        onPress={() => {
                            setIsAddLoading(true);
                            handleAddItem();
                        }}

                    >
                        {!isAddLoading && t("addItem")}
                    </Button>
                    <ThreeDotsDropdown/>
                </div>
            )}
        </div>
    );
}