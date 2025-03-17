
import {addToast} from "@heroui/react";


interface ToastMessageProps {
    error: string;
}

const showErrorMessage = ({ error }: ToastMessageProps) => {
    addToast({
        description: error,
        timeout: 2000,
        shouldShowTimeoutProgress: true,
        color: "danger"
    });
};

export default showErrorMessage;