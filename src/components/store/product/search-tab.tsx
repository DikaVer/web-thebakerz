'use client';

import React from "react";
import { Input, Tab, Tabs, Spacer } from "@heroui/react";
import { Icon } from "@iconify/react";

interface SearchTabProps {
    searchTerm: string;
    onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
    selectedTab: string;
    categories: string[];
    onTabChange: (category: string) => void;
}

const SearchTab: React.FC<SearchTabProps> = ({
                                                 searchTerm,
                                                 onSearchChange,
                                                 selectedTab,
                                                 categories,
                                                 onTabChange,
                                             }) => {
    return (
        <>
            <Tabs
                key="underlined_tabs"
                aria-label="Tabs Category Navigation"
                variant="underlined"
                className="mx-0 px-0 w-full md:w-2/3"
                onSelectionChange={(index) => {
                    onTabChange(index.toString());
                }}
                selectedKey={selectedTab}
            >
                {/* A hidden tab for any default selection if needed */}
                <Tab key={"Profile"} className={"hidden"} />
                {categories.map((category) => (
                    <Tab key={category} title={category} />
                ))}
            </Tabs>
            <Spacer y={2} />
            <div className="flex flex-row w-full md:w-1/3 justify-center">
                <Input
                    className="w-full"
                    classNames={{
                        mainWrapper: "rounded-xl border-1",
                        inputWrapper: "bg-background",
                    }}
                    placeholder="Search by product name or category..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    type="text"
                    startContent={
                        <Icon
                            icon="solar:magnifer-broken"
                            width={24}
                            className="text-default-400"
                        />
                    }
                />
            </div>
        </>
    );
};

export default SearchTab;
