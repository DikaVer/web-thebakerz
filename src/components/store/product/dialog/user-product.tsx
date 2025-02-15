'use client';
import React, {useState} from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image, Card, Textarea, cn,
} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {CardFooter} from "@heroui/card";
import {formatCurrency} from "@/lib/utils";
import {IconCopy} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/ui/copy-text";
import {InputStepper} from "@/components/store/product/dialog/button-stepper";
import {ItemCart} from "@/lib/actions/cart";
import {ScrollShadow} from "@heroui/scroll-shadow";
type ProductDialogProps = {
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
}

export default function UserProductDialog({productData, onClose, itemCart}: ProductDialogProps) {

    const { theme } = useTheme();

    const [charCount, setCharCount] = useState(itemCart?.note.length || 0);

    const [quantity, setQuantity] = useState(itemCart?.quantity || 1);

    const totalPrice = formatCurrency((productData?.price || 1) * quantity);

    const [note, setNote] = useState(itemCart?.note || '');

    return (
                <>
                    <ModalHeader className="flex flex-col gap-1 p-1">
                        <CopyText
                            isIconOnly={true}
                            copyText={"https://www.thebakerz.com/" + productData?.store_id + "?product=" + productData?.id}
                            textNotify={"Product Link Copied!"}
                        >
                            <IconCopy size={24}
                                      primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                      secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                            />
                        </CopyText>
                    </ModalHeader>
                    <ModalBody className={'p-0'}>
                        { productData && (
                            <>
                                <Card
                                    isFooterBlurred
                                    radius="lg"
                                    className={`border-none shadow-none rounded-none`}
                                >
                                    <Image
                                        removeWrapper
                                        alt={productData.name}
                                        className="object-cover"
                                        src={productData.picture}
                                    />
                                    <CardFooter
                                        className={`justify-between items-end bg-background/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10`}>
                                        <p className={`w-full text-xl sm:text-2xl truncate mr-6 font-medium`}>{productData.name}</p>
                                        <p className={`text-lg cm:text-xl font-light`}>{formatCurrency(productData.price)}</p>
                                    </CardFooter>
                                </Card>
                                <ScrollShadow
                                    className={'max-h-[300px]'}
                                    size={100}
                                >
                                    <div className={'flex flex-col px-4 py-2 text-default-400 gap-4'}>
                                        <p>{productData.description}</p>

                                        <Textarea
                                            label={'Notes'}
                                            labelPlacement={'outside'}
                                            placeholder={`Add notes to your order... (max 100 characters)`}
                                            style={{resize: "none"}}
                                            className="mt-2"
                                            classNames={{
                                                input: cn("min-h-[40px]"),
                                            }}
                                            value={note}
                                            minRows={4}
                                            maxRows={5}
                                            onValueChange={(value) => {
                                                setNote(value);
                                                setCharCount(value.length);
                                            }}
                                            isInvalid={charCount > 100}
                                        />
                                        <p className="text-right text-grayText text-small px-2">{charCount}/100</p>
                                    </div>
                                </ScrollShadow>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter
                        className={'px-4 space-x-4'}
                    >
                        <InputStepper
                            min={1}
                            max={999}
                            value={quantity}
                            onChange={setQuantity}
                        />
                        <Button className={'w-full'} color="primary" onPress={onClose}>
                            {itemCart ? 'Update' : 'Add'} {quantity} to order • {totalPrice}
                        </Button>
                    </ModalFooter>
                </>
    );
}

