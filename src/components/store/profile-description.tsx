'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, {} from "react";
import {Button} from "@/components/ui/button";
import {IconCross} from "@/components/ui/icons";

interface ProfileDescriptionProps {
    setDialogOpen: (open: boolean) => void;
}

export function ProfileDescription({ setDialogOpen } : ProfileDescriptionProps) {


    return (
        <>
            <div className="fixed z-30 h-full bg-black opacity-50 -top-2 bottom-0 -right-0 left-0 rounded-lg"
                 onClick={(e) => {
                     setDialogOpen(false);
                 }}/>
            <div
                className={"fixed left-[50%] top-[60%] z-40 grid w-full max-w-lg sm:max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg rounded-lg"}
            >
                <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                    <div className={`flex flex-row justify-between items-center`}>
                        <Button
                            className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                            onClick={() => setDialogOpen(false)}
                        >
                            <IconCross className={"w-8 h-8 cursor-pointer"}/>
                        </Button>
                        <p className={"text-xl font-medium"}>Profile</p>
                        <div className="w-8 h-8 flex "></div>
                    </div>

                </div>
            </div>
        </>
    );
}