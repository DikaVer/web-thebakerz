'use server'

import { stripe } from "@/stripe";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/actions/requests";
import { getCart } from "@/lib/actions/cart";
import { getProductsByStoreId } from "@/lib/actions/product";
import { getDeliveryTime, getOrderTime} from "@/app/(store)/[id]/actions";
import {OrderRaw} from "@/lib/actions/order";
import {v4 as uuidv4} from "uuid";
import {containerOrdersUnpaid} from "@/db";
import {getStoreDataByStoreNameOrId} from "@/lib/actions/store";
import {calculateTotals} from "@/lib/price/tax";
import {calculateItemTotalPrice} from "@/lib/helper/calculate-total-price-variants";
import {CalendarDateTime, now, ZonedDateTime} from "@internationalized/date";
import {scheduledToCalendarDateTime, formatCurrency} from "@/lib/utils";
import { getDeliveryMode } from "@/lib/delivery-cookie";
import { AddressFormType, ValidationResult } from "@/components/providers/delivery-provider";
import { getCurrentDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { validateAddress } from "@/lib/actions/delivery-address-actions";
import { MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import { WorkHours } from "@/lib/actions/calendar-actions";

// --- PLACEHOLDER --- 
// Assuming this function exists or will be created in calendar-actions.ts
// It should validate if the given time is within the schedule and respects lead time.
async function validateOrderTimeAgainstSchedule(
    orderDateTime: CalendarDateTime,
    schedule: WorkHours | undefined,
    leadTimeMinutes: number
): Promise<{ isValid: boolean; message: string }> {
    console.warn("validateOrderTimeAgainstSchedule is a placeholder implementation.");
    if (!schedule) {
        return { isValid: false, message: "Schedule data is missing." };
    }
    // TODO: Implement actual validation logic here using schedule and leadTimeMinutes
    // Check against opening hours for the specific day
    // Check if orderDateTime is at least leadTimeMinutes after now
    // Check if orderDateTime is not too far in the future (e.g., within store policy)
    return { isValid: true, message: "Time validation placeholder: OK" };
}
// --- END PLACEHOLDER ---

// Helper function to round to two decimals (for cents)
function roundToCents(num: number): number {
    return Math.round(num);
}

// Define the expected input structure for fetchClientSecret
interface FetchClientSecretInput {
    storeId: string;
    storeStripeAccountId: string;
    // Add addressData if needed for server-side validation
    // addressData?: AddressFormType;
}

export async function fetchClientSecret({ storeId, storeStripeAccountId }: FetchClientSecretInput) {
    // 1. Basic Checks & Rate Limiting
    // ---------------------------------
    if (!(await globalPOSTRateLimit())) {
        return { error: 'Too many requests' };
    }

    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!storeId || !storeStripeAccountId) {
        return { error: 'Store ID and Stripe Account ID are required' };
    }

    // 2. User & Session Info
    // ----------------------
    const { session, user, store: userIsStoreOwner } = await getCurrentSession();
    let userId = user?.id || await getCartSessionCookieOrCreate();
    if (!userId) return { error: "User identifier could not be determined." };

    // 3. Cart Validation
    // ------------------
    const cartData = await getCart(userId, storeId);
    if (!cartData || !cartData[storeId] || Object.keys(cartData[storeId]).length === 0) {
        return { error: 'Your cart is empty.' };
    }

    // 4. Determine Delivery/Pickup Mode
    // ---------------------------------
    const deliveryMode = await getDeliveryMode(); // 'delivery' or 'pickup'
    const isDelivery = deliveryMode === 'delivery';

    // Fetch Full Store Data (needed for schedule, lead time, KOR status)
    const storeData = await getStoreDataByStoreNameOrId(storeId);
    if (!storeData) {
        return { error: 'Store data could not be found.' };
    }

    // 5. Address & Delivery Region Validation (if delivery)
    // -----------------------------------------------------
    let deliveryValidationResult: ValidationResult | null = null;
    let deliveryFeeInclVat = 0;
    let minimumOrderAmount = 1000; // Default min €10
    let selectedRegion: MerchantDeliveryRegion | undefined;

    if (isDelivery) {
        const currentAddress = await getCurrentDeliveryAddress(storeId); // Fetch from DB
        if (!currentAddress || !currentAddress.coordinates) {
            return { error: 'Delivery address is missing or incomplete.' };
        }
        const addressDataForValidation: AddressFormType = { ...currentAddress }; // Map DB structure if needed
        
        // Use storeData.deliveryRegions if already fetched
        deliveryValidationResult = await validateAddress(addressDataForValidation, storeId);
        
        if (!deliveryValidationResult.isValid) {
            return { error: `Address validation failed: ${deliveryValidationResult.message}` };
        }
        if (!deliveryValidationResult.isInRange) {
            return { error: `Address is outside the delivery area: ${deliveryValidationResult.message}` };
        }
        if (!deliveryValidationResult.deliveryRegion) {
             // Should not happen if isInRange is true, but good to check
            return { error: 'Could not determine the delivery region for the address.' };
        }
        
        selectedRegion = deliveryValidationResult.deliveryRegion;
        deliveryFeeInclVat = selectedRegion.priceInCents || 0;
        minimumOrderAmount = selectedRegion.minOrderPriceInCents || minimumOrderAmount; 
    }

    // 6. Order Time Validation
    // ------------------------
    // Fetch selected time based on mode and potentially region
    let fetchedTimeData: { date: string | null; time: string | null; } | null = null;
    if (isDelivery && selectedRegion) {
        fetchedTimeData = await getDeliveryTime(storeId, selectedRegion.name); 
    } else if (!isDelivery) {
        fetchedTimeData = await getOrderTime(storeId); 
    }

    // Ensure date and time are strings, not null
    if (!fetchedTimeData?.date || !fetchedTimeData?.time) {
        return { error: isDelivery ? 'Delivery time is not set.' : 'Pickup time is not set.' };
    }
    // Now we know date and time are strings
    const selectedTime = { date: fetchedTimeData.date, time: fetchedTimeData.time };

    // Validate against current time (prevent past orders)
    const nowInAmsterdam: ZonedDateTime = now("Europe/Amsterdam");
    const orderDateTime: CalendarDateTime = scheduledToCalendarDateTime(selectedTime);
    // Compare using epoch milliseconds for safety
    if (orderDateTime.toDate(nowInAmsterdam.timeZone).getTime() < nowInAmsterdam.toDate().getTime()) {
        return { error: "Cannot place orders for past dates/times." };
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
        return { error: isDelivery ? "Delivery/Store schedule not found." : "Store operating hours not found." };
    }

    const leadTime = storeData.minTimeOrder || 0; // Use minTimeOrder from storeData
    
    const timeValidation = await validateOrderTimeAgainstSchedule(
        orderDateTime, 
        scheduleToValidateAgainst, 
        leadTime
    );
    if (!timeValidation.isValid) {
        return { error: `Invalid order time: ${timeValidation.message}` };
    }

    // 7. Calculate Totals & Minimum Order Check
    // -----------------------------------------
    const productsData = await getProductsByStoreId(storeId);
    const applyVat = !storeData.kor; // Use KOR status from storeData

    // Calculate item subtotal (including VAT if applicable)
    let itemsSubtotalInclVat = 0;
    const cartItemsForOrder = []; // Store details for the unpaid order

    for (const itemId in cartData[storeId]) {
        const cartItem = cartData[storeId][itemId];
        const product = productsData[cartItem.product_id];
        if (!product) continue; 

        const itemTotalInclVat = calculateItemTotalPrice(cartItem.variants, product.price, cartItem.quantity);
        itemsSubtotalInclVat += itemTotalInclVat;

        cartItemsForOrder.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price, // Base price
            note: cartItem.note,
            variants: cartItem.variants,
            const_id: product.constId,
            ingredients: product.ingredients,
            allergies: product.allergies,
            unitAmount: calculateItemTotalPrice(cartItem.variants, product.price), // Price per unit incl VAT
            itemTotalInclVat: itemTotalInclVat // Total for this line incl VAT
        });
    }

    // Check against minimum order amount (based on items subtotal *before* delivery fee)
    if (itemsSubtotalInclVat < minimumOrderAmount) {
        return { error: `Minimum order amount is ${formatCurrency(minimumOrderAmount)}. Current items total is ${formatCurrency(itemsSubtotalInclVat)}.` };
    }

    // Calculate final totals using the updated function
    const { 
        itemSubtotalExclVat, 
        deliveryFeeExclVat, 
        totalVat, 
        totalInclVat 
    } = calculateTotals(itemsSubtotalInclVat, applyVat, deliveryFeeInclVat);

    // 8. Prepare Stripe Line Items (Prices EXCLUDING VAT)
    // ---------------------------------------------------
    const stripeLineItems = [];
    const stripeTaxRateId = applyVat ? (await stripe.taxRates.create({
        display_name: 'VAT',
        description: 'BTW',
        jurisdiction: 'NL',
        percentage: 9.0, // Assuming 9%
        inclusive: false, // Prices we provide are *exclusive* of tax
    })).id : undefined;

    for (const cartItem of cartItemsForOrder) {
        const product = productsData[cartItem.id]; // Get product again
        if (!product) continue; 

        // Calculate price PER UNIT, excluding VAT
        const unitPriceExclVat = calculateTotals(cartItem.unitAmount, applyVat, 0).itemSubtotalExclVat;

        stripeLineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: cartItem.name,
                    description: product.description || undefined, // Optional
                    images: product.picture ? [product.picture] : [], // Optional
                },
                unit_amount: roundToCents(unitPriceExclVat), // Price per item EXCL VAT
            },
            quantity: cartItem.qty,
            tax_rates: stripeTaxRateId ? [stripeTaxRateId] : undefined,
        });
    }

    // Add delivery fee as a separate line item if applicable (EXCLUDING VAT)
    if (isDelivery && deliveryFeeInclVat > 0) {
        stripeLineItems.push({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Delivery Fee',
                },
                unit_amount: roundToCents(deliveryFeeExclVat), // Delivery fee EXCL VAT
            },
            quantity: 1,
            tax_rates: stripeTaxRateId ? [stripeTaxRateId] : undefined,
        });
    }
    
    // Add Service Fee if needed (Example - assuming SERVICE_FEE_CENTS is defined)
    // const SERVICE_FEE_CENTS = 50; // 50 cents example
    // if (SERVICE_FEE_CENTS > 0) {
    //     const { serviceFeeExclVat } = calculateTotals(0, applyVat, 0, SERVICE_FEE_CENTS);
    //     stripeLineItems.push({
    //         price_data: {
    //             currency: 'eur',
    //             product_data: {
    //                 name: 'Service Fee',
    //             },
    //             unit_amount: roundToCents(serviceFeeExclVat),
    //         },
    //         quantity: 1,
    //         tax_rates: stripeTaxRateId ? [stripeTaxRateId] : undefined,
    //     });
    // }

    // 9. Create Unpaid Order Record
    // ------------------------------
    const cosmosId = uuidv4();
    // Adjust the type to match the actual structure being created, then cast for DB insert
    const orderRecordForDb: Omit<OrderRaw, 'id'> & { id: string; isDelivery: boolean; deliveryAddress?: AddressFormType; deliveryRegionName?: string; deliveryFeeInclVat?: number; itemsSubtotalInclVat: number; totalInclVat: number; totalVat: number; status: string; } = {
        id: cosmosId,
        store_id: storeId,
        createdAt: new Date(),
        scheduled_time: selectedTime, // Use the validated time
        customer_email: (user && !userIsStoreOwner) ? user.email : undefined,
        productsData: cartItemsForOrder, // Use the detailed cart items
        // Add extra fields needed internally or for Stripe metadata, but not part of base OrderRaw
        isDelivery: isDelivery,
        deliveryAddress: isDelivery ? deliveryValidationResult?.validatedAddress : undefined,
        deliveryRegionName: isDelivery ? selectedRegion?.name : undefined,
        deliveryFeeInclVat: isDelivery ? deliveryFeeInclVat : 0,
        itemsSubtotalInclVat: itemsSubtotalInclVat,
        totalInclVat: totalInclVat,
        totalVat: totalVat,
        status: 'pending_payment',
    };

    try {
        // Cast to OrderRaw for creation, assuming extra fields aren't needed in the DB schema
        await containerOrdersUnpaid.items.create(orderRecordForDb as OrderRaw);
    } catch (dbError) {
        console.error("Failed to create unpaid order record:", dbError);
        return { error: "Database error before starting payment." };
    }

    // 10. Create Stripe Checkout Session
    // ---------------------------------
    try {
        const stripeSession = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            submit_type: 'pay',
            customer_email: orderRecordForDb.customer_email, // Use email from order record
            billing_address_collection: totalInclVat >= 10000 ? 'required' : 'auto', 
            tax_id_collection: {
                enabled: totalInclVat >= 10000,
            },
            line_items: stripeLineItems,
            mode: 'payment',
            currency: 'eur',
            payment_method_types: ['card', 'ideal', 'revolut_pay', 'bancontact'],
            return_url: `${origin}/api/pay?session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}&store_stripe_account_id=${storeStripeAccountId}&order_id=${cosmosId}`,
            automatic_tax: { enabled: false }, // We specify tax rates manually
            payment_intent_data: {
              transfer_data: {
                  destination: storeStripeAccountId,
              },
              // application_fee_amount: calculateApplicationFee(totalInclVat), // Optional: Platform fee
            },
            metadata: {
                userId: userId,
                storeId: storeId,
                cosmosOrderId: cosmosId, // Link to our unpaid order record
                isDelivery: String(isDelivery),
            }
        });

        return stripeSession.client_secret;

    } catch (error: any) {
        console.error('Error creating Stripe checkout session:', error);
        // Optionally: Attempt to delete the unpaid order record if Stripe fails?
        return { error: `Failed to create payment session: ${error.message || 'Unknown Stripe error'}` };
    }
}