"use server";
import {cookies} from "next/headers";

export async function updateOrderTime(storeId: string, date: string, time: string) {
    const cookieStore = await cookies();

    cookieStore.set(`orderDate_${storeId}`, date, {
        httpOnly: false
    });
    cookieStore.set(`orderTime_${storeId}`, time, {
        httpOnly: false
    });
}

export async function getOrderTime(storeId: string) {
    const cookieStore = await cookies();

    return {
        date: cookieStore.get(`orderDate_${storeId}`)?.value ?? null,
        time: cookieStore.get(`orderTime_${storeId}`)?.value ?? null
    }
}
