'use client';
import React from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useTranslations } from "next-intl";

interface ProductTabsProps {
    categories: string[];
    selectedTab: string;
    onTabSelect: (category: string) => void;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ categories, selectedTab, onTabSelect }) => {
    const t = useTranslations("app/(store)/components/product-tabs");

    // Handle case when selected tab is not in categories
    const effectiveSelectedTab = categories.includes(selectedTab) ? selectedTab : (categories.length > 0 ? categories[0] : "");

    return (
        <Tabs
            key="underlined_tabs"
            aria-label={t("categoryNavigation")}
            className="mx-0 px-0 w-full md:w-2/3"
            classNames={{
                tabList: 'bg-background',
                cursor: 'bg-white shadow-none',
            }}
            onSelectionChange={(index) => onTabSelect(index.toString())}
            selectedKey={effectiveSelectedTab}
        >
            {/* Hidden tab placeholder if needed */}
            <Tab key={"Profile"} className="hidden" />
            {categories.map((category) => (
                <Tab key={category} title={category} />
            ))}
        </Tabs>
    );
};