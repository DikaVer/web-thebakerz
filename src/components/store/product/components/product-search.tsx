'use client';
import React, { ChangeEvent } from 'react';
import { Input } from '@heroui/react';
import { Icon } from '@iconify/react';

interface ProductSearchProps {
    searchTerm: string;
    onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ searchTerm, onSearchChange }) => (
    <div className="flex flex-row w-full md:w-1/3 justify-center">
        <Input
            className="w-full"
            classNames={{
                mainWrapper: "rounded-xl border-0 shadow-small",
                inputWrapper: "bg-content1",
            }}
            placeholder="Search by product name or category..."
            value={searchTerm}
            onChange={onSearchChange}
            type="text"
            startContent={
                <Icon icon="solar:magnifer-broken" width={24} className="text-default-400" />
            }
        />
    </div>
);
