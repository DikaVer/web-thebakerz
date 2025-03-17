'use client';

import React, {createContext, useContext, ReactNode, useState} from 'react';
import {SessionValidationResult} from "@/lib/actions/session";



interface SessionContextType {
    session: SessionValidationResult;
    setSession: (session: (prevSession: SessionValidationResult) => SessionValidationResult) => void;
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

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};
