'use client';
import React, {useState} from "react";
import {
    Modal,
    ModalContent,
} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {useSession} from "@/components/providers/session-provider";
import {ItemCart} from "@/lib/actions/cart";
import UserProductDialog from "@/components/store/product/dialog/user-product";
import BakerzProductDialog from "@/components/store/product/dialog/bakerz-product";
import {useMediaQuery} from "usehooks-ts";
import {useTranslations} from "next-intl";

type ProductDialogProps = {
    storeId: string;
    productData: ProductData | undefined;
    itemCart?: ItemCart;
    isOpen: boolean;
    onClose: () => void;
    bakerzOrder?: boolean;
    setIsUpdating: (isUpdating: boolean) => void;
}

export default function ProductDialog({storeId, productData, itemCart, isOpen, onClose, bakerzOrder = false, setIsUpdating }: ProductDialogProps) {
    const { session } = useSession();
    const isSmall = useMediaQuery("(max-width: 800px)");
    const t = useTranslations("TheBakerz");
    const [isDismissable, setIsDismissable] = useState(true);

    return (
        <>
            <Modal
                isOpen={isOpen}
                size={isSmall ? 'full' : '2xl'}
                onClose={onClose}
                isDismissable={isDismissable}
                radius={'lg'}
                className={'h-fit max-h-fit min-h-fit !rounded-t-xl'}
                backdrop={'blur'}
                placement={isSmall ? 'bottom' : 'center'}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {
                                session.user?.role === 'bakerz' && session.store?.id === storeId && !bakerzOrder ?
                                    (
                                        <BakerzProductDialog
                                            productData={productData}
                                            onClose={onClose}
                                            setIsDismissable={setIsDismissable}
                                            setIsUpdating={setIsUpdating}
                                        />
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