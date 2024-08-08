import React from "react";
import { ProfileHeader } from "@/components/shop/header";
import { Search } from "@/components/shop/search";
import { ItemList } from "@/components/shop/item-list";

export default function Page() {
    return (
        <div>
            <ProfileHeader />
            <div className="flex items-center justify-center h-full">
                <Search />
            </div>
            <ItemList />
        </div>
    );
}