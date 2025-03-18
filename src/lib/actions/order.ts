'use server';
import * as z from "zod";
import {CustomerOrderSchema} from "@/lib/schemas";
import {globalPOSTRateLimit} from "@/lib/actions/requests";
import {getCartSessionCookieOrCreate, getCurrentSession} from "@/lib/actions/session";
import {getCart, removeCartByUserIdAndStoreId} from "@/lib/actions/cart";
import {getOrderTime} from "@/app/(store)/[id]/actions";
import {getProductsByStoreId} from "@/lib/actions/product";
import {connectionPool, containerOrders} from "@/db";
import {sendOrderPlaced} from "@/lib/emailSendRequest";
import {revalidateTag} from "next/cache";
import {v4 as uuidv4} from "uuid";
import {calculateTax} from "@/lib/utils";
import Stripe from "stripe";
import {calculateTotals} from "@/lib/price/tax";

// Order data interface
export interface OrderData {
    id: string;
    seq_id: number;
    store_order_id: string;
    store_id: string;
    customer_email: string;
    customer: Customer;
    createdAt: Date;
    status: "paid" | "manual" ;
    scheduled_time: {
        date: string;
        time: string;
    };
    order_status: OrderStatus;
    completed: boolean;
    productsData: OrderProducts;
    tax_amount: number;
    sub_amount: number;
    amount: number;
    cancelledAt?: Date;
    refundedAt?: Date;
}

export interface OrderRaw {
    id: string;
    store_id: string;
    createdAt: Date;
    customer_email?: string;
    scheduled_time: {
        date: string;
        time: string;
    };
    productsData: OrderProducts;
}

export type OrderStatus = "new" | "started" | "ready" | "completed" | "cancelled" | 'refunded';

export type OrderProducts = Array<OrderProduct>;

export type Customer = {
    email_customer: string;
    email_verified: boolean;
    name_customer: string;
    phone_number?: string | null;
    address: Stripe.Address | null;
    payment_method?: Array<string>;
    payment_name?: string | null;
    tax_id?: string | null;
}

export type OrderProduct = {
    id: string;
    name: string;
    variants: string[];
    qty: number;
    price: number;
    const_id: string;
    ingredients: string[] | undefined;
    allergies: string[] | undefined;
}

/**
 * Creates a new order based on the customer's form data and cart contents
 *
 * This function handles the full order creation process:
 * 1. Validates customer input and cart data
 * 2. Checks rate limits, session status, and order time validity
 * 3. Creates order records in both PostgreSQL and Azure Cosmos DB using a transaction with commit and rollback
 * 4. Clears the customer's cart and sends a confirmation email
 *
 * @param {z.infer<typeof CustomerOrderSchema>} formData - Validated customer information
 * @returns {Promise<{error?: string; orderId?: string}>} Object with an error message or the created order ID
 */
export const createOrder = async (
    formData: z.infer<typeof CustomerOrderSchema>
):Promise<{error?: string; orderId?: string}> => {
  // Check rate limiting
    if (!(await globalPOSTRateLimit())) {
    return { error: "Too many requests" };
    }

  // Validate form data
    const validation = CustomerOrderSchema.safeParse(formData);
    if (!validation.success) {
        return { error: "Invalid fields!" };
    }

  // Get session, user, and store details
    const { session, user, store} = await getCurrentSession();
  const userId = (!session || !user) ? await getCartSessionCookieOrCreate() : user.id;
  if (!store) return { error: "Store not found!" };
    if (!userId) return { error: "User not found!" };

    // Retrieve the user's cart data for the current store
    const cartData = await getCart(userId, store.id);
    if (!cartData || !cartData[store.id] || Object.keys(cartData[store.id]).length === 0) {
    return { error: "Cart is empty" };
    }

  // Get scheduled order time
  const { date, time } = await getOrderTime();
  if (!date || !time) return { error: "Order time is not set" };

  // Prevent ordering for past dates
    const today = new Date();
  today.setHours(0, 0, 0, 0);
    const orderDateObj = new Date(date);
  orderDateObj.setHours(0, 0, 0, 0);
    if (orderDateObj < today) {
    return { error: "Cannot place orders for past dates" };
    }

  // Get products data and prepare cart items with subtotal calculation
    const productsData = await getProductsByStoreId(store.id);

    // Prepare cart items and calculate subtotal
    const cartItems = [];
    let amount = 0;

    for (const itemId in cartData[store.id]) {

        const cartItem = cartData[store.id][itemId];
        const product = productsData[cartItem.product_id];

        if (!product) continue;

        amount += product.price * cartItem.quantity;

        cartItems.push({
            id: product.id,
            name: product.name,
            qty: cartItem.quantity,
            price: product.price,
            variants: cartItem.note ? [cartItem.note] : [],
            const_id: product.constId,
            ingredients: product.ingredients,
            allergies: product.allergies
        });
    }


    // Generate a unique ID for the order
    const cosmosId = uuidv4();

    try {
        // Begin PostgreSQL transaction
        await connectionPool.query("BEGIN");

        // Insert order record into PostgreSQL
            const result = await connectionPool.query(
                `
                        INSERT INTO payment_orders
                        (store_id, store_order_id, email_customer, amount, product_ids, status, cosmos_id)
                        VALUES
                            (
                                $1,
                                (SELECT COALESCE(COUNT(*) + 1, 1) FROM payment_orders WHERE store_id = $7),
                                $2,
                                $3,
                                $4::text[],
                                $5,
                                $6
                            )
                            RETURNING id, order_date, store_order_id
                    `,
                [
                    store.id,
                    formData.email,
                    amount,
            cartItems.map(item => item.id || "Error"),
                    "manual",
                    cosmosId,
            store.id
                ]
            );
            if (result.rows.length === 0) {
          await connectionPool.query("ROLLBACK");
          return { error: "Failed to create order" };
            }

            // Calculate tax and adjusted amounts
            const { vat, total, subtotal } = calculateTotals(amount, !store.kor);

        // Prepare order data for Cosmos DB
            const orderData: OrderData = {
                id: cosmosId,
                seq_id: result.rows[0].id,
                store_order_id: result.rows[0].store_order_id,
                store_id: store.id,
                customer_email: formData.email,
                customer: {
                    email_customer: formData.email,
                    email_verified: false,
                    name_customer: formData.name,
                    phone_number: formData.phoneNumber,
                    address: null
                },
                createdAt: result.rows[0].order_date,
                status: "manual",
                scheduled_time: { date, time },
                order_status: "new",
                completed: false,
                productsData: cartItems,
                tax_amount: vat,
                sub_amount: subtotal,
                amount: amount,
        };

        // Create order record in Cosmos DB
          await containerOrders.items.create(orderData);

        // Clear cart, send confirmation email, and invalidate cache
          await removeCartByUserIdAndStoreId(userId, store.id);
        sendOrderPlaced({ orderData, identifier: formData.email });
        revalidateTag("orders");

        // Commit transaction
        await connectionPool.query("COMMIT");
        return { orderId: cosmosId };
    } catch (error) {
        // Rollback transaction on error
        await connectionPool.query("ROLLBACK");
        console.error("Error creating checkout session:", error);
        return { error: "Failed to create checkout session" };
    }
};

export async function getOrdersByDateRange(storeId: string, fromDate: string, toDate: string): Promise<OrderData[]> {
    try {
        const {store} = await getCurrentSession();
        if (!store || store.id !== storeId) {return [];}

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/orders/range`, {
            headers: {
                'Store-Id': store.id,
                'From-Date': fromDate,
                'To-Date': toDate,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
            next: {
                tags: ['orders'],
                revalidate: 300
            }
        });


        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return [];
    }
}


export async function updateOrderStatus(storeId: string, orderId: string, email: string, status: string): Promise<boolean> {
    try {
        const {store} = await getCurrentSession();
        if (!store || store.id !== storeId) {return false;}
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order/updateStatus`, {
            method: 'POST',
            headers: {
                'Store-Id': storeId,
                'Order-Id': orderId,
                'Email': email,
                'Status': status,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            }
        });
        return response.ok;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        return false;
    }
};



export async function getOrder(storeId: string, orderId: string, email: string): Promise<OrderData | null> {
    try {
        if (!storeId || !orderId || !email) {return null;}
        const partitionKeyValue = [storeId, email];
        const { resource: order } = await containerOrders.item(orderId, partitionKeyValue).read();
        return order ? order : null;
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

export const getCurrentOrder = async (storeId: string, orderId: string, email: string): Promise<OrderData> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/order`, {

        headers: {
            'Store-Id': storeId,
            'Order-Id': orderId,
            'Email': email,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['orders'],
            revalidate: 300
        }
    }).then(res => res.json());
};



    type Type =
        | 'ad_nrt'
        | 'ae_trn'
        | 'ar_cuit'
        | 'au_abn'
        | 'au_arn'
        | 'bg_uic'
        | 'bh_vat'
        | 'bo_tin'
        | 'br_cnpj'
        | 'br_cpf'
        | 'by_tin'
        | 'ca_bn'
        | 'ca_gst_hst'
        | 'ca_pst_bc'
        | 'ca_pst_mb'
        | 'ca_pst_sk'
        | 'ca_qst'
        | 'ch_uid'
        | 'ch_vat'
        | 'cl_tin'
        | 'cn_tin'
        | 'co_nit'
        | 'cr_tin'
        | 'de_stn'
        | 'do_rcn'
        | 'ec_ruc'
        | 'eg_tin'
        | 'es_cif'
        | 'eu_oss_vat'
        | 'eu_vat'
        | 'gb_vat'
        | 'ge_vat'
        | 'hk_br'
        | 'hr_oib'
        | 'hu_tin'
        | 'id_npwp'
        | 'il_vat'
        | 'in_gst'
        | 'is_vat'
        | 'jp_cn'
        | 'jp_rn'
        | 'jp_trn'
        | 'ke_pin'
        | 'kr_brn'
        | 'kz_bin'
        | 'li_uid'
        | 'li_vat'
        | 'ma_vat'
        | 'md_vat'
        | 'mx_rfc'
        | 'my_frp'
        | 'my_itn'
        | 'my_sst'
        | 'ng_tin'
        | 'no_vat'
        | 'no_voec'
        | 'nz_gst'
        | 'om_vat'
        | 'pe_ruc'
        | 'ph_tin'
        | 'ro_tin'
        | 'rs_pib'
        | 'ru_inn'
        | 'ru_kpp'
        | 'sa_vat'
        | 'sg_gst'
        | 'sg_uen'
        | 'si_tin'
        | 'sv_nit'
        | 'th_vat'
        | 'tr_tin'
        | 'tw_vat'
        | 'tz_vat'
        | 'ua_vat'
        | 'unknown'
        | 'us_ein'
        | 'uy_ruc'
        | 'uz_tin'
        | 'uz_vat'
        | 've_rif'
        | 'vn_tin'
        | 'za_vat';


interface TaxId {
    /**
     * The type of the tax ID, one of `ad_nrt`, `ar_cuit`, `eu_vat`, `bo_tin`, `br_cnpj`, `br_cpf`, `cn_tin`, `co_nit`, `cr_tin`, `do_rcn`, `ec_ruc`, `eu_oss_vat`, `hr_oib`, `pe_ruc`, `ro_tin`, `rs_pib`, `sv_nit`, `uy_ruc`, `ve_rif`, `vn_tin`, `gb_vat`, `nz_gst`, `au_abn`, `au_arn`, `in_gst`, `no_vat`, `no_voec`, `za_vat`, `ch_vat`, `mx_rfc`, `sg_uen`, `ru_inn`, `ru_kpp`, `ca_bn`, `hk_br`, `es_cif`, `tw_vat`, `th_vat`, `jp_cn`, `jp_rn`, `jp_trn`, `li_uid`, `li_vat`, `my_itn`, `us_ein`, `kr_brn`, `ca_qst`, `ca_gst_hst`, `ca_pst_bc`, `ca_pst_mb`, `ca_pst_sk`, `my_sst`, `sg_gst`, `ae_trn`, `cl_tin`, `sa_vat`, `id_npwp`, `my_frp`, `il_vat`, `ge_vat`, `ua_vat`, `is_vat`, `bg_uic`, `hu_tin`, `si_tin`, `ke_pin`, `tr_tin`, `eg_tin`, `ph_tin`, `bh_vat`, `kz_bin`, `ng_tin`, `om_vat`, `de_stn`, `ch_uid`, `tz_vat`, `uz_vat`, `uz_tin`, `md_vat`, `ma_vat`, `by_tin`, or `unknown`
     */
    type: Type;

    /**
     * The value of the tax ID.
     */
    value: string | null;
}