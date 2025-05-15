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