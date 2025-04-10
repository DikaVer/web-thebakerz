import {calculateTax} from "@/lib/utils";
const SERVICE_FEE_CENTS = 0; // Example service fee in cents
const DEFAULT_VAT_RATE = 0.09; // Default VAT rate (e.g., 9% for food in NL)
const SERVICE_VAT_RATE = 0.21; // Service fee VAT rate (e.g., 21% for non-food in NL)

/**
 * Calculates various totals based on item subtotal, tax applicability, and delivery fee.
 * Assumes input amounts (itemSubtotalInclVat, deliveryFeeInclVat) INCLUDE VAT if applicable.
 * Returns amounts both including and excluding VAT where relevant.
 */
export const calculateTotals = (
    itemSubtotalInclVat: number, 
    applyVat: boolean, 
    deliveryFeeInclVat: number,
    isStoreDelivery: boolean
) => {
    const vatRate = applyVat ? DEFAULT_VAT_RATE : 0;
    const vatMultiplier = 1 + vatRate;
    const serviceFeeVatMultiplier = 1 + SERVICE_VAT_RATE;

    // Calculate amounts excluding VAT
    const itemSubtotalExclVat = applyVat ? (itemSubtotalInclVat / vatMultiplier) : itemSubtotalInclVat;
    const deliveryFeeExclVat = isStoreDelivery ? (applyVat ? (deliveryFeeInclVat / serviceFeeVatMultiplier) : deliveryFeeInclVat) : (deliveryFeeInclVat / serviceFeeVatMultiplier);
    const serviceFeeExclVat = (SERVICE_FEE_CENTS / serviceFeeVatMultiplier);

    // Calculate VAT amounts
    const itemVat = itemSubtotalInclVat - itemSubtotalExclVat;
    const deliveryVat = deliveryFeeInclVat - deliveryFeeExclVat;
    const serviceVat = SERVICE_FEE_CENTS - serviceFeeExclVat;
    const totalVat = itemVat + deliveryVat + serviceVat;

    // Calculate final total including VAT
    const totalInclVat = itemSubtotalInclVat + deliveryFeeInclVat + SERVICE_FEE_CENTS;

    return {
        itemExclVat: Math.round(itemSubtotalExclVat), // For display & potentially min order check
        deliveryFeeExclVat: Math.round(deliveryFeeExclVat),  // For display
        serviceFeeExclVat: Math.round(serviceFeeExclVat),   // For display
        itemInclVat: Math.round(itemSubtotalInclVat), // For display
        deliveryFeeInclVat: Math.round(deliveryFeeInclVat),  // For display
        serviceFeeInclVat: Math.round(SERVICE_FEE_CENTS),   // For display
        itemVat: Math.round(itemVat),
        deliveryVat: Math.round(deliveryVat),
        serviceVat: Math.round(serviceVat),
        totalVat: Math.round(totalVat),            // For display
        totalInclVat: Math.round(totalInclVat),       // Final payable amount
        totalExclVat: Math.round(totalInclVat - totalVat), // For display
    };
};

export const calculateApplicationFee = (totalInclVat: number, isStoreDelivery: boolean) => {
    const applicationFeeRate = isStoreDelivery ? 0.08 : 0.25; // 8% fee and if store does not deliver then 25%
    const applicationFee = totalInclVat * applicationFeeRate;
    return Math.round(applicationFee);
};
