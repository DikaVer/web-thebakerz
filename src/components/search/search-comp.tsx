'use client';

import React from 'react';


interface SearchComponentProps {
    children: React.ReactNode;
}

export function SearchComponent({ 
    children
}: SearchComponentProps) {
 


    return (
        <div className="flex flex-col w-full h-full mt-4 px-4">
            {children}
        </div>
    );
}
