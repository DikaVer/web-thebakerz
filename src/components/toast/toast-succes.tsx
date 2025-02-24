
import React from "react";
import {addToast} from "@heroui/toast";


interface ToastMessageProps {
    success: string;
}

const showSuccessMessage = ({ success }: ToastMessageProps) => {
    addToast({
        description: success,
        timeout: 2000,
        shouldShowTimeoutProgess: true,
        //@ts-ignore
        color: "success"
    });
};

export default showSuccessMessage;