/**
 * @fileoverview Modal wrapper that presents a product's detail view.
 *
 * Exports the ProductDialog client component, a Hero UI Modal that renders
 * ProductDialogView with the given product, cart item, and optional rescue
 * deal data. It switches to a full-screen bottom sheet on small viewports via
 * a media query.
 */
'use client';
import React, {useState} from "react";
import {
    Modal,
    ModalContent,
} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {ItemCart} from "@/lib/actions/cart";
import {useMediaQuery} from "usehooks-ts";
import ProductDialogView from "../../user-view/ProductDialogView";
import { RescueDealProduct } from "@/lib/actions/rescue-deal";

type ProductDialogProps = {
    productData?: ProductData;
    itemCart?: ItemCart;
    isOpen: boolean;
    onClose: () => void;
    isBakerzStore: boolean;
    rescueDealInfo?: RescueDealProduct | null;
}

export default function ProductDialog({productData, itemCart, isOpen, onClose, isBakerzStore, rescueDealInfo}: ProductDialogProps) {
    const isSmall = useMediaQuery("(max-width: 800px)");

    return (
        <>
            <Modal
                isOpen={isOpen}
                size={isSmall ? 'full' : '2xl'}
                onClose={onClose}
                backdrop={'blur'}
                placement={isSmall ? 'bottom' : 'center'}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            { productData && (
                                <ProductDialogView
                                    productData={productData}
                                    onClose={onClose}
                                    itemCart={itemCart}
                                    isBakerzStore={isBakerzStore}
                                    rescueDealInfo={rescueDealInfo}
                                />
                            )}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}