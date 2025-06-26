'use server';
import { getTranslations } from "next-intl/server";

export const getErrorMessage = async (errorCode: string | null) => {
    const t = await getTranslations("PaymentErrors");
    
    switch (errorCode) {
        case 'rate_limit':
            return t("rateLimit");
        case 'missing_payment_intent':
            return t("missingPaymentIntent");
        case 'payment_failed':
            return t("paymentFailed");
        case 'missing_store_id':
        case 'missing_cosmos_id':
        case 'missing_cart_id':
            return t("missingOrderInformation");
        case 'order_not_found':
            return t("orderNotFound");
        case 'missing_email':
            return t("missingEmail");
        case 'user_creation_failed':
            return t("userCreationFailed");
        case 'order_creation_failed':
            return t("orderCreationFailed");
        case 'processing_failed':
            return t("processingFailed");
        default:
            return t("unexpectedError");
    }
}; 