/**
 * @fileoverview Helper for showing a success toast notification.
 *
 * Exports showSuccessMessage, which displays the given success string as a
 * success-colored HeroUI toast with a 2-second timeout and a visible timeout
 * progress bar.
 */
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