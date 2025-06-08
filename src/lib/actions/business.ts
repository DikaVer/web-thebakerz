'use server';
import {connectionPool} from "@/db";
import { StoreBusinessData } from "@/lib/actions/store";

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