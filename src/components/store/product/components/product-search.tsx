'use client';
import React, { ChangeEvent, useState, useEffect, useCallback } from 'react';
import { Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import {useTranslations} from "next-intl";
import debounce from 'lodash.debounce';

interface ProductSearchProps {
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ searchTerm, onSearchChange }) => {
    const t = useTranslations("app/(store)/components/product-search");
    
    // Local state for immediate input feedback
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    
    // Update local state when external searchTerm changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);
    
    // Debounced callback to parent
    const debouncedOnSearchChange = useCallback(
        debounce((value: string) => {
            // Create a synthetic event object
            const syntheticEvent = {
                target: { value },
                currentTarget: { value }
            } as ChangeEvent<HTMLInputElement>;
            onSearchChange(syntheticEvent);
        }, 300),
        [onSearchChange]
    );
    
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value); // Immediate update for typing feedback
        debouncedOnSearchChange(value); // Debounced callback to parent
    };

    return (<div className="flex flex-row w-full justify-center">
        <Input
            className="w-full"
            classNames={{
                mainWrapper: "rounded-xl border-0",
                inputWrapper: "bg-content1",
            }}
            placeholder={t('search')}
            value={localSearchTerm}
            onChange={handleInputChange}
            type="text"
            startContent={
                <Icon icon="solar:magnifer-broken" width={24} className="text-default-400"/>
            }
        />
    </div>);
};
