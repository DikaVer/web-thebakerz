'use client';
import React from "react";
import {
    Modal,
    ModalContent,
} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {useTheme} from "next-themes";
import {useSession} from "@/components/providers/session-provider";
import {ItemCart} from "@/lib/actions/cart";
import UserProductDialog from "@/components/store/product/dialog/user-product";
import BakerzProductDialog from "@/components/store/product/dialog/bakerz-product";
type ProductDialogProps = {
    storeId: string;
    productData: ProductData | undefined;
    itemCart?: ItemCart;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDialog({storeId, productData, itemCart, isOpen, onClose }: ProductDialogProps) {

    const { theme } = useTheme();

    const { session } = useSession();


    return (
        <>
            <Modal isOpen={isOpen} size={'md'} onClose={onClose} backdrop={'blur'} placement={'center'}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            {
                                session.user?.role === 'bakerz' && session.store?.id === storeId ?
                                    (
                                        <BakerzProductDialog productData={productData} onClose={onClose} />
                                    ) : (
                                        productData && (
                                            <UserProductDialog productData={productData} onClose={onClose} itemCart={itemCart}/>
                                        )
                                    )
                            }
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

