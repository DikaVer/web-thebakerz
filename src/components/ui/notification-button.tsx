"use client";

import React from "react";
import {Badge,  Switch} from "@nextui-org/react";
import {IconNotification} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";

export default function NotificationButton() {

    return (

        <Button
            className="flex p-2 pt-5 items-center rounded-full"
            variant={"ghost"}
        >
            <Badge color="primary" content={69} shape="circle">
                <IconNotification className=" w-8 h-8 text-text"/>
            </Badge>
        </Button>
    );
}