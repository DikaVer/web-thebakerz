import {calculateTax} from "@/lib/utils";
const CUSTOMER_SERVICE_FEE = 0; // Fee amount in cents (500 = €5.00)

export const calculateTotals = (amount: number, includeTax: boolean) => {
    const vat = includeTax ? calculateTax(amount) : 0;
    const subtotal = amount - vat;
    amount += CUSTOMER_SERVICE_FEE;
    return {
        vat: Math.round(vat),
        subtotal: Math.round(subtotal),
        total: Math.round(amount),
    };
};

export const calculatePlatformFee = (amount: number) => {
    amount += CUSTOMER_SERVICE_FEE;
    return {
        platform_fee: Math.round(amount),
    };
};