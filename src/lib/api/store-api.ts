import 'server-only';
import { StoreBusinessData, StoreData, StoreDataPayment } from "@/lib/actions/store";
import {WorkHours} from "@/lib/actions/calendar-actions";

export const getCurrentStore = async (id: string): Promise<StoreData | null> => {

    if (!id) {
        throw new Error("Store ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${id}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export const getCurrentStoreId = async (id: string): Promise<{id: string, storeName: string, ownerName: string, user_id: string} | null> => {

    if (!id) {
        throw new Error("Store ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${id}/id`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export const getCurrentStoreSchedule = async (id: string): Promise<WorkHours | undefined> => {

    if (!id) {
        throw new Error("Store ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${id}/schedule/pickup`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};

export const getCurrentStoreByUserIdAndStoreId = async (userId: string, storeId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    if (!userId || !storeId) {
        throw new Error("User ID and store ID are required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${storeId}/${userId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
}

export const getCurrentStoreByUserId = async (userId: string): Promise<{store: StoreData | null, schedule: WorkHours | null}> => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/owner/${userId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
}

export const getCurrentBusinessStore = async (id: string): Promise<StoreBusinessData > => {
    if (!id) {
        throw new Error("Store ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${id}/business`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};


export const getCurrentStorePayment = async (id: string): Promise<StoreDataPayment> => {
    if (!id) {
        throw new Error("Store ID is required");
    }

    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/${id}/payment`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PRIVATE_SECRET_BEARER}`,
        },
        next: {
            tags: ['store'],
            revalidate: 300
        }
    }).then(res => res.json());
};