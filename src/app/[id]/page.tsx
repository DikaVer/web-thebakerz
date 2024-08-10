import React from "react";
import { ProfileHeader } from "@/components/shop/header";
import { Search } from "@/components/shop/search";
import { ItemList } from "@/components/shop/item-list";

const commands = [
    { value: '', label: '' },
];

export default function Page() {
    return (
        <div>
            <ProfileHeader />
            <div className="flex items-center justify-center h-full">
                <Search commands={commands} placeholder="Search for bakery items..." />
            </div>
            <ItemList />
        </div>
    );
}