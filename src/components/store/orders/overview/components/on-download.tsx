import axios from "axios";
import showErrorMessage from "@/components/toast/toast-error";
import {addToast} from "@heroui/react";


export const onDownloadInvoice = async (storeId: string, orderId: string, storeOrderId:string, customer_email: string) => {
    try {
        const res = await fetch(`/api/invoice/${storeId}/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_email }),
        });


        if (res.status === 200) {
            // Get the blob directly from response
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${storeId}-${storeOrderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            addToast({
                title: "Download started",
                description: "Your PDF is downloading.",
                timeout: 1000,
                shouldShowTimeoutProgress: true,
                color: "success"
            });
        } else {
            addToast({
                title:"Error",
                description: "Failed to generate PDF.",
                timeout: 1000,
                shouldShowTimeoutProgress: true,
                color: "danger"
            });
        }
    } catch (error) {
        console.error(error);
        addToast({
            title:"Something went wrong",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            timeout: 1000,
            shouldShowTimeoutProgress: true,
            color: "danger"
        });
    }
};