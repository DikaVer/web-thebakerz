import React from "react";
import {getProductsByCategory} from "@/lib/store/store-dto";
import {ProductList} from "@/components/store/product-list";
import {ExternalLink} from "@/components/external-link";


export async function ProductComponent({id}: { id: string }) {
    const productsByCategory = await getProductsByCategory(id);

    if (!productsByCategory) {
        return (
            <div className="text-center">
                <p className={"text-2xl my-10"}>Sorry, {id} does not have any products yet.</p>
                <ExternalLink href="/">Go back to TheBakerz</ExternalLink>
            </div>
        );
    } else {

        return <ProductList productsByCategories={productsByCategory}/>;
    }
}