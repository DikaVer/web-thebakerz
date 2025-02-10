import {Alert} from "@heroui/alert";
import {toast} from "sonner";
import React from "react";


interface ToastMessageProps {
    success: string;
}

const showSuccessMessage = ({ success }: ToastMessageProps) => {
    toast.message((
            <div className="flex flex-col gap-4 w-full">
                <Alert
                    color="success"
                    title={"Success Notification"}
                    description={success}
                    variant="faded"

                />
            </div>
        ),
        {
            duration: 2000,
            className: `p-0 rounded-xl`
        }
    );
};

export default showSuccessMessage;