/**
 * @fileoverview Client-side URL normalizer for store pages.
 *
 * Exports the StoreIdChecker component, which renders nothing but replaces
 * the store id segment of the current path with the store's friendly name
 * via history.replaceState (preserving query parameters) when the page was
 * reached by id.
 */
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