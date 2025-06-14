'use server'

import { stripe } from "@/stripe";
import { getCurrentSession } from "@/lib/actions/session";
import { getSessionCookie } from "@/lib/actions/session";
import { globalPOSTRateLimit } from "@/lib/utils/helper/requests";
import {getCurrentProducts} from "@/lib/api/products-api";
import { getDeliveryTime, getOrderTime} from "@/app/(store)/[id]/actions";
import {OrderRaw, ExtendedOrderRaw} from "@/lib/actions/order";
import {v4 as uuidv4} from "uuid";
import {containerOrdersUnpaid} from "@/db";
import { getCurrentStorePayment} from "@/lib/api/store-api";
import {calculateApplicationFee, calculateTotals} from "@/lib/utils/price/price-calculations";
import {calculateItemTotalPrice} from "@/lib/utils/helper/calculate-total-price-variants";
import { CalendarDateTime, ZonedDateTime, now } from "@internationalized/date";
import {scheduledToCalendarDateTime, formatCurrency} from "@/lib/utils";
import { getDeliveryMode } from "@/lib/actions/cookies/delivery-cookie";
import { ValidationResult } from "@/components/providers/delivery-provider";
import { getCurrentDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { validateAddress } from "@/lib/actions/delivery-address-actions";
import { MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import { DeliveryAddress} from "@/app/(store)/[id]/delivery-actions";
import { getCurrentCartType } from "../api/cart-api";
import {MIN_ORDER_PRICE_IN_CENTS} from "@/lib/local-variables";
import { validateOrderTimeAgainstSchedule } from "./order-checker";
import { getRescueDealMode } from "./cookies/delivery-cookie";


// Define the expected input structure for fetchClientSecret
interface FetchClientSecretInput {
    storeId: string;
    storeStripeAccountId: string;
    promotionCode?: string; // Optional promotion code
    referralCode?: string; // Optional referral code
    orderNote?: string; // Optional order note
    // Add addressData if needed for server-side validation
    // addressData?: AddressFormType;
}

export async function fetchClientSecret({ storeId, storeStripeAccountId, promotionCode, referralCode, orderNote }: FetchClientSecretInput) {
    // 1. Basic Checks & Rate Limiting
    // ---------------------------------
    if (!(await globalPOSTRateLimit())) {
        return {error: 'Too many requests'};
    }

    const isRescueDeal = await getRescueDealMode();
    if (isRescueDeal) {
        return {error: 'Rescue deals are not supported in this mode.'};
    }

    const origin = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!storeId || !storeStripeAccountId) {
        return {error: 'Store ID and Stripe Account ID are required'};
    }

    // 2. User & Session Info
    // ----------------------
    const {user} = await getCurrentSession();
    let userId = user?.id || await getSessionCookie();
    if (!userId) return {error: "User identifier could not be determined."};

    // 3. Determine Delivery/Pickup Mode
    // ---------------------------------
    const deliveryMode = await getDeliveryMode(); // 'delivery' or 'pickup'
    const isDelivery = deliveryMode === 'delivery';

    // Fetch Full Store Data (needed for schedule, lead time, KOR status)
    const storeData = await getCurrentStorePayment(storeId);
    if (!storeData) {
        return {error: 'Store data could not be found.'};
    }

    // 4. Cart Validation
    // ------------------
    const cartData = await getCurrentCartType(storeId, isDelivery ? "delivery" : "pickup");
    if (!cartData || !cartData[storeId] || Object.keys(cartData[storeId]).length === 0) {
        return {error: 'Your cart is empty.'};
    }

    // 5. Address & Delivery Region Validation (if delivery)
    // -----------------------------------------------------
    let deliveryValidationResult: ValidationResult | null = null;
    let currentAddress: DeliveryAddress | null = null;
    let deliveryFeeInclVat = 0;
    let minimumOrderAmount = MIN_ORDER_PRICE_IN_CENTS; // Default min €10
    let selectedRegion: MerchantDeliveryRegion | undefined;

    if (isDelivery) {
        currentAddress = await getCurrentDeliveryAddress(); // Fetch from DB
        if (!currentAddress || !currentAddress.coordinates) {
            return {error: 'Delivery address is missing or incomplete.'};
        } // Map DB structure if needed

        // Use storeData.deliveryRegions if already fetched
        deliveryValidationResult = await validateAddress(currentAddress, storeId);

        if (!deliveryValidationResult.isValid) {
            return {error: `Address validation failed: ${deliveryValidationResult.message}`};
        }
        if (!deliveryValidationResult.isInRange) {
            return {error: `Address is outside the delivery area: ${deliveryValidationResult.message}`};
        }
        if (!deliveryValidationResult.deliveryRegion) {
            // Should not happen if isInRange is true, but good to check
            return {error: 'Could not determine the delivery region for the address.'};
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
    // -----------------------------------------
    const productsData = await getCurrentProducts(storeId);
    const applyVat = !storeData.kor; // Use KOR status from storeData

    // Calculate item subtotal (including VAT if applicable)
    let itemsInclVat = 0;
    const cartItemsForOrder = []; // Store details for the unpaid order

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
            price: product.price, // Base price
            note: cartItem.note,
            variants: cartItem.variants,
            ingredients: product.ingredients,
            allergies: product.allergies,
            image: product.picture,
            unitAmount: calculateItemTotalPrice(cartItem.variants, product.price), // Price per unit incl VAT
            itemTotalInclVat: itemTotalInclVat // Total for this line incl VAT
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

    // Check against minimum order amount (based on items subtotal *before* delivery fee)
    if (itemsInclVat < minimumOrderAmount) {
        return { error: `Minimum order amount is ${formatCurrency(minimumOrderAmount)}. Current items total is ${formatCurrency(itemsInclVat)}.` };
    }

    // Calculate final totals using the updated function
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

    // 8. Prepare Stripe Line Items (Prices EXCLUDING VAT)
    // ---------------------------------------------------
    const stripeLineItems = [];
    const stripeTaxRateId = applyVat ? (await stripe.taxRates.create({
        display_name: 'VAT',
        description: 'TAX',
        jurisdiction: storeData.region,
        percentage: 9.0, // Assuming 9%
        inclusive: false, // Prices we provide are *exclusive* of tax
    })).id : undefined;

    for (const cartItem of cartItemsForOrder) {
        const product = productsData[cartItem.id]; // Get product again
        if (!product) continue; 

        // Calculate price PER UNIT, excluding VAT
        const unitPriceExclVat = calculateTotals(cartItem.unitAmount, applyVat, 0, selectedRegion?.isStoreDelivery || false).itemExclVat;

        stripeLineItems.push({
            price_data: {
                currency: storeData.currency,
                product_data: {
                    name: cartItem.name,
                    description: product.description || undefined, // Optional
                    images: product.picture ? [product.picture] : [], // Optional
                },
                unit_amount: unitPriceExclVat, // Price per item EXCL VAT
            },
            quantity: cartItem.qty,
            tax_rates: stripeTaxRateId ? [stripeTaxRateId] : undefined,
        });
    }

    // Add delivery fee as a separate line item if applicable (EXCLUDING VAT)
    if (isDelivery && deliveryFeeInclVat > 0) {
        // Calculate delivery tax rate
        let deliveryTaxRates: string[] | undefined;
        if (applyVat || !selectedRegion?.isStoreDelivery) {
            const deliveryTaxRate = await stripe.taxRates.create({
                display_name: 'VAT',
                description: 'TAX',
                jurisdiction: storeData.region,
                percentage: 21.0,
                inclusive: false,
            });
            deliveryTaxRates = [deliveryTaxRate.id];
        }

        stripeLineItems.push({
            price_data: {
                currency: storeData.currency,
                product_data: {
                    name: 'Delivery Fee',
                },
                unit_amount: deliveryFeeExclVat, // Delivery fee EXCL VAT
            },
            quantity: 1,
            tax_rates: deliveryTaxRates
        });
    }
    
    // Add Service Fee if needed (Example - assuming SERVICE_FEE_CENTS is defined)
    if (serviceFeeExclVat > 0) {
        const serviceTaxRate = await stripe.taxRates.create({
            display_name: 'VAT',
            description: 'TAX',
            jurisdiction: storeData.region,
            percentage: 21.0,
            inclusive: false,
        });

        stripeLineItems.push({
            price_data: {
                currency: storeData.currency,
                product_data: {
                    name: 'Service Fee',
                },
                unit_amount: serviceFeeExclVat,
            },
            quantity: 1,
            tax_rates: [serviceTaxRate.id],
        });
    }

    // Calculate the transfer amount to the connected account
    let transferAmount = itemsInclVat;
    if (isDelivery && deliveryFeeInclVat > 0 && selectedRegion?.isStoreDelivery) {
        transferAmount += deliveryFeeInclVat; // Include delivery fee in the transfer amount
    }
    const totalTransferAmount = transferAmount;
    const applicationFee = calculateApplicationFee(
        totalTransferAmount, 
        selectedRegion?.isStoreDelivery || true, 
        storeData.custom_app_fee, 
        storeData.custom_delivery_fee
    );
    const transferAmountAfterFee = totalTransferAmount - applicationFee;


    // 9. Create Unpaid Order Record
    // ------------------------------
    const cosmosId = uuidv4();
    // Create the order record with proper typing
    const orderRecordForDb: ExtendedOrderRaw = {
        id: cosmosId,
        store_id: storeId,
        store_name: storeData.ownerName || "Bakery",
        createdAt: new Date(),
        scheduled_time: selectedTime, // Use the validated time
        customer_email: (user && user.role !== 'bakerz') ? user.email : undefined,
        productsData: cartItemsForOrder, // Use the detailed cart items
        orderNote: orderNote, // Add the order note
        // Add extra fields needed internally or for Stripe metadata
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
            amount: transferAmount, // Amount to transfer to the connected account
            app_fee: applicationFee
        }],
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
            currency: storeData.currency,
            payment_method_types: ['ideal', 'card', 'klarna', 'bancontact', 'revolut_pay'],
            return_url: `${origin}/api/pay?session_id={CHECKOUT_SESSION_ID}&store_id=${storeId}&store_stripe_account_id=${storeStripeAccountId}&order_id=${cosmosId}`,
            automatic_tax: { enabled: false }, // We specify tax rates manually
            payment_intent_data: {
                transfer_data: {
                    destination: storeStripeAccountId,
                    amount: transferAmountAfterFee // Amount to transfer to the connected account
                },
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