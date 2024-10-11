import React from "react";
import {ProductList} from "@/components/store/product-list";
import {ExternalLink} from "@/components/external-link";
import {ProductData, ProductDataField, StoreData} from "@/lib/definitions";


export function ProductComponent({id, productData, setStoreData, isPending, setPending}: {
    id: string,
    productData: ProductData,
    isPending: boolean,
    setPending: (isPending: boolean) => void,
    setStoreData: (data: StoreData) => void
}) {

    if (productData.length === 0) {
        return (
            <div className="text-center">
                <p className={"text-2xl my-10"}>Sorry, {id} does not have any products yet.</p>
                <ExternalLink href="/">Go back to TheBakerz</ExternalLink>
            </div>
        );
    } else {

        const productsByCategory: { [key: string]: ProductDataField[] } = {};

        productData.forEach(product => {
            if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
            }
            productsByCategory[product.category].push(product);
        });

        return <ProductList
            id={id}
            productsByCategories={productsByCategory}
            isPending={isPending}
            setStoreData={setStoreData}
            setPending={setPending}
        />;
    }
}