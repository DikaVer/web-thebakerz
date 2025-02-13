'use client';

import React, {createContext, useContext, ReactNode,} from 'react';
import {StoreData} from "@/lib/actions/store";




interface StoreContextType {
    store: StoreData;
}

const CartContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};

interface StoreProviderProps {
    store: StoreData;
    children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({store, children }) => {


    return (
        <CartContext.Provider value={{ store }}>
            {children}
        </CartContext.Provider>
    );
};
