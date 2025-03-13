"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button} from "@heroui/react";
import {useRouter} from "next/navigation";


export const OrderOverview: React.FC = () => {

    const router = useRouter();

    return (
        <>
            <Button
                size="md"
                variant="light"
                className="text-default-500"
                onPress={() => {
                    router.push("/cake/orders?date=''");
                    router.refresh();
                }}
                startContent={
                    <Icon
                        className="text-default-500"
                        height={24}
                        icon="solar:alt-arrow-left-linear"
                        width={24}
                    />
                }
            >
                Back to Order Dashboard
            </Button>
        </>
    );
};
