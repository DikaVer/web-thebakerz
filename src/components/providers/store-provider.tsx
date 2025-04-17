'use client';

import React, {createContext, useContext, ReactNode, useRef, useState, useEffect, RefObject,} from 'react';
import {StoreData} from "@/lib/actions/store";




interface StoreContextType {
    store: StoreData;
    sentinelRef: RefObject<HTMLDivElement | null>;
    isSticky: boolean;
}

// Create a default value for when used outside of provider
const defaultStoreContext: StoreContextType = {
    store: {} as StoreData,
    sentinelRef: { current: null },
    isSticky: false
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
    const context = useContext(StoreContext);
    if (!context) {
        // Return default values instead of throwing an error
        return defaultStoreContext;
    }
    return context;
};

interface StoreProviderProps {
    store: StoreData;
    children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({store, children }) => {

    // Set up a sentinel ref that will be used to trigger the sticky event.
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [isSticky, setIsSticky] = useState(false);


    // Set up an IntersectionObserver to watch the sentinel.
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When the sentinel is not visible, the header is sticky.
                setIsSticky(!entry.isIntersecting);
                if (!entry.isIntersecting) {
                    // Custom trigger logic: for example, log or run other actions.

                }
            },
            { threshold: 0 }
        );
        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => {
            if (sentinelRef.current) observer.unobserve(sentinelRef.current);
        };
    }, []);





    return (
        <StoreContext.Provider value={{ store, sentinelRef, isSticky }}>
            {children}
        </StoreContext.Provider>
    );
};
