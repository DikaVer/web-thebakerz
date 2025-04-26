"use server";
import { cookies } from 'next/headers';

//Remove cookies
export async function removeOrderTime(storeId: string) {
    const cookieStore = await cookies();
    cookieStore.delete(`orderDate_${storeId}`);
    cookieStore.delete(`orderTime_${storeId}`);
}

export async function removeDeliveryTime(storeId: string, location: string) {
    const cookieStore = await cookies();
    cookieStore.delete(`deliveryDate_${storeId}_${location}`);
    cookieStore.delete(`deliveryTime_${storeId}_${location}`);
}

export async function updateOrderTime(storeId: string, date: string, time: string) {
    const cookieStore = await cookies();

    cookieStore.set(`orderDate_${storeId}`, date, {
        httpOnly: false,
        maxAge: 3600 // Expire after 1 hour (3600 seconds)
    });
    cookieStore.set(`orderTime_${storeId}`, time, {
        httpOnly: false,
        maxAge: 3600 // Expire after 1 hour (3600 seconds)
    });
}

export async function updateDeliveryTime(storeId: string, date: string, time: string, location: string) {
    const cookieStore = await cookies();

    cookieStore.set(`deliveryDate_${storeId}_${location}`, date, {
        httpOnly: false,
        maxAge: 3600 // Expire after 1 hour (3600 seconds)
    });
    cookieStore.set(`deliveryTime_${storeId}_${location}`, time, {
        httpOnly: false,
        maxAge: 3600 // Expire after 1 hour (3600 seconds)
    });
}

export async function getOrderTime(storeId: string) {
    const cookieStore = await cookies();

    return {
        date: cookieStore.get(`orderDate_${storeId}`)?.value ?? null,
        time: cookieStore.get(`orderTime_${storeId}`)?.value ?? null
    }
}

export async function getDeliveryTime(storeId: string, location: string) {
    const cookieStore = await cookies();

    return {
        date: cookieStore.get(`deliveryDate_${storeId}_${location}`)?.value ?? null,
        time: cookieStore.get(`deliveryTime_${storeId}_${location}`)?.value ?? null
    }
}


