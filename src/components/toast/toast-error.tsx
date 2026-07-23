/**
 * @fileoverview Helper for showing an error toast notification.
 *
 * Exports showErrorMessage, which displays the given error string as a
 * danger-colored HeroUI toast with a 4-second timeout and a visible timeout
 * progress bar.
 */

import {addToast} from "@heroui/react";


interface ToastMessageProps {
    error: string;
}

const showErrorMessage = ({ error }: ToastMessageProps) => {
    addToast({
        description: error,
        timeout: 4000,
        shouldShowTimeoutProgress: true,
        color: "danger"
    });
};

export default showErrorMessage;