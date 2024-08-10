
import React from "react";
import {IconPlus, IconStar} from "@/components/ui/icons";
import Image from "next/image";
import {Item} from "@/components/shop/item";

export function ItemList() {
    return (
        <div className={"mb-6"}>
            <span className={"text-xl font-bold"}>Macaroons</span>
            <ul className={"pt-3 grid gap-4 grid-cols-1 shop-sm:grid-cols-2"}>
                <Item
                    name="Caramel Macaroons"
                    description="Indulge in this decadent chocolate cake, made with premium ingredients. Award-winning recipe, perfected over years to bring you the ultimate dessert experience."
                    rating="4.9"
                    price="$2.50"
                    image="/macaroons_test.jpg"/>
                <Item
                    name="Vanilla Macaroons"
                    description="A classic vanilla macaroon with a rich and creamy filling."
                    price="$2.00"
                    rating="4.5"
                    image="/macaroons_test.jpg"/>
                <Item
                    name="Vanilla Macaroons"
                    description="A classic vanilla macaroon with a rich and creamy filling."
                    price="$2.00"
                    rating="4.5"
                    image="/macaroons_test.jpg"/>
                <Item
                    name="Vanilla Macaroons"
                    description="A classic vanilla macaroon with a rich and creamy filling."
                    price="$2.00"
                    rating="4.5"
                    image="/macaroons_test.jpg"/>
                <Item
                    name="Vanilla Macaroons"
                    description="A classic vanilla macaroon with a rich and creamy filling."
                    price="$2.00"
                    rating="4.5"
                    image="/macaroons_test.jpg"/>
                <Item
                    name="Vanilla Macaroons"
                    description="A classic vanilla macaroon with a rich and creamy filling."
                    price="$2.00"
                    rating="4.5"
                    image="/macaroons_test.jpg"/>
            </ul>
        </div>
    );
}