'use server';
import {connectionPool} from "@/db";
import {getScheduleById, WorkHours} from "@/lib/actions/calendar-actions";
import {getCurrentSession} from "@/lib/actions/session";
import { getMerchantDeliveryRegions } from "@/lib/actions/delivery-actions";
import {revalidateTag} from "next/cache";

export async function getStoreDataByStoreNameOrId(id: string): Promise<StoreData | null> {
    try {
        // Query the stores table for the store profile, joining with the users table
        // to get the owner's name and picture.
        const storeResult = await connectionPool.query(
            `SELECT s.id,
                    s.nickname,
                    s.description,
                    s.phone,
                    u.image AS picture,
                    u.name AS "ownerName",
                    u.email AS email,
                    s.facebook_url,
                    s.instagram_url,
                    s.slug,
                    s.stripe_id,
                    s.min_time_order,
                    s.delivery_option,
                    COALESCE(bs.kor, false) AS kor
             FROM stores s
                      JOIN users u ON s.user_id = u.id
                      LEFT JOIN business_store bs ON bs.store_id = s.id
             WHERE (LOWER(s.nickname) = LOWER($1) OR s.id = $1)
               AND s.deleted = false`,
            [id]
        );

        if (storeResult.rows.length === 0) {
            return null;
        }

        const storeRow = storeResult.rows[0];
        // Get the store location by calling getLocationStore.
        const location = await getLocationStore(storeRow.id);

        let schedule: WorkHours | undefined = undefined;

        await getScheduleById(storeRow.id, storeRow.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));

        // Fetch delivery locations
        let deliveryLocations: DeliveryLocation[] = [];
        try {
            // Get delivery locations from Cosmos DB
            const regions = await getMerchantDeliveryRegions(storeRow.id);
            deliveryLocations = regions.map(region => ({
                name: region.name,
                radiusKm: region.radiusKm,
                priceInCents: region.priceInCents,
                minOrderPriceInCents: region.minOrderPriceInCents,
                deliverySchedule: region.deliverySchedule
            }));
        } catch (error) {
            console.error("Error fetching delivery locations:", error);
            // Continue with empty array if delivery locations can't be fetched
        }

        return {
            id: storeRow.id,
            kor: storeRow.kor,
            storeName: storeRow.nickname,
            description: storeRow.description,
            phone: storeRow.phone,
            email: storeRow.email,
            picture: storeRow.picture,
            ownerName: storeRow.ownerName,
            instagram_url: storeRow.instagram_url,
            facebook_url: storeRow.facebook_url,
            slug: storeRow.slug,
            stripe_id: storeRow.stripe_id,
            minTimeOrder: storeRow.min_time_order,
            deliveryOption: storeRow.delivery_option,
            location,  // This is of type LocationData
            schedule,
            deliveryLocations,
        };
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

export async function updateMinOrderTime(minutes: number): Promise<boolean> {
    try {

        const {store} = await getCurrentSession();
        if (!store) {
            throw new Error("Store not found");
        }

        await connectionPool.query(
            `UPDATE stores SET min_time_order = $1 WHERE id = $2`,
            [minutes, store.id]
        );

        revalidateTag('session');
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

export const getStoreByUserId = async (userId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    const storeResult = await connectionPool.query(
        `
            SELECT
                stores.id AS store_id,
                stores.nickname AS store_name,
                stores.description AS store_description,
                stores.phone AS store_phone,
                stores.facebook_url AS store_facebook_url,
                stores.instagram_url AS store_instagram_url,
                stores.slug AS slug,
                stores.min_time_order AS min_time_order,
                stores.delivery_option AS delivery_option,
                store_locations.route AS store_route,
                store_locations.city AS store_city,
                store_locations.zip_code AS store_zip_code,
                store_locations.country AS store_country,
                store_locations.latitude AS store_latitude,
                store_locations.longitude AS store_longitude,
                bs.kor AS kor
            FROM stores
                     INNER JOIN store_locations ON store_locations.store_id = stores.id
                     LEFT JOIN business_store bs ON bs.store_id = stores.id
            WHERE stores.user_id = $1
        `,
        [userId]
    );

    const rowS = storeResult.rows[0];

    let store: StoreData | null = null;
    let schedule: WorkHours | null = null;


    // Build the store object.
    if (rowS){
        // Fetch delivery locations
        let deliveryLocations: DeliveryLocation[] = [];
        try {
            // Get delivery locations from Cosmos DB
            const regions = await getMerchantDeliveryRegions(rowS.store_id);
            deliveryLocations = regions.map(region => ({
                name: region.name,
                radiusKm: region.radiusKm,
                priceInCents: region.priceInCents,
                minOrderPriceInCents: region.minOrderPriceInCents,
                deliverySchedule: region.deliverySchedule
            }));
        } catch (error) {
            console.error("Error fetching delivery locations:", error);
            // Continue with empty array if delivery locations can't be fetched
        }

        store = {
            id: rowS.store_id,
            kor: rowS.kor,
            storeName: rowS.store_name,
            description: rowS.store_description,
            phone: rowS.store_phone,
            facebook_url: rowS.store_facebook_url,
            instagram_url: rowS.store_instagram_url,
            slug: rowS.slug,
            minTimeOrder: rowS.min_time_order,
            deliveryOption: rowS.delivery_option,
            location: {
                route: rowS.store_route,
                city: rowS.store_city,
                zipCode: rowS.store_zip_code,
                country: rowS.store_country,
                latitude: rowS.store_latitude,
                longitude: rowS.store_longitude
            },
            deliveryLocations
        };

        await getScheduleById(store.id, store.id)
            .then((item) => {
                if(item?.schedule){
                    schedule = item.schedule;
                }
            })
            .catch((error) => console.error("Error reading item:", error));
    }

    return {store, schedule};
}

export async function getBusinessStoreData(id: string): Promise<StoreBusinessData | null> {
    try {
        // Query the business_store table joined with business_address.
        const result = await connectionPool.query(
            `SELECT 
                bs.id,
                bs.store_id,
                bs.name,
                bs.vat,
                bs.kor,
                bs.kvk,
                bs.bank_account,
                ba.route,
                ba.city,
                ba.zip_code,
                ba.country
             FROM business_store bs
             JOIN business_address ba ON bs.business_address_id = ba.id
             WHERE bs.store_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            id: row.id.toString(),
            kor: row.kor,
            store_id: row.store_id,
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
        };
    } catch (error) {
        console.error("Error fetching business store data:", error);
        throw new Error("Failed to fetch business store data");
    }
}


async function getLocationStore(storeId: string): Promise<LocationData> {
    try {
        const result = await connectionPool.query(
            `SELECT route,
                    city,
                    country,
                    latitude,
                    longitude,
                    zip_code
             FROM store_locations
             WHERE store_id = $1`,
            [storeId]
        );

        if (result.rows.length === 0) {
            throw new Error("Location not found");
        }

        const row = result.rows[0];

        const locationData: LocationData = {
            route: row.route,
            city: row.city,
            country: row.country,
            latitude: row.latitude,
            longitude: row.longitude,
            zipCode: row.zip_code,
        };

        return locationData;
    } catch (error) {
        console.error("Error fetching store location:", error);
        throw new Error("Failed to fetch store location");
    }
}


export interface StoreBusinessData {
    id: string;
    store_id: string;
    kor: boolean;
    name: string;
    vat: string;
    kvk: string;
    bank_account: string;
    location: LocationBusiness;
}

export interface LocationBusiness {
    route: string;
    city: string;
    zip_code: string;
    country: string;
}

export interface StoreData {
    id: string;
    kor: boolean;
    storeName?: string;
    description?: string;
    email?: string;
    phone?: string;
    instagram_url?: string;
    facebook_url?: string;
    picture?: string;
    ownerName?: string;
    slug?: string;
    stripe_id?: string;
    minTimeOrder: number;
    location: LocationData;
    schedule?: WorkHours;
    deliveryLocations: DeliveryLocation[];
    deliveryOption?: 'pickup' | 'delivery' | 'multi';
}

export interface DeliveryLocation {
    name: string;
    radiusKm: number;
    priceInCents: number;
    minOrderPriceInCents: number;
    deliverySchedule: DeliverySchedule;
}

export interface DeliverySchedule {
    monday?: TimeRange;
    tuesday?: TimeRange;
    wednesday?: TimeRange;
    thursday?: TimeRange;
    friday?: TimeRange;
    saturday?: TimeRange;
    sunday?: TimeRange;
}

export interface TimeRange {
    isEnabled: boolean;
    start: { hour: number; minute: number };
    end: { hour: number; minute: number };
}

export interface LocationData {
    route: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    zipCode: string;
}

export async function updateStoreDeliveryOptions(deliveryOption: 'pickup' | 'delivery' | 'multi'): Promise<boolean> {
    try {

        const {store} = await getCurrentSession();
        if (!store) {
            throw new Error("Store not found");
        }

        // Update the store's delivery option in the database
        await connectionPool.query(
            `UPDATE stores SET delivery_option = $1 WHERE id = $2`,
            [deliveryOption, store.id]
        );

        revalidateTag('session');
        revalidateTag('store');
        return true;
    } catch (error) {
        console.error("Error updating store delivery options:", error);
        throw new Error("Failed to update store delivery options");
    }
}