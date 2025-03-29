import {calculateTax} from "@/lib/utils";
const SERVICE_FEE_CENTS = 0; // Example service fee in cents
const DEFAULT_VAT_RATE = 0.09; // Default VAT rate (e.g., 9% for food in NL)

/**
 * Calculates various totals based on item subtotal, tax applicability, and delivery fee.
 * Assumes input amounts (itemSubtotalInclVat, deliveryFeeInclVat) INCLUDE VAT if applicable.
 * Returns amounts both including and excluding VAT where relevant.
 */
export const calculateTotals = (
    itemSubtotalInclVat: number, 
    applyVat: boolean, 
    deliveryFeeInclVat: number
) => {
    const vatRate = applyVat ? DEFAULT_VAT_RATE : 0;
    const vatMultiplier = 1 + vatRate;

    // Calculate amounts excluding VAT
    const itemSubtotalExclVat = applyVat ? Math.round(itemSubtotalInclVat / vatMultiplier) : itemSubtotalInclVat;
    const deliveryFeeExclVat = applyVat ? Math.round(deliveryFeeInclVat / vatMultiplier) : deliveryFeeInclVat;
    const serviceFeeExclVat = applyVat ? Math.round(SERVICE_FEE_CENTS / vatMultiplier) : SERVICE_FEE_CENTS;

    // Calculate VAT amounts
    const itemVat = itemSubtotalInclVat - itemSubtotalExclVat;
    const deliveryVat = deliveryFeeInclVat - deliveryFeeExclVat;
    const serviceVat = SERVICE_FEE_CENTS - serviceFeeExclVat;
    const totalVat = itemVat + deliveryVat + serviceVat;

    // Calculate final total including VAT
    const totalInclVat = itemSubtotalInclVat + deliveryFeeInclVat + SERVICE_FEE_CENTS;

    return {
        itemSubtotalExclVat, // For display & potentially min order check
        deliveryFeeExclVat,  // For display
        serviceFeeExclVat,   // For display
        itemVat,
        deliveryVat,
        serviceVat,
        totalVat,            // For display
        totalInclVat         // Final payable amount
    };
};