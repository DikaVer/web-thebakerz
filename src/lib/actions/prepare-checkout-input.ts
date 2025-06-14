'use server'

import { stripe } from "@/stripe";
import { getCurrentSession } from "@/lib/actions/session";
import { getSessionCookie } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import { getCurrentProducts } from "@/lib/api/products-api";
import { getDeliveryTime, getOrderTime } from "@/app/(store)/[id]/actions";
import { OrderRaw, ExtendedOrderRaw } from "@/lib/actions/order";
import { v4 as uuidv4 } from "uuid";
import { containerOrdersUnpaid } from "@/db";
import { getCurrentStorePayment } from "@/lib/api/store-api";
import { calculateApplicationFee, calculateTotals } from "@/lib/utils/price/price-calculations";
import { calculateItemTotalPrice } from "@/lib/utils/helper/calculate-total-price-variants";
import { CalendarDateTime, ZonedDateTime, now } from "@internationalized/date";
import { scheduledToCalendarDateTime, formatCurrency } from "@/lib/utils";
import { getDeliveryMode } from "@/lib/actions/cookies/delivery-cookie";
import { ValidationResult } from "@/components/providers/delivery-provider";
import { getCurrentDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { validateAddress } from "@/lib/actions/delivery-address-actions";
import { MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import { DeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { getCurrentCartType } from "../api/cart-api";
import { MIN_ORDER_PRICE_IN_CENTS } from "@/lib/local-variables";
import { validateOrderTimeAgainstSchedule } from "./order-checker";
import { logger } from "@azure/storage-blob";

// Define the expected input structure for prepareCheckout
interface PrepareCheckoutInput {
    storeId: string;
    storeStripeAccountId: string;
    promotionCode?: string;
    referralCode?: string;
    orderNote?: string;
}

export async function prepareCheckout({ 
    storeId, 
    storeStripeAccountId, 
    promotionCode, 
    referralCode, 
    orderNote 
}: PrepareCheckoutInput) {
    // 1. Basic Checks & Rate Limiting
    if (!(await globalPOSTRateLimit())) {
        return { error: 'Too many requests' };
    }

    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!storeId || !storeStripeAccountId) {
        return {error: 'Store ID and Stripe Account ID are required'};
    }

    // 2. User & Session Info
    const { user } = await getCurrentSession();
    let userId = user?.id || await getSessionCookie();
    if (!userId) return { error: "User identifier could not be determined." };

    // 3. Determine Delivery/Pickup Mode
    const deliveryMode = await getDeliveryMode();
    const isDelivery = deliveryMode === 'delivery';

    // Fetch Full Store Data
    const storeData = await getCurrentStorePayment(storeId);
    if (!storeData) {
        return { error: 'Store data could not be found.' };
    }

    // 4. Cart Validation
    const cartData = await getCurrentCartType(storeId, isDelivery ? "delivery" : "pickup");
    if (!cartData || !cartData[storeId] || Object.keys(cartData[storeId]).length === 0) {
        return { error: 'Your cart is empty.' };
    }

    // 5. Address & Delivery Region Validation (if delivery)
    let deliveryValidationResult: ValidationResult | null = null;
    let currentAddress: DeliveryAddress | null = null;
    let deliveryFeeInclVat = 0;
    let minimumOrderAmount = MIN_ORDER_PRICE_IN_CENTS;
    let selectedRegion: MerchantDeliveryRegion | undefined;

    if (isDelivery) {
        currentAddress = await getCurrentDeliveryAddress();
        if (!currentAddress || !currentAddress.coordinates) {
            return { error: 'Delivery address is missing or incomplete.' };
        }

        deliveryValidationResult = await validateAddress(currentAddress, storeId);

        if (!deliveryValidationResult.isValid) {
            return { error: `Address validation failed: ${deliveryValidationResult.message}` };
        }
        if (!deliveryValidationResult.isInRange) {
            return { error: `Address is outside the delivery area: ${deliveryValidationResult.message}` };
        }
        if (!deliveryValidationResult.deliveryRegion) {
            return { error: 'Could not determine the delivery region for the address.' };
        }

        selectedRegion = deliveryValidationResult.deliveryRegion;
        deliveryFeeInclVat = selectedRegion.ranges?.[0]?.deliveryPriceInCents || 100000;
        minimumOrderAmount = selectedRegion.ranges?.[0]?.minOrderPriceInCents || 100000;
    }

    let fetchedTimeData: { date: string | null; time: string | null; } | null = null;
    // 6. Order Time Validation
    // ------------------------
    // Fetch selected time based on mode and potentially region
    if (isDelivery && selectedRegion) {
        fetchedTimeData = await getDeliveryTime(storeId, selectedRegion.name);
    } else if (!isDelivery) {
        fetchedTimeData = await getOrderTime(storeId);
    }

    // Ensure date and time are strings, not null
    if (!fetchedTimeData?.date || !fetchedTimeData?.time) {
        return {error: isDelivery ? 'Delivery time is not set.' : 'Pickup time is not set.'};
    }
    const selectedTime = {date: fetchedTimeData.date, time: fetchedTimeData.time};

    // Validate against current time (prevent past orders)
    const nowInAmsterdam: ZonedDateTime = now("Europe/Amsterdam");
    const orderDateTime: CalendarDateTime = scheduledToCalendarDateTime(selectedTime);
    // Compare using epoch milliseconds for safety
    if (orderDateTime.toDate(nowInAmsterdam.timeZone).getTime() < nowInAmsterdam.toDate().getTime()) {
        return {error: "Cannot place orders for past dates/times."};
    }

    // Validate against store schedule (operating hours, lead time)
    // Get the correct schedule based on delivery mode
    const relevantSchedule = isDelivery
        ? selectedRegion?.deliverySchedule // Use region specific schedule if available
        : storeData.schedule; // Use general store schedule for pickup

    // If delivery is chosen but the specific region has no schedule, fall back to store schedule?
    // Or maybe it should be an error? Let's assume fallback for now.
    const scheduleToValidateAgainst = relevantSchedule || storeData.schedule;

    if (!scheduleToValidateAgainst) {
        return {error: isDelivery ? "Delivery/Store schedule not found." : "Store operating hours not found."};
    }
    
    let leadTime = isDelivery ? selectedRegion?.minOrderTime : storeData.minTimeOrder// Use minTimeOrder from storeData

    // 7. Calculate Totals & Minimum Order Check
    const productsData = await getCurrentProducts(storeId);
    const applyVat = !storeData.kor;

    // Calculate item subtotal
    let itemsInclVat = 0;
    const cartItemsForOrder = [];

    for (const itemId in cartData[storeId]) {
        const cartItem = cartData[storeId][itemId];
        const product = productsData[cartItem.product_id];
        if (!product) continue;
        if (isDelivery && !product.isPostDelivery && selectedRegion?.isPostDelivery) {
            continue;
        }

        if (leadTime && leadTime < product.min_lead_time) {
            leadTime = product.min_lead_time;
        }
        const itemTotalInclVat = calculateItemTotalPrice(cartItem.variants, product.price, cartItem.quantity);
        itemsInclVat += itemTotalInclVat;

        cartItemsForOrder.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price,
            note: cartItem.note,
            variants: cartItem.variants,
            ingredients: product.ingredients,
            allergies: product.allergies,
            image: product.picture,
            unitAmount: calculateItemTotalPrice(cartItem.variants, product.price),
            itemTotalInclVat: itemTotalInclVat
        });
    }

    // Validate against store schedule (operating hours, lead time)
    if (user?.role !== 'bakerz' && !selectedRegion?.isPostDelivery) {
        if (!leadTime ) {
            return {error: 'Validation of order time failed. Please try again.'};
        }

        const timeValidation = await validateOrderTimeAgainstSchedule(
            orderDateTime,
            scheduleToValidateAgainst,
            leadTime
        );
        if (!timeValidation.isValid) {
            return {error: `Invalid order time: ${timeValidation.message}`};
        }
    }

    // Check against minimum order amount
    if (itemsInclVat < minimumOrderAmount) {
        return { 
            error: `Minimum order amount is ${formatCurrency(minimumOrderAmount)}. Current items total is ${formatCurrency(itemsInclVat)}.` 
        };
    }

    // Calculate final totals
    const {
        itemExclVat,
        deliveryFeeExclVat,
        serviceFeeExclVat,
        serviceFeeInclVat,
        itemVat,
        deliveryVat,
        serviceVat,
        totalVat,
        totalInclVat,
        totalExclVat
    } = calculateTotals(itemsInclVat, applyVat, deliveryFeeInclVat, selectedRegion?.isStoreDelivery || false);

    // 7. Create Unpaid Order Record
    const cosmosId = uuidv4();


    const orderRecordForDb: ExtendedOrderRaw = {
        id: cosmosId,
        store_id: storeId,
        store_name: storeData.ownerName || "Bakery",
        createdAt: new Date(),
        scheduled_time: selectedTime,
        customer_email: (user && user.role !== 'bakerz') ? user.email : undefined,
        productsData: cartItemsForOrder,
        orderNote: orderNote,
        isDelivery: isDelivery,
        isStoreDelivery: selectedRegion?.isStoreDelivery || false,
        isPostDelivery: selectedRegion?.isPostDelivery || false,
        isCountryDelivery: selectedRegion?.isCountry || false,
        deliveryToAddress: currentAddress,
        deliveryFromAddress: selectedRegion ? {
            lat: storeData.location.latitude,
            lng: storeData.location.longitude
        } : undefined,
        itemExclVat: itemExclVat,
        deliveryFeeExclVat: deliveryFeeExclVat,
        serviceFeeExclVat: serviceFeeExclVat,
        itemInclVat: itemsInclVat,
        deliveryFeeInclVat: selectedRegion ? deliveryFeeInclVat : 0,
        serviceFeeInclVat: serviceFeeInclVat,
        itemVat: itemVat,
        deliveryVat: deliveryVat,
        serviceVat: serviceVat,
        totalInclVat: totalInclVat,
        totalVat: totalVat,
        totalExclVat: totalExclVat,
        region: storeData.region,
        currency: storeData.currency,
        transfer_data: [{
            destination: storeStripeAccountId,
            amount: itemsInclVat + (selectedRegion?.isStoreDelivery ? deliveryFeeInclVat : 0),
            app_fee: calculateApplicationFee(
                itemsInclVat + (selectedRegion?.isStoreDelivery ? deliveryFeeInclVat : 0), 
                selectedRegion?.isStoreDelivery || true, 
                storeData.custom_app_fee, 
                storeData.custom_delivery_fee
            )
        }],
        status: 'pending_payment',
    };

    try {
        await containerOrdersUnpaid.items.create(orderRecordForDb as OrderRaw);
    } catch (dbError) {
        console.error("Failed to create unpaid order record:", dbError);
        return { error: "Database error before starting payment." };
    }

    logger.info('prepareCheckout', 'Unpaid order record created', {
        orderId: cosmosId,
        storeId: storeId,
        storeStripeAccountId: storeStripeAccountId,
        totalAmount: totalInclVat,
        currency: storeData.currency.toLowerCase(),
    });
    // 8. Return checkout data to client
    return {
        orderId: cosmosId,
        totalAmount: totalInclVat,
        currency: storeData.currency.toLowerCase(),
    };
} 