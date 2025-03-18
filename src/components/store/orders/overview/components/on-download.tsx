import axios from "axios";
import showErrorMessage from "@/components/toast/toast-error";
import {addToast} from "@heroui/react";


export const onDownloadInvoice = async (storeId: string, orderId: string, customer_email: string) => {
    try {
        const res = await axios.post(
            `/api/invoice/${storeId}/${orderId}`,
            { customer_email },
            { responseType: "arraybuffer" }, // Ensures binary data is received for the PDF
        )


        if (res.status === 200) {
            // addToast({
            //     title:"PDF generated successfully",
            //     description: "Starting download...",
            //     timeout: 1000,
            //     shouldShowTimeoutProgress: true,
            //     color: "success"
            // });

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `document-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            addToast({
                title:"Download started",
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
        console.log(error);
        addToast({
            title:"Something went wrong",
            //@ts-ignore
            description: error.response.request.statusText,
            timeout: 1000,
            shouldShowTimeoutProgress: true,
            color: "danger"
        });
    }
};