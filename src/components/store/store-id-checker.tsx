'use client';
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function StoreIdChecker({storeId, storeName}: { storeId: string, storeName?: string }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if(storeName && storeId !== storeName) {
            // Split the pathname into segments
            const segments = pathname.split('/'); // e.g., ['', 'cake', 'orders']
            // Check if there is at least one segment after the leading slash
            if (segments.length > 1) {
                segments[1] = storeName; // Replace "cake" with "new-value"
            }
            const newPath = segments.join('/');
            router.replace(newPath);
        }
    }, [storeId, storeName, pathname, router]);

    return null;
}