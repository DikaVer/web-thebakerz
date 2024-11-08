import {useCallback, useEffect, useState} from "react";
import {AddressUserData, CheckoutData} from "@/lib/definitions";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {timeMap} from "@/lib/local-variables";

export const useCheckoutSettings = () => {
    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        deliveryMode: "PICKUP",
        deliveryAddress: null,
        savedAddresses: null,
        selectedTime: null,
    });

    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Utility function to get item from localStorage and handle parsing
    const getLocalStorageItem = useCallback(<T,>(key: string, defaultValue: any): T => {
        const item = localStorage.getItem(key);
        if (key === 'deliveryMode' || key === 'date' || key === 'time' || key === 'deliveryAddress') {
            return (item as T) || defaultValue;
        } else {
            return item ? (JSON.parse(item) as T) : defaultValue;
        }
    }, []);

    // Function to update checkout settings from localStorage
    const updateCheckoutData = useCallback(() => {
        const updatedCheckoutData: CheckoutData = {
            deliveryMode: getLocalStorageItem<"PICKUP" | "DELIVERY">('deliveryMode', "PICKUP"),
            deliveryAddress: getLocalStorageItem<string | null>('deliveryAddress', null),
            savedAddresses: getLocalStorageItem<AddressUserData>('savedAddresses', null),
            selectedTime: getLocalStorageItem<{
                date: `${number}/${number}/${number}`;
                time: keyof typeof timeMap;
            } | null>('selectedTime', null),
        };

        setCheckoutData(updatedCheckoutData);

        const params = new URLSearchParams(searchParams.toString());
        params.set('deliveryMode', updatedCheckoutData.deliveryMode);

        if (updatedCheckoutData.selectedTime?.date && updatedCheckoutData.selectedTime?.time) {
            params.set('date', updatedCheckoutData.selectedTime.date);
            params.set('time', updatedCheckoutData.selectedTime.time.toString());
        }

        router.replace(`${pathname}?${params.toString()}`);
    }, [getLocalStorageItem, pathname, router, searchParams]);

    useEffect(() => {
        updateCheckoutData(); // Initial update on mount
    }, [updateCheckoutData]);

    return { checkoutData, updateCheckoutData };
};