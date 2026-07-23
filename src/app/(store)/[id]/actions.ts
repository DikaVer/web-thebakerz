/**
 * @fileoverview Server actions for schedule-time cookie handling on store pages.
 *
 * Temporarily stores a user's selected pickup/delivery dates and times per
 * store (and per delivery location) in an httpOnly "schedule_time" cookie
 * with a 1-hour retention, used during order processing. Exports getters,
 * updaters, and removers for pickup and delivery schedules. Legal basis:
 * legitimate interest, necessary for order processing.
 */
"use server";
import { cookies } from 'next/headers';

// Helper function to get the current schedule data
async function getScheduleData() {
    const cookieStore = await cookies();
    const scheduleCookie = cookieStore.get('schedule_time');
    return scheduleCookie ? JSON.parse(scheduleCookie.value) : {};
}

// Helper function to save schedule data
async function saveScheduleData(data: any) {
    const cookieStore = await cookies();
    cookieStore.set('schedule_time', JSON.stringify(data), {
        httpOnly: true, // Not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: 'strict', // Prevent CSRF
        path: '/', // Set cookie path
        maxAge: 3600 // Expire after 1 hour (3600 seconds)
    });
}

// Remove all schedule cookies
export async function removeAllSchedules() {
    const cookieStore = await cookies();
    cookieStore.delete('schedule_time');
}

// Remove pickup schedule for a store
export async function removeOrderTime(storeId: string) {
    const data = await getScheduleData();
    if (data.pickup && data.pickup[storeId]) {
        delete data.pickup[storeId];
        await saveScheduleData(data);
    }
}

// Remove delivery schedule for a store and location
export async function removeDeliveryTime(storeId: string, location: string) {
    const data = await getScheduleData();
    if (data.delivery && data.delivery[storeId] && data.delivery[storeId][location]) {
        delete data.delivery[storeId][location];
        await saveScheduleData(data);
    }
}

// Update pickup schedule
export async function updateOrderTime(storeId: string, date: string, time: string) {
    const data = await getScheduleData();

    if (!data.pickup) data.pickup = {};
    data.pickup[storeId] = { date, time };
    
    await saveScheduleData(data);
}

// Update delivery schedule
export async function updateDeliveryTime(storeId: string, date: string, time: string, location: string) {
    const data = await getScheduleData();
    
    if (!data.delivery) data.delivery = {};
    if (!data.delivery[storeId]) data.delivery[storeId] = {};
    
    data.delivery[storeId][location] = { date, time };
    
    await saveScheduleData(data);
}

// Get pickup schedule
export async function getOrderTime(storeId: string) {
    const data = await getScheduleData();
    const storeData = data.pickup?.[storeId] || {};
    
    return {
        date: storeData.date ?? null,
        time: storeData.time ?? null
    };
}

// Get delivery schedule
export async function getDeliveryTime(storeId: string, location: string) {
    const data = await getScheduleData();
    const locationData = data.delivery?.[storeId]?.[location] || {};
    
    return {
        date: locationData.date ?? null,
        time: locationData.time ?? null
    };
}

// Get all schedule data
export async function getAllScheduleData() {
    return await getScheduleData();
}


