"use server";
import { cookies } from 'next/headers';

export async function updateOrderTime(storeId: string, date: string, time: string) {
    const cookieStore = await cookies();

    cookieStore.set(`orderDate_${storeId}`, date, {
        httpOnly: false
    });
    cookieStore.set(`orderTime_${storeId}`, time, {
        httpOnly: false
    });
}

export async function updateDeliveryTime(storeId: string, date: string, time: string, location: string) {
    const cookieStore = await cookies();

    cookieStore.set(`deliveryDate_${storeId}_${location}`, date, {
        httpOnly: false
    });
    cookieStore.set(`deliveryTime_${storeId}_${location}`, time, {
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

export async function getDeliveryTime(storeId: string, location: string) {
    const cookieStore = await cookies();

    return {
        date: cookieStore.get(`deliveryDate_${storeId}_${location}`)?.value ?? null,
        time: cookieStore.get(`deliveryTime_${storeId}_${location}`)?.value ?? null
    }
}


