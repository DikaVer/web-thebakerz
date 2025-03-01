
import React from "react";
import {addToast} from "@heroui/react";


interface ToastMessageProps {
    success: string;
}

const showSuccessMessage = ({ success }: ToastMessageProps) => {
    addToast({
        description: success,
        timeout: 2000,
        shouldShowTimeoutProgress: true,
        //@ts-ignore
        color: "success"
    });
};

export default showSuccessMessage;