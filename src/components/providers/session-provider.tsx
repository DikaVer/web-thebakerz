/**
 * @fileoverview Client-side session context provider and useSession hook.
 *
 * Exports SessionProvider, which supplies SessionContext with the validated
 * session data, a setter for it, and a helper to update a store's new-order
 * count. It also implements a save-bar mechanism: components register save
 * handlers by id, handleSave runs them all in parallel, and handlers are
 * cleared automatically on route changes.
 */
'use client';

import React, {createContext, useContext, ReactNode, useState, useCallback, useEffect} from 'react';
import {SessionValidationResult} from "@/lib/actions/session";
import { usePathname } from 'next/navigation';
import { logger } from '@/lib/logger';

interface SessionContextType {
    session: SessionValidationResult;
    setSession: (session: (prevSession: SessionValidationResult) => SessionValidationResult) => void;
    isSaveOpen: boolean;
    setSaveOpen: (isOpen: boolean) => void;
    isLoading: boolean;
    handleSave: () => Promise<boolean>;
    registerSaveHandler: (id: string, handler: () => Promise<boolean> | boolean) => void;
    unregisterSaveHandler: (id: string) => void;
    clearSaveHandlers: () => void;
    updateNewOrderCount: (storeId: string, updateNumber: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

interface SessionProviderProps {
    children: ReactNode;
    sessionData: SessionValidationResult;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({sessionData, children }) => {
    const [session, setSession] = useState<SessionValidationResult>(sessionData);
    const [isSaveOpen, setSaveOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [saveHandlers, setSaveHandlers] = useState<Record<string, () => void>>({});
    const pathname = usePathname();


    useEffect(() => {
        //If pathname is changed, close the save button and remove all handlers
        clearSaveHandlers();
    }, [pathname]);

    const clearSaveHandlers = useCallback(() => {
        setSaveHandlers({});
        setSaveOpen(false);
    }, []);

    
    // Use useCallback to prevent unnecessary re-renders
    const registerSaveHandler = useCallback((id: string, handler: () => Promise<boolean> | boolean) => {
        logger.debug('sessionProvider', 'registering save handler', { id });
        setSaveHandlers(prev => {
            // Only update if the handler is different
            if (prev[id] !== handler) {
                return {...prev, [id]: handler};
            }
            return prev;
        });
    }, []);

    const updateNewOrderCount = useCallback((storeId: string, updateNumber: number) => {
        setSession(prev => {
            if (!prev.session || !prev.stores) return prev;
            const newStores = prev.stores.map(store => store.id === storeId ? {...store, newOrdersCount: store.newOrdersCount + updateNumber} : store);
            return {...prev, stores: newStores};
        });
    }, []);
    
    const unregisterSaveHandler = useCallback((id: string) => {
        logger.debug('sessionProvider', 'unregistering save handler', { id });
        setSaveHandlers(prev => {
            // Only update if the handler exists
            if (prev[id]) {
                const newHandlers = {...prev};
                delete newHandlers[id];
                return newHandlers;
            }
            return prev;
        });
    }, []);
    
    const handleSave = useCallback(async () => {
        // Execute all registered save handlers
        logger.debug('sessionProvider', 'handling save', { handlerCount: Object.keys(saveHandlers).length });
        
        if (Object.keys(saveHandlers).length === 0) {
            setSaveOpen(false);
            return true;
        }
        
        setIsLoading(true);
        
        try {
            const savePromises = Object.entries(saveHandlers).map(async ([id, handler]) => {
                try {
                    logger.debug('sessionProvider', 'executing handler', { id });
                    const result = await Promise.resolve(handler());
                    logger.debug('sessionProvider', 'handler result', { id, result });
                    return result;
                } catch (error) {
                    console.error('Error executing save handler:', { id, error });
                    return false;
                }
            });
            
            // Wait for all promises to complete
            await Promise.all(savePromises);
            clearSaveHandlers();
            
            setSaveOpen(false);
            
            
            return true;
        } finally {
            setIsLoading(false);
        }
    }, [saveHandlers]);

    return (
        <SessionContext.Provider value={{ 
            session, 
            setSession, 
            isSaveOpen, 
            setSaveOpen,
            isLoading,
            handleSave,
            registerSaveHandler,
            unregisterSaveHandler,
            clearSaveHandlers,
            updateNewOrderCount
        }}>
            {children}
        </SessionContext.Provider>
    );
};
