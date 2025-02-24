
import {addToast} from "@heroui/toast";


interface ToastMessageProps {
    error: string;
}

const showErrorMessage = ({ error }: ToastMessageProps) => {
    addToast({
        description: error,
        timeout: 2000,
        shouldShowTimeoutProgess: true,
        //@ts-ignore
        color: "danger"
    });
};

export default showErrorMessage;