"use server";
import {cookies} from "next/headers";


export async function updateOrderTime(date: string, time: string) {
    const cookieStore = await cookies();

    cookieStore.set("orderDate", date, {
        httpOnly: false
    });
    cookieStore.set("orderTime", time, {
        httpOnly: false
    });
}

export async function getOrderTime() {
    const cookieStore = await cookies();

    return {
        date: cookieStore.get("orderDate")?.value ?? null,
        time: cookieStore.get("orderTime")?.value ?? null
    }
}