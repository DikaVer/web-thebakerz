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

type ProductDialogProps = {
    productData?: ProductData;
    itemCart?: ItemCart;
    isOpen: boolean;
    onClose: () => void;
    isBakerzStore: boolean;
}

export default function ProductDialog({productData, itemCart, isOpen, onClose, isBakerzStore}: ProductDialogProps) {
    const isSmall = useMediaQuery("(max-width: 800px)");

    return (
        <>
            <Modal
                isOpen={isOpen}
                size={isSmall ? 'full' : '2xl'}
                onClose={onClose}
                radius={'lg'}
                className={'h-fit max-h-fit min-h-fit !rounded-t-xl'}
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
                                />
                            )}
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}