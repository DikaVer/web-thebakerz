// File: @/lib/actions/profile-db.ts
import { connectionPool } from "@/db";

// Update the user record with the new name and picture
export async function updateUserProfile(
    name: string,
    id: string
): Promise<any> {
    try {
        const result = await connectionPool.query(
            `UPDATE users SET name = $1 WHERE id = $2 RETURNING id`,
            [name, id]
        );
        if (result.rows.length === 0) {
            throw new Error("User not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update user.");
    }
}

// Update the store record (only for bakerz) with storeName, description, and phone
export async function updateStoreProfile(
    storeName: string,
    description: string,
    id: string
): Promise<any> {
    try {
        const result = await connectionPool.query(
            `UPDATE stores
       SET nickname = $1, description = $2
       WHERE user_id = $3
       RETURNING id`,
            [storeName, description, id]
        );
        if (result.rows.length === 0) {
            throw new Error("Store not found");
        }

        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to update store.");
    }
}
