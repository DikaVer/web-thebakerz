
import {addToast} from "@heroui/react";


export const onDownloadInvoice = async (storeId: string, orderId: string, storeOrderId:string, customer_email: string) => {
    try {
        const res = await fetch(`/api/invoice/${storeId}/${orderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_email: customer_email.toLowerCase() }),
            next: {
                revalidate: 60 * 60 * 24,
            }
        });


        if (res.status === 200) {
            // Get the blob directly from response
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Invoice-${storeId}-${storeOrderId}.pdf`;
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
            const resJson = await res.json();
            addToast({
                title:"Error",
                description: resJson?.error || "Failed to download PDF",
                timeout: 4000,
                shouldShowTimeoutProgress: true,
                color: "danger"
            });
        }
    } catch (error) {
        console.error(error);
        addToast({
            title:"Something went wrong",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            timeout: 4000,
            shouldShowTimeoutProgress: true,
            color: "danger"
        });
    }
};