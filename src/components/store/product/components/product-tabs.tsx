'use client';
import React from 'react';
import { Tabs, Tab } from '@heroui/react';

interface ProductTabsProps {
    categories: string[];
    selectedTab: string;
    onTabSelect: (category: string) => void;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ categories, selectedTab, onTabSelect }) => (
    <Tabs
        key="underlined_tabs"
        aria-label="Tabs Category Navigation"
        variant="underlined"
        className="mx-0 px-0 w-full md:w-2/3"
        onSelectionChange={(index) => onTabSelect(index.toString())}
        selectedKey={selectedTab}
    >
        {/* Hidden tab placeholder if needed */}
        <Tab key={"Profile"} className="hidden" />
        {categories.map((category) => (
            <Tab key={category} title={category} />
        ))}
    </Tabs>
);
