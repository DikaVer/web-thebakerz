import {connectionPool} from "@/db";

export async function createUser(email: string): Promise<User> {
    try {
        const emailSplit = email.split("@")
        const username = emailSplit[0]

        const result = await connectionPool.query(
            `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id`,
            [email, username]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];
        const user: User = {
            id: row.id,
            username,
            email,
            emailVerified: false,
            role: row.role
        };

        return user;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create user.');
    }
}

export async function createUserGoogle(
    googleId: string,
    email: string,
    name: string,
    picture: string
): Promise<User> {
    try {
        const result = await connectionPool.query(
            `
      INSERT INTO users (google_id, email, name, image, email_verified)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, role, email_verified
      `,
            [googleId, email, name, picture]
        );

        if (result.rows.length === 0) {
            throw new Error("Unexpected error");
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id, // id is returned as a string
            googleId,
            email,
            username: name,
            picture,
            role: row.role,
            emailVerified: row.email_verified !== null
        };

        return user;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create user");
    }
}

export async function getUserFromGoogleId(googleId: string): Promise<User | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, google_id, email, name, image AS picture, role
      FROM users
      WHERE google_id = $1
      `,
            [googleId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id,
            googleId: row.google_id,
            email: row.email,
            username: row.name,
            picture: row.picture,
            role: row.role,
            emailVerified: row.email_verified !== null
        };

        return user;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get user by Google ID");
    }
}


export async function updateUserEmailAndSetEmailAsVerified(
    userId: string,
    email: string
): Promise<void> {
    try {
        await connectionPool.query(
            `
      UPDATE users
      SET email = $1, email_verified = NOW()
      WHERE id = $2
      `,
            [email, userId]
        );
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update user email and verify email.');
    }
}

/**
 * Sets the user's email as verified (by setting "emailVerified" to NOW())
 * only if the provided email matches the one in the database.
 * Returns true if a row was updated, false otherwise.
 */
export async function setUserAsEmailVerifiedIfEmailMatches(
    userId: string,
    email: string
): Promise<boolean> {
    try {
        const result = await connectionPool.query(
            `
      UPDATE users
      SET email_verified = NOW()
      WHERE id = $1 AND email = $2
      `,
            [userId, email]
        );
        return result.rowCount > 0;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to set user as email verified.');
    }
}

/**
 * Retrieves a user by email.
 * Maps the "name" column from the database to the username property.
 * Treats a non-null "emailVerified" timestamp as a verified email.
 */
export async function getUserFromEmail(email: string): Promise<User | null> {
    try {
        const result = await connectionPool.query(
            `
      SELECT id, email, name AS username, email_verified, role
      FROM users
      WHERE email = $1
      `,
            [email]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const user: User = {
            id: row.id,
            email: row.email,
            username: row.username,
            emailVerified: row.email_verified !== null, // if a timestamp exists, the email is verified
            role: row.role,
        };

        return user;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to get user by email.');
    }
}

export async function isStoreNicknameExist(nickname: string): Promise<Boolean> {
    try {
        const result = await connectionPool.query(
            `
      SELECT 
        id
      FROM stores
      WHERE nickname = $1
      `,
            [nickname]
        );

        if (result.rows.length === 0) {
            return false;
        } else {
            return true;
        }

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to get user by email.');
    }
}

export async function getProfileData(userId: string): Promise<ProfileData> {
    try {
        // Query the users table.
        const result = await connectionPool.query(
            `SELECT image as picture, name, email, role FROM users WHERE id = $1 AND deleted = false`,
            [userId]
        );

        if (result.rows.length === 0) {
            throw new Error("User not found");
        }

        const userRow = result.rows[0];
        const profileData: ProfileData = {
            picture: userRow.picture,
            name: userRow.name,
            email: userRow.email,
            role: userRow.role,
        };

        // If the user's role is bakerz, get the store profile details.
        if (userRow.role === "bakerz") {
            const storeData = await getStoreData(userId);
            profileData.storeData = storeData;

            // Format the location data into a string.
            const loc = storeData.location;
            if (loc.route && loc.city && loc.country && loc.zipCode) {
                profileData.location = `${loc.route}, ${loc.city}, ${loc.zipCode}, ${loc.country}`;
            }
        }

        return profileData;
    } catch (error) {
        console.error("Error fetching profile data:", error);
        throw new Error("Failed to fetch profile data");
    }
}

export async function getStoreData(userId: string): Promise<StoreData> {
    try {
        // Query the stores table for the store profile.
        const storeResult = await connectionPool.query(
            `SELECT id, nickname, description, phone
       FROM stores
       WHERE user_id = $1 AND deleted = false`,
            [userId]
        );

        if (storeResult.rows.length === 0) {
            throw new Error("Store not found");
        }

        const storeRow = storeResult.rows[0];
        // Get the store location by calling getLocationStore.
        const location = await getLocationStore(storeRow.id);

        const storeData: StoreData = {
            id: storeRow.id,
            storeName: storeRow.nickname,
            description: storeRow.description,
            phone: storeRow.phone,
            location,  // This is of type LocationData
        };

        return storeData;
    } catch (error) {
        console.error("Error fetching store data:", error);
        throw new Error("Failed to fetch store data");
    }
}

async function getLocationStore(storeId: string): Promise<LocationData> {
    try {
        const result = await connectionPool.query(
            `SELECT route, city, country, latitude, longitude
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

export interface ProfileData {
    picture: string;
    name: string;
    email: string;
    role: string;
    // For bakerz, include store data.
    storeData?: StoreData;
    location?: string;
}

export interface StoreData {
    id: string;
    storeName: string;
    description: string;
    phone: string;
    location: LocationData;

}

export interface LocationData {
    route: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    zipCode: string;
}

export interface User {
    id: string;
    googleId?: string;
    email: string;
    username: string;
    emailVerified: boolean;
    role: string;
    picture?: string;
}
