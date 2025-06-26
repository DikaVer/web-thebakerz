'use client';
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function StoreIdChecker({storeId, storeName}: { storeId: string, storeName?: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if(storeName && storeId !== storeName) {
            // Split the pathname into segments
            const segments = pathname.split('/'); // e.g., ['', 'cake', 'orders']
            // Check if there is at least one segment after the leading slash
            if (segments.length > 1) {
                segments[1] = storeName; // Replace "cake" with "new-value"
            }
            const newPath = segments.join('/');
            
            // Construct the full URL with search params
            const searchString = searchParams.toString();
            const fullUrl = searchString ? `${newPath}?${searchString}` : newPath;
            
            // Update the URL without causing a page reload
            window.history.replaceState(null, '', fullUrl);
        }
    }, [storeId, storeName, pathname, searchParams]);

    return null;
}