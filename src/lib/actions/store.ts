import {connectionPool} from "@/db";
import {getScheduleById, WorkHours} from "@/lib/actions/calendar-actions";

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
            s.facebook_url,
            s.instagram_url
             FROM stores s
             JOIN users u ON s.user_id = u.id
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

        const storeData: StoreData = {
            id: storeRow.id,
            storeName: storeRow.nickname,
            description: storeRow.description,
            phone: storeRow.phone,
            picture: storeRow.picture,
            ownerName: storeRow.ownerName,
            instagram_url: storeRow.instagram_url,
            facebook_url: storeRow.facebook_url,
            location,  // This is of type LocationData
            schedule,
        };

        return storeData;
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

export const getCurrentStore = async (id: string): Promise<StoreData> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store`, {
        headers: {
            'Store-Id': id,
        },
        next: {tags: ['store']}
    }).then(res => res.json());
};


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

export interface StoreData {
    id: string;
    storeName?: string;
    description?: string;
    phone?: string;
    instagram_url?: string;
    facebook_url?: string;
    picture?: string;
    ownerName?: string;
    location: LocationData;
    schedule?: WorkHours;
}

export interface LocationData {
    route: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    zipCode: string;
}