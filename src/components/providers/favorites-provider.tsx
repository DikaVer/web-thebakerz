'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { FavoriteData, addStoreFavorite, removeStoreFavorite, addProductFavorite, removeProductFavorite} from "@/lib/actions/favorites";

interface FavoritesContextProps {
    storeFavorites: FavoriteData[];
    productFavorites: FavoriteData[];
    addStoreToFavorites: (storeId: string, storeName: string, storeBackground: string) => Promise<boolean>;
    removeStoreFromFavorites: (storeId: string) => Promise<boolean>;
    addProductToFavorites: (storeId: string, productId: string, productName: string, productImage: string) => Promise<boolean>;
    removeProductFromFavorites: (storeId: string, productId: string) => Promise<boolean>;
    isStoreFavorite: (storeId: string) => boolean;
    isProductFavorite: (storeId: string, productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextProps | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider: React.FC<{ 
    children: ReactNode;
    initialStoreFavorites?: FavoriteData[];
    initialProductFavorites?: FavoriteData[];
}> = ({
    children,
    initialStoreFavorites = [],
    initialProductFavorites = []
}) => {
    // State management
    const [storeFavorites, setStoreFavorites] = useState<FavoriteData[]>(initialStoreFavorites);
    const [productFavorites, setProductFavorites] = useState<FavoriteData[]>(initialProductFavorites);

    // Favorite operations
    const addStoreToFavorites = useCallback(async (storeId: string, storeName: string, storeBackground: string) => {
        const success = await addStoreFavorite(storeId, storeName, storeBackground);
        if (success) {
            setStoreFavorites(prev => [...prev, { id: `${storeId}`, storeId, type: "store", userId: "", createdAt: "", metadata: { storeName, storeBackground } }]);
            return true;
        } else {
            return false;
        }
    }, []);

    const removeStoreFromFavorites = useCallback(async (storeId: string) => {
        const success = await removeStoreFavorite(storeId);
        if (success) {
            setStoreFavorites(prev => prev.filter(fav => fav.storeId !== storeId));
            return true;
        } else {
            return false;
        }
    }, []);

    const addProductToFavorites = useCallback(async (storeId: string, productId: string, productName: string, productImage: string) => {
        const success = await addProductFavorite(storeId, productId, productName, productImage);
        if (success) {
            setProductFavorites(prev => [...prev, { id: `${storeId}-${productId}`, storeId, productId, type: "product", userId: "", createdAt: "", metadata: { productName, productImage } }]);
            return true;
        } else {
            return false;
        }
    }, []);

    const removeProductFromFavorites = useCallback(async (storeId: string, productId: string) => {
        const success = await removeProductFavorite(storeId, productId);
        if (success) {
            setProductFavorites(prev => prev.filter(fav => fav.storeId !== storeId || fav.productId !== productId));
            return true;
        } else {
            return false;
        }
    }, []);

    // Check if store/product is favorited
    const isStoreFavorite = useCallback((storeId: string) => {
        return storeFavorites.some(fav => fav.storeId === storeId);
    }, [storeFavorites]);

    const isProductFavorite = useCallback((storeId: string, productId: string) => {
        return productFavorites.some(fav => fav.storeId === storeId && fav.productId === productId);
    }, [productFavorites]);

    const contextValue: FavoritesContextProps = {
        storeFavorites,
        productFavorites,
        addStoreToFavorites,
        removeStoreFromFavorites,
        addProductToFavorites,
        removeProductFromFavorites,
        isStoreFavorite,
        isProductFavorite
    };

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
}; 