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

export async function updateDeliveryAddress(
    storeId: string, 
    address: {
        street: string,
        houseNumber: string,
        city: string,
        zipCode: string,
        additionalInfo?: string
    }
) {
    "use server";
    
    // Here you would store the delivery address in the database or session
    // For now, we'll just store it in a cookie
    
    const cookieStore = await cookies();
    cookieStore.set(`delivery_address_${storeId}`, JSON.stringify(address), {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return { success: true };
}
