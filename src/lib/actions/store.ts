'use server';
import {connectionPool} from "@/db";
import {getScheduleById, WorkHours} from "@/lib/actions/calendar-actions";
import {getCurrentSession} from "@/lib/actions/session";
import { DeliveryRange, getMerchantDeliveryRegions, MerchantDeliveryRegion } from "@/lib/actions/delivery-actions";
import {revalidateTag} from "next/cache";
import { haversineDistance } from "../utils";
import { stripe } from "@/stripe";
import { logger } from "../logger";
import { getTotalFavoritesStore, getTotalFavoritesStoreProduct } from "./favorites";

export async function getStoreDataByStoreNameOrId(id: string): Promise<StoreData | null> {
    try {
        // Query the stores table for the store profile, joining with the users table
        // to get the owner's name and picture.
        const storeResult = await connectionPool.query(
            `SELECT s.id,
                    s.user_id,
                    s.nickname,
                    s.description,
                    s.phone,
                    u.image AS picture,
                    s.background,
                    u.name AS "ownerName",
                    u.email AS email,
                    s.facebook_url,
                    s.instagram_url,
                    s.slug,
                    s.stripe_id,
                    s.min_time_order,
                    s.delivery_option,
                    s.hide_phone,
                    s.hide_street,
                    COALESCE(bs.kor, false) AS kor,
                    s.region as region,
                    s.currency as currency,
                    s.pickup_window as pickup_window,
                    sl.house_number as house_number,
                    sl.route as route,
                    sl.city as city,
                    sl.zip_code as zip_code,
                    sl.country as country,
                    sl.latitude as latitude,
                    sl.longitude as longitude
             FROM stores s
                      JOIN users u ON s.user_id = u.id
                      JOIN store_locations sl ON s.id = sl.store_id
                      LEFT JOIN business_acc bs ON bs.user_id = s.user_id
             WHERE (LOWER(s.nickname) = LOWER($1) OR s.id = $1)
               AND s.deleted = false`,
            [id]
        );

        if (storeResult.rows.length === 0) {
            return null;
        }

        const storeRow = storeResult.rows[0];

        let schedule: WorkHours | undefined = undefined;

        await getScheduleById(storeRow.id, storeRow.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));

        // Fetch delivery regions
        let deliveryRegions: MerchantDeliveryRegion[] = [];
        try {
            // Get delivery regions from Cosmos DB
            deliveryRegions = await getMerchantDeliveryRegions(storeRow.id);
        } catch (error) {
            console.error("Error fetching delivery regions:", error);
            // Continue with empty array if delivery regions can't be fetched
        }

        const isStripeValid = await validateStripeAccount(storeRow.stripe_id);

        const totalLikes = await getTotalFavoritesStore(storeRow.id);

        const totalLikesProduct = await getTotalFavoritesStoreProduct(storeRow.id);

        return {
            id: storeRow.id,
            user_id: storeRow.user_id,
            kor: storeRow.kor,
            region: storeRow.region,
            currency: storeRow.currency,
            storeName: storeRow.nickname,
            description: storeRow.description,
            phone: storeRow.hide_phone ? "" : storeRow.phone,
            email: storeRow.email,
            picture: storeRow.picture,
            background: storeRow.background,
            ownerName: storeRow.ownerName,
            instagram_url: storeRow.instagram_url,
            facebook_url: storeRow.facebook_url,
            slug: storeRow.slug,
            stripe_id: storeRow.stripe_id,
            minTimeOrder: storeRow.min_time_order,
            pickupWindow: storeRow.pickup_window,
            deliveryOption: storeRow.delivery_option,
            isStripeValid: isStripeValid,
            hide_phone: storeRow.hide_phone,
            hide_street: storeRow.hide_street,
            location: {
                house_number: storeRow.hide_street ? "" : storeRow.house_number,
                route: storeRow.route,
                city: storeRow.city,
                zipCode: storeRow.zip_code,
                country: storeRow.country,
                latitude: storeRow.latitude,
                longitude: storeRow.longitude,
            },
            schedule,
            deliveryRegions,
            totalLikes: totalLikes,
            totalLikesProduct: totalLikesProduct
        };
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

export async function validateStripeAccount(stripeId: string): Promise<boolean> {
    try {
        if (!stripeId) {
            return false;
        }
        const account = await stripe.accounts.retrieve(stripeId);
    
        return !!account;
    } catch (error) {
        console.error("Error validating Stripe account:", error);
        return false;
    }
}   



export async function updateMinOrderTime(storeId: string, minutes: number): Promise<boolean> {
    try {

        const {user} = await getCurrentSession();
        if (!user) {
            throw new Error("Store not found");
        }

        const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {
            throw new Error("Store not found");
        }

        await connectionPool.query(
            `UPDATE stores SET min_time_order = $1 WHERE id = $2 AND user_id = $3`,
            [minutes, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating minimum order time:", error);
        throw new Error("Failed to update minimum order time");
    }
}

export const getCurrentStore = async (id: string): Promise<StoreData> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store`, {
        headers: {
            'Store-Id': id,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export const getCurrentStorePayment = async (id: string): Promise<StoreDataPayment> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/payment`, {
        headers: {
            'Store-Id': id,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export async function getStoreDataPaymentByStoreNameOrId(id: string): Promise<StoreDataPayment | null> {
    try {
        // Query the stores table for the store profile, joining with the users table
        // to get the owner's name and picture.
        const storeResult = await connectionPool.query(
            `SELECT s.id,
                    s.user_id,
                    s.phone,
                    s.custom_fee,
                    s.custom_app_fee,
                    s.custom_delivery_fee,
                    u.name AS "ownerName",
                    u.email AS email,
                    s.stripe_id,
                    s.min_time_order,
                    COALESCE(bs.kor, false) AS kor,
                    s.region as region,
                    s.currency as currency,
                    bs.name as nameBusiness,
                    bs.vat as vat,
                    bs.kvk as kvk,
                    bs.bank_account as bank_account,
                    bs.location as regionBusiness,
                    ba.route,
                    ba.city,
                    ba.zip_code,
                    ba.country,
                    sl.house_number as house_number,
                    sl.route as route,
                    sl.city as city,
                    sl.zip_code as zip_code,
                    sl.country as country,
                    sl.latitude as latitude,
                    sl.longitude as longitude
             FROM stores s
                      JOIN users u ON s.user_id = u.id
                      JOIN store_locations sl ON s.id = sl.store_id
                      LEFT JOIN business_acc bs ON bs.user_id = s.user_id
                      LEFT JOIN business_address ba ON bs.business_address_id = ba.id
             WHERE (LOWER(s.nickname) = LOWER($1) OR s.id = $1)
               AND s.deleted = false`,
            [id]
        );

        if (storeResult.rows.length === 0) {
            return null;
        }

        const storeRow = storeResult.rows[0];

        let schedule: WorkHours | undefined = undefined;

        await getScheduleById(storeRow.id, storeRow.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));

        if (!schedule) {
            throw new Error("Schedule not found");
        }

        // Fetch delivery regions
        let deliveryRegions: MerchantDeliveryRegion[] = [];
        try {
            // Get delivery regions from Cosmos DB
            deliveryRegions = await getMerchantDeliveryRegions(storeRow.id);
        } catch (error) {
            console.error("Error fetching delivery regions:", error);
            // Continue with empty array if delivery regions can't be fetched
        }

        return {
            id: storeRow.id,
            user_id: storeRow.user_id,
            kor: storeRow.kor,
            region: storeRow.region,
            currency: storeRow.currency,
            custom_fee: storeRow.custom_fee,
            custom_app_fee: storeRow.custom_app_fee,
            custom_delivery_fee: storeRow.custom_delivery_fee,
            phone: storeRow.phone,
            email: storeRow.email,
            ownerName: storeRow.ownerName,
            stripe_id: storeRow.stripe_id,
            minTimeOrder: storeRow.min_time_order,
            vat: storeRow.vat,
            nameBusiness: storeRow.nameBusiness,
            kvk: storeRow.kvk,  
            bank_account: storeRow.bank_account,
            locationBusiness: {
                route: storeRow.route,
                city: storeRow.city,
                zip_code: storeRow.zip_code,
                country: storeRow.country,
            },
            regionBusiness: storeRow.regionBusiness,
            location: {
                house_number: storeRow.house_number,
                route: storeRow.route,
                city: storeRow.city,
                zipCode: storeRow.zip_code,
                country: storeRow.country,
                latitude: storeRow.latitude,
                longitude: storeRow.longitude,
            },
            schedule: schedule,    
        };
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

export const getStoreByUserIdAndStoreId = async (userId: string, storeId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    const storeResult = await connectionPool.query(
        `
            SELECT
                stores.id AS store_id,
                stores.user_id AS user_id,
                stores.nickname AS store_name,
                stores.description AS store_description,
                stores.phone AS store_phone,
                stores.facebook_url AS store_facebook_url,
                stores.instagram_url AS store_instagram_url,
                stores.background AS store_background,
                stores.slug AS slug,
                stores.min_time_order AS min_time_order,
                stores.delivery_option AS delivery_option,
                stores.hide_phone AS hide_phone,
                stores.hide_street AS hide_street,
                store_locations.house_number AS house_number,
                store_locations.route AS store_route,
                store_locations.city AS store_city,
                store_locations.zip_code AS store_zip_code,
                store_locations.country AS store_country,
                store_locations.latitude AS store_latitude,
                store_locations.longitude AS store_longitude,
                bs.kor AS kor,
                stores.region as region,
                stores.currency as currency,
                stores.pickup_window as pickup_window
            FROM stores
                     INNER JOIN store_locations ON store_locations.store_id = stores.id
                     LEFT JOIN business_acc bs ON bs.user_id = stores.user_id
            WHERE stores.user_id = $1 AND stores.id = $2
        `,
        [userId, storeId]
    );

    const rowS = storeResult.rows[0];

    let store: StoreData | null = null;
    let schedule: WorkHours | null = null;


    // Build the store object.
    if (rowS){
        // Fetch delivery regions
        let deliveryRegions: MerchantDeliveryRegion[] = [];
        try {
            // Get delivery regions from Cosmos DB
            deliveryRegions = await getMerchantDeliveryRegions(rowS.store_id);
        } catch (error) {
            console.error("Error fetching delivery regions:", error);
            // Continue with empty array if delivery regions can't be fetched
        }

        const isStripeValid = await validateStripeAccount(rowS.stripe_id);

        const totalLikes = await getTotalFavoritesStore(rowS.store_id);
        const totalLikesProduct = await getTotalFavoritesStoreProduct(rowS.store_id);


        store = {
            id: rowS.store_id,
            user_id: rowS.user_id,
            kor: rowS.kor,
            region: rowS.region,
            storeName: rowS.store_name,
            description: rowS.store_description,
            phone: rowS.hide_phone ? "" : rowS.store_phone,
            facebook_url: rowS.store_facebook_url,
            instagram_url: rowS.store_instagram_url,
            background: rowS.store_background,
            slug: rowS.slug,    
            currency: rowS.currency,
            minTimeOrder: rowS.min_time_order,
            deliveryOption: rowS.delivery_option,
            isStripeValid: isStripeValid,
            pickupWindow: rowS.pickup_window,
            hide_phone: rowS.hide_phone,
            hide_street: rowS.hide_street,
            location: {
                house_number: rowS.hide_street ? "" : rowS.house_number,
                route: rowS.store_route,
                city: rowS.store_city,
                zipCode: rowS.store_zip_code,
                country: rowS.store_country,
                latitude: rowS.store_latitude,
                longitude: rowS.store_longitude
            },
            deliveryRegions,
            totalLikes: totalLikes,
            totalLikesProduct: totalLikesProduct
        };

        await getScheduleById(store.id, store.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                    store!.schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));
    }

    return {store, schedule};
}

export const getCurrentStoreByUserIdAndStoreId = async (userId: string, storeId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${userId}/${storeId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
}


export const getStoreByUserId = async (userId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    const storeResult = await connectionPool.query(
        `
            SELECT
                stores.id AS store_id,
                stores.user_id AS user_id,
                stores.nickname AS store_name,
                stores.description AS store_description,
                stores.phone AS store_phone,
                stores.deleted AS deleted,
                stores.hidden AS hidden,
                stores.hide_phone AS hide_phone,
                stores.hide_street AS hide_street,
                u.email AS email,
                u.image AS picture,
                u.name AS "ownerName",
                stores.stripe_id,
                stores.facebook_url AS store_facebook_url,
                stores.instagram_url AS store_instagram_url,
                stores.background AS store_background,
                stores.slug AS slug,    
                stores.min_time_order AS min_time_order,
                stores.delivery_option AS delivery_option,
                store_locations.route AS store_route,
                store_locations.city AS store_city,
                store_locations.zip_code AS store_zip_code,
                store_locations.country AS store_country,
                store_locations.latitude AS store_latitude,
                store_locations.longitude AS store_longitude,
                store_locations.house_number AS house_number,
                bs.kor AS kor,
                stores.region as region,
                stores.currency as currency,
                stores.pickup_window as pickup_window
            FROM stores
                     INNER JOIN store_locations ON store_locations.store_id = stores.id
                     LEFT JOIN business_acc bs ON bs.user_id = stores.user_id
                     LEFT JOIN users u ON u.id = stores.user_id
            WHERE stores.user_id = $1
        `,
        [userId]
    );

    const rowS = storeResult.rows[0];

    let store: StoreData | null = null;
    let schedule: WorkHours | null = null;


    // Build the store object.
    if (rowS){
        // Fetch delivery regions
        let deliveryRegions: MerchantDeliveryRegion[] = [];
        try {
            // Get delivery regions from Cosmos DB
            deliveryRegions = await getMerchantDeliveryRegions(rowS.store_id);
        } catch (error) {
            console.error("Error fetching delivery regions:", error);
            // Continue with empty array if delivery regions can't be fetched
        }

        const isStripeValid = await validateStripeAccount(rowS.stripe_id);

        const totalLikes = await getTotalFavoritesStore(rowS.store_id);
        const totalLikesProduct = await getTotalFavoritesStoreProduct(rowS.store_id);

        store = {
            id: rowS.store_id,
            user_id: rowS.user_id,
            kor: rowS.kor,
            region: rowS.region,
            storeName: rowS.store_name,
            ownerName: rowS.ownerName,
            picture: rowS.picture,
            background: rowS.store_background,
            description: rowS.store_description,
            phone: rowS.hide_phone ? "" : rowS.store_phone,
            email: rowS.email,
            deleted: rowS.deleted,
            hidden: rowS.hidden,
            stripe_id: rowS.stripe_id,
            isStripeValid: isStripeValid,
            facebook_url: rowS.store_facebook_url,
            instagram_url: rowS.store_instagram_url,
            slug: rowS.slug,
            currency: rowS.currency,
            minTimeOrder: rowS.min_time_order,
            pickupWindow: rowS.pickup_window,
            deliveryOption: rowS.delivery_option,
            hide_phone: rowS.hide_phone,
            hide_street: rowS.hide_street,
            location: {
                house_number: rowS.hide_street ? "" : rowS.house_number,
                route: rowS.store_route,
                city: rowS.store_city,
                zipCode: rowS.store_zip_code,
                country: rowS.store_country,
                latitude: rowS.store_latitude,
                longitude: rowS.store_longitude
            },
            deliveryRegions,
            totalLikes: totalLikes,
            totalLikesProduct: totalLikesProduct
        };

        await getScheduleById(store.id, store.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                    store!.schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));
    }

    return {store, schedule};
}

export const getCurrentStoreByUserId = async (userId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${userId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
}

export async function getBusinessStoreData(id: string): Promise<StoreBusinessData | null> {
    try {
        // Query the business_store table joined with business_address.
        const result = await connectionPool.query(
            `SELECT 
                bs.id,
                bs.user_id,
                bs.name,
                bs.vat,
                bs.kor,
                bs.kvk,
                bs.bank_account,
                ba.route,
                ba.city,
                ba.zip_code,
                ba.country,
                bs.location
             FROM business_acc bs
             JOIN business_address ba ON bs.business_address_id = ba.id
             JOIN stores s ON bs.user_id = s.user_id
             WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id.toString(),
            kor: row.kor,
            user_id: row.user_id,
            name: row.name,
            vat: row.vat,
            kvk: row.kvk,
            bank_account: row.bank_account,
            location: {
                route: row.route,
                city: row.city,
                zip_code: row.zip_code,
                country: row.country,
            },
            region: row.location,
        };
    } catch (error) {
        console.error("Error fetching business store data:", error);
        throw new Error("Failed to fetch business store data");
    }
}

export async function getBusinessByUserId(id: string): Promise<StoreBusinessData | null> {
    try {
        // Query the business_store table joined with business_address.
        const result = await connectionPool.query(
            `SELECT 
                bs.id,
                bs.user_id,
                bs.name,
                bs.vat,
                bs.kor,
                bs.kvk,
                bs.bank_account,
                ba.route,
                ba.city,
                ba.zip_code,
                ba.country,
                bs.location
             FROM business_acc bs
             JOIN business_address ba ON bs.business_address_id = ba.id
             WHERE bs.user_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id.toString(),
            kor: row.kor,
            user_id: row.user_id,
            name: row.name,
            vat: row.vat,
            kvk: row.kvk,
            bank_account: row.bank_account,
            location: {
                route: row.route,
                city: row.city,
                zip_code: row.zip_code,
                country: row.country,
            },
            region: row.location,
        };
    } catch (error) {
        console.error("Error fetching business store data:", error);
        throw new Error("Failed to fetch business store data");
    }
}

export const getCurrentBusinessStore = async (id: string): Promise<StoreBusinessData > => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/business`, {
        headers: {
            'Store-Id': id,
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export interface StoreBusinessData {
    id: string;
    user_id: string;
    kor: boolean;
    name: string;
    vat: string;
    kvk: string;
    bank_account: string;
    location: LocationBusiness;
    region: string;
}

export interface LocationBusiness {
    route: string;
    city: string;
    zip_code: string;
    country: string;
}

export interface LocationData {
    route: string;
    house_number: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    zipCode: string;
}

export interface StoreData {
    id: string;
    user_id: string;
    kor: boolean;
    region: string;
    currency: string;
    storeName?: string;
    description?: string;
    email?: string;
    phone?: string;
    instagram_url?: string;
    facebook_url?: string;
    picture?: string;
    background?: string;
    ownerName?: string;
    slug?: string;
    stripe_id?: string;
    minTimeOrder: number;
    pickupWindow: number;
    deleted?: boolean;
    hidden?: boolean;
    hide_phone: boolean;
    hide_street: boolean;
    location: LocationData;
    schedule?: WorkHours;
    deliveryRegions: MerchantDeliveryRegion[];
    deliveryOption?: 'pickup' | 'delivery' | 'multi';
    isStripeValid?: boolean;
    totalLikes: number;
    totalLikesProduct: number;
}

export interface StoreDataPayment {
    id: string;
    user_id: string;
    kor: boolean;
    region: string;
    currency: string;
    custom_fee: boolean;
    custom_app_fee: number;
    custom_delivery_fee: number;
    email: string;
    phone?: string;
    ownerName: string;
    stripe_id?: string;
    minTimeOrder: number;
    location: LocationData;
    schedule: WorkHours;
    vat: string;
    nameBusiness: string;
    kvk: string;
    bank_account: string;
    locationBusiness: LocationBusiness;
    regionBusiness: string;
}

export async function updateStoreDeliveryOptions(storeId: string, deliveryOption: 'pickup' | 'delivery' | 'multi'): Promise<boolean> {
    try {

        const {user} = await getCurrentSession();
        if (!user) {
            throw new Error("Store not found");
        }

        const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {
            throw new Error("Store not found");
        }

        // Update the store's delivery option in the database
        await connectionPool.query(
            `UPDATE stores SET delivery_option = $1 WHERE id = $2 AND user_id = $3`,
            [deliveryOption, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating store delivery options:", error);
        throw new Error("Failed to update store delivery options");
    }
}

export interface NearbyStore extends StoreData {
    distance: number; // Distance in kilometers from the search location
    deliveryRange?: DeliveryRange;
    deliveryRegion?: MerchantDeliveryRegion;
    isUserCord: boolean;
}

export async function findNearbyStores(userLat: number, userLng: number, deliveryMode: 'pickup' | 'delivery', isUserCord: boolean, country?: string): Promise<NearbyStore[]> {
    try {
        // Fetch all active stores and their locations
        const storeResults = await connectionPool.query(
            `SELECT
                s.id,
                s.user_id,
                s.nickname,
                s.description,
                s.phone,
                s.hide_phone,
                s.hide_street,
                u.image AS picture,
                u.name AS "ownerName",
                u.email AS email,
                s.facebook_url,
                s.instagram_url,
                s.slug,
                s.stripe_id,
                s.min_time_order,
                s.pickup_window,
                s.delivery_option,
                COALESCE(bs.kor, false) AS kor,
                s.region as region,
                s.currency as currency,
                sl.house_number,
                sl.route,
                sl.city,
                sl.country,
                sl.latitude,
                sl.longitude,
                sl.zip_code,
                s.background
             FROM stores s
             JOIN users u ON s.user_id = u.id
             JOIN store_locations sl ON s.id = sl.store_id
             LEFT JOIN business_acc bs ON bs.user_id = s.user_id
             WHERE s.deleted = false AND s.hidden = false`
        );

        const nearbyStores: NearbyStore[] = [];

        for (const storeRow of storeResults.rows) {
            const storeLat = storeRow.latitude;
            const storeLng = storeRow.longitude;

            // Calculate distance
            const distance = haversineDistance({ lat: userLat, lng: userLng }, { lat: storeLat, lng: storeLng });

            let deliveryRegions: MerchantDeliveryRegion[] = [];
            if ((storeRow.delivery_option === 'delivery' || storeRow.delivery_option === 'multi') && deliveryMode === 'delivery') {
                try {
                    deliveryRegions = await getMerchantDeliveryRegions(storeRow.id);
                } catch (error) {
                    console.error(`Error fetching delivery regions for store ${storeRow.id}:`, error);
                }
            }

            const totalLikes = await getTotalFavoritesStore(storeRow.id);
            const totalLikesProduct = await getTotalFavoritesStoreProduct(storeRow.id);

            let schedule: WorkHours | undefined = undefined;
            await getScheduleById(storeRow.id, storeRow.id)
                .then((item) => {
                    if(item?.schedule){
                        schedule = item.schedule;
                    }
                })
                .catch((error) => console.error("Error reading item:", error));


            const storeData: StoreData = {
                id: storeRow.id,
                user_id: storeRow.user_id,
                kor: storeRow.kor,
                region: storeRow.region,
                currency: storeRow.currency,
                storeName: storeRow.nickname,
                description: storeRow.description,
                phone: storeRow.hide_phone ? "" : storeRow.phone,
                email: storeRow.email,
                picture: storeRow.picture,
                ownerName: storeRow.ownerName,
                instagram_url: storeRow.instagram_url,
                facebook_url: storeRow.facebook_url,
                slug: storeRow.slug,
                stripe_id: storeRow.stripe_id,
                minTimeOrder: storeRow.min_time_order,
                pickupWindow: storeRow.pickup_window,
                deliveryOption: storeRow.delivery_option,
                hide_phone: storeRow.hide_phone,
                hide_street: storeRow.hide_street, 
                location: {
                    house_number: storeRow.hide_street ? "" : storeRow.house_number,
                    route: storeRow.route,
                    city: storeRow.city,
                    country: storeRow.country,
                    latitude: storeLat,
                    longitude: storeLng,
                    zipCode: storeRow.zip_code,
                }, 
                deliveryRegions: deliveryRegions,
                schedule: schedule,
                background: storeRow.background,
                totalLikes: totalLikes,
                totalLikesProduct: totalLikesProduct
            };

            // Filter based on delivery mode
            if (deliveryMode === 'pickup' || !isUserCord) {
                // Include if store offers pickup or multi
                if (storeData.deliveryOption === 'pickup' || storeData.deliveryOption === 'multi') {
                    nearbyStores.push({ ...storeData, distance, isUserCord });
                }
            } else { // deliveryMode === 'delivery'
                // Include if store offers delivery or multi AND user is within a delivery range
                if (storeData.deliveryOption === 'delivery' || storeData.deliveryOption === 'multi') {
                    let closestRange = Infinity;
            
                    let regionFound = false;
                    let deliveryRange: DeliveryRange | undefined = undefined;
                    let deliveryRegion: MerchantDeliveryRegion | undefined = undefined;
                    
                    if (storeData.deliveryRegions && storeData.deliveryRegions.length > 0) {
                        // Store country region as fallback
                        let countryRegion: MerchantDeliveryRegion | undefined = undefined;
                        let countryDeliveryRange: DeliveryRange | undefined = undefined;
                        
                        // Check all ranges to find the closest city delivery first
                        for (const region of storeData.deliveryRegions) {
                            // Store country-wide delivery as fallback
                            if (region.isCountry && country && 
                                region.name.toLowerCase() === country.toLowerCase()) {
                                countryRegion = region;
                                countryDeliveryRange = {
                                    range: Infinity, // No distance limit for country delivery
                                    deliveryPriceInCents: region.deliveryPriceInCents || 0,
                                    minOrderPriceInCents: region.minOrderPriceInCents || 0,
                                    deliveryWindow: region.deliveryWindow || 0
                                };
                            }
                            
                            // Prioritize city/region based delivery with coordinates
                            if (region.coordinates) {
                                const distanceDelivery = haversineDistance(
                                    { lat: userLat, lng: userLng }, 
                                    { lat: region.coordinates.lat, lng: region.coordinates.lng }
                                );
                                
                                if(region.ranges && region.ranges.length > 0) {
                                    for (const range of region.ranges) {
                                        if(distanceDelivery < range.range) {
                                            if(distanceDelivery < closestRange) {
                                                closestRange = distanceDelivery;
                                                deliveryRange = range;
                                                deliveryRegion = region;
                                                regionFound = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If no city delivery was found, fall back to country delivery
                        if (!regionFound && countryRegion && countryDeliveryRange) {
                            regionFound = true;
                            deliveryRegion = countryRegion;
                            deliveryRange = countryDeliveryRange;
                        }
                    }

                    if (regionFound) {
                        nearbyStores.push({ 
                            ...storeData, 
                            distance: distance,
                            deliveryRegion: deliveryRegion,
                            deliveryRange: deliveryRange,
                            isUserCord: isUserCord
                        });
                    }
                }
            }
        }

        // Sort stores by distance (closest first)
        nearbyStores.sort((a, b) => a.distance - b.distance);

        return nearbyStores;

    } catch (error) {
        console.error("Error finding nearby stores:", error);
        throw new Error("Failed to find nearby stores");
    }
}

export async function updateStoreBackground(storeId: string, file: File): Promise<boolean> {
    try {
        const {user} = await getCurrentSession();
        if (!user) {
            throw new Error("User not found");
        }

        const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {
            throw new Error("Store not found");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("container", "background");
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`, {
            method: "POST",
            body: formData,
            headers: {
                'Store-Id': store.id,
                'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
            },
        });
        
        if (!response.ok) {
            throw new Error("Failed to upload image");
        }
        
        const data = await response.json();

        logger.debug("store", store.id);
        logger.debug("user", user.id);

        // Update the store's background image in the database
        await connectionPool.query(
            `UPDATE stores SET background = $1 WHERE id = $2 AND user_id = $3`,
            [data.url, store.id, user.id]
        );

        console.log(data.url);

        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating store background image:", error);
        throw new Error("Failed to update store background image");
    }
}

export async function updatePickupWindow(storeId: string, minutes: number): Promise<boolean> {
    try {
        const {user} = await getCurrentSession();
        if (!user) {
            throw new Error("Store not found");
        }

        const { store } = await getCurrentStoreByUserIdAndStoreId(user.id, storeId);
        if (!store) {
            throw new Error("Store not found");
        }

        await connectionPool.query(
            `UPDATE stores SET pickup_window = $1 WHERE id = $2 AND user_id = $3`,
            [minutes, store.id, user.id]
        );

        revalidateTag('store');
        return true;
    } catch (error) {
        logger.error("Error updating pickup window:", error instanceof Error ? error.message : String(error));
        throw new Error("Failed to update pickup window");
    }
}