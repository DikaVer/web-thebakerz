/**
 * @fileoverview Helper for computing a cart item's total price including variant surcharges.
 *
 * Exports calculateItemTotalPrice, which sums the prices of all selected variant
 * items, adds them to the product base price, and multiplies by the quantity
 * when provided. Returns 0 when no base price is available.
 */
import {Variant} from "@/lib/actions/cart";

export const calculateItemTotalPrice = (variant?: Variant[], productPrice?: number, quantity?: number) => {

    if (!variant && productPrice && quantity) {
        return productPrice * quantity;
    } else if (variant && productPrice && quantity) {
        // Calculate variant price
        const variantPrice = variant
            ? variant.reduce((sum, variant) =>
                sum + (variant.selectedItems
                    ? variant.selectedItems.reduce((itemSum, item) =>
                        itemSum + (item.price || 0), 0)
                    : 0), 0)
            : 0;

        // Return total price (base price + variant price) * quantity
        return (productPrice + variantPrice) * quantity;

    } else if (variant && productPrice) {
        // Calculate variant price
        const variantPrice = variant
            ? variant.reduce((sum, variant) =>
                sum + (variant.selectedItems
                    ? variant.selectedItems.reduce((itemSum, item) =>
                        itemSum + (item.price || 0), 0)
                    : 0), 0)
            : 0;

        // Return total price (base price + variant price) * quantity
        return (productPrice + variantPrice);
    } else {
        return 0;
    }
};