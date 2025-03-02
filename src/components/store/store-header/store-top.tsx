"use client";

import React from "react";
import {Icon, IconProps} from "@iconify/react";
import {Button, Card, CardBody} from "@heroui/react";
import {StoreHeader} from "@/components/store/store-header/store-header";
import {StoreSubHeader} from "@/components/store/store-header/store-subheader";
import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {useSession} from "@/components/providers/session-provider";
import {useProductDialog} from "@/components/providers/product-provider";
import {useStore} from "@/components/providers/store-provider";
import {useMediaQuery} from "usehooks-ts";
import StoreTopNext from "@/components/store/store-header/description/store-top-next";


type SocialIconProps = Omit<IconProps, "icon">;


interface StoreTopProps {
    dateParam: string | null;
    timeParam: string | null;
}

export function StoreTop({dateParam, timeParam}: StoreTopProps) {

    const { session} = useSession();
    const { store } = useStore();
    const { handleOpen } = useProductDialog();
    const isSmall = useMediaQuery("(max-width: 768px)");

    return (
        <div className={'w-full flex flex-col'}>
            <Card
                shadow={'sm'}
                className={'max-w-[950px] w-full'}
            >
                <CardBody
                    className={'p-4'}
                >
                    <div className={'flex flex-col gap-x-24 md:flex-row md:items-start w-full'}>
                        <StoreHeader
                            dateParam={dateParam}
                            timeParam={timeParam}
                        />
                        {!isSmall && (
                            <StoreTopNext/>
                        )}
                    </div>
                </CardBody>
            </Card>
            {(session?.user?.role === "bakerz" && session.store?.id === store.id) && (
                <div className={'flex flex-row  justify-end gap-x-4 mt-6'}>
                    <Button
                        className="w-[150px] h-12 justify-start bg-gradient-primary text-white font-medium"
                        startContent={
                            <Icon
                                icon="solar:add-square-broken"
                                width={24}
                                className="text-white"
                            />
                        }
                        onPress={() => {
                            handleOpen();
                        }}
                    >
                        Add Item
                    </Button>
                    <ThreeDotsDropdown/>
                </div>
            )
            }
        </div>
    );
}
