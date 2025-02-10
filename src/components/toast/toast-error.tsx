import {Alert} from "@heroui/alert";
import {toast} from "sonner";


interface ToastMessageProps {
    error: string;
}

const showErrorMessage = ({ error }: ToastMessageProps) => {
    toast.message(
        (
            <div className="flex flex-col gap-4 w-full">
                <Alert
                    color="danger"
                    title="Warning Notification"
                    description={error}
                    variant="faded"
                />
            </div>
        ),
        {
            duration: 2000,
            className: 'p-0 rounded-xl',
        }
    );
};

export default showErrorMessage;