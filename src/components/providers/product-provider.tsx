'use client';

import React, { createContext,  useContext, ReactNode } from 'react';


interface ProductDialogContextProps {

}

export const useProductDialog = () => {
    const context = useContext(ProductDialogContext);
    if (!context) {
        throw new Error('useProductDialog must be used within a ProductDialogProvider');
    }
    return context;
};

const ProductDialogContext = createContext<ProductDialogContextProps | undefined>(undefined);


export const ProductDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {


    return (
        <ProductDialogContext.Provider
            value={{

            }}
        >
            {children}
        </ProductDialogContext.Provider>
    );
};

