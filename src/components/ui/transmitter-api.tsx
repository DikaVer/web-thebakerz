// Adjust the import path as needed

import {toast} from "sonner";
import React from "react";
import {IconSuccess} from "@/components/ui/icons";

interface ToastOptions {
    message: string;
    duration?: number;
    iconColor?: string;
    iconSize?: string;
    textClassName?: string;
    containerClassName?: string;
}

const showToast = ({
                       message,
                       duration = 10000,
                       iconColor = "primary",
                       iconSize = "w-10 h-10 text-primary",
                       textClassName = "text-base font-bold",
                       containerClassName = "flex flex-row gap-x-1 justify-between items-center"
                   }: ToastOptions) => {
    toast.success(
        <div className={containerClassName}>
            <IconSuccess className={iconSize} />
            <p className={textClassName}>
                {message}
            </p>
        </div>,
        {
            duration
        }
    );
};

export default showToast;