'use client';
import React, { useEffect, useRef } from 'react';
import { Tabs, Tab } from '@heroui/react';
import { useTranslations } from "next-intl";

interface ProductTabsProps {
    categories: string[];
    selectedTab: string;
    onTabSelect: (category: string) => void;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ categories, selectedTab, onTabSelect }) => {
    const t = useTranslations("app/(store)/components/product-tabs");
    const tabsRef = useRef<HTMLDivElement>(null);

    // Handle case when selected tab is not in categories
    const effectiveSelectedTab = categories.includes(selectedTab) ? selectedTab : (categories.length > 0 ? categories[0] : "");



    // Scroll to selected tab when it changes
    useEffect(() => {
        if (tabsRef.current && effectiveSelectedTab) {
            const tabsContainer = tabsRef.current.querySelector('[role="tablist"]') as HTMLElement;
            
            if (tabsContainer) {
                // Find the selected tab element by its text content
                const tabElements = Array.from(tabsContainer.querySelectorAll('[role="tab"]'));
                const selectedTabElement = tabElements.find((tab) => 
                    tab.textContent?.trim() === effectiveSelectedTab
                ) as HTMLElement | undefined;
                
                if (selectedTabElement) {
                    const tabRect = selectedTabElement.getBoundingClientRect();
                    const containerRect = tabsContainer.getBoundingClientRect();
                    
                    // Check if tab is fully visible
                    const isTabVisible = (
                        tabRect.left >= containerRect.left &&
                        tabRect.right <= containerRect.right
                    );
                    
                    if (!isTabVisible) {
                        // Calculate scroll position to center the tab
                        const tabOffsetLeft = selectedTabElement.offsetLeft;
                        const tabWidth = selectedTabElement.offsetWidth;
                        const containerWidth = tabsContainer.offsetWidth;
                        const scrollLeft = tabOffsetLeft - (containerWidth / 2) + (tabWidth / 2);
                        
                        tabsContainer.scrollTo({
                            left: Math.max(0, scrollLeft),
                            behavior: 'smooth'
                        });
                    }
                }
            }
        }
    }, [effectiveSelectedTab]);

    return (
        <div ref={tabsRef} className="mx-0 px-0 w-full md:w-2/3">
            <Tabs
                key="underlined_tabs"
                aria-label={t("categoryNavigation")}
                className="w-full"
                classNames={{
                    tabList: 'bg-background overflow-x-auto scrollbar-hide',
                    cursor: 'bg-white shadow-none',
                    tab: 'whitespace-nowrap',
                    tabContent: 'text-base text-foreground font-light group-data-[selected=true]:font-medium',
                }}
                onSelectionChange={(index) => onTabSelect(index.toString())}
                selectedKey={effectiveSelectedTab}
            >
                {/* Hidden tab placeholder if needed */}
                <Tab key={"Profile"} className="hidden" />
                {categories.map((category) => (
                    <Tab 
                        key={category} 
                        title={category}
                    />
                ))}
            </Tabs>
        </div>
    );
};