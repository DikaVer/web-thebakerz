"use client";

import React from "react";
import {StoreHeader} from "@/components/store/store-header/store-header";

import {useTranslations} from "next-intl";

interface StoreTopProps {}

export function StoreTop() {

    const t = useTranslations("app/(store)/components/store-top");


    return (
        <div className={'flex flex-row w-full'}>
            <StoreHeader/>
               
            {/* {!isSmall && (
                <Card shadow="none"
                className={`w-full ${isSmall ? 'max-w-[474px]' : 'max-w-[950px]'}`}
                >
                    <CardBody
                        className={'p-4'}
                    >
                        <StoreTopNext/>
                    </CardBody>
                </Card>
            )} */}
            {/* {isOwner && (
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
            )} */}
        </div>
    );
}