import React from "react";
import { ItemCart, Variant } from "@/lib/actions/cart";
import { ProductData } from "@/lib/actions/product";
import {Button, cn, Divider, Image, Spacer} from "@heroui/react";
import { formatCurrency } from "@/lib/utils";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import CustomAlert from "@/components/ui/custom-alerts";
import { useTranslations } from "next-intl";
import {calculateItemTotalPrice} from "@/lib/helper/calculate-total-price-variants";
import {Icon} from "@iconify/react";

type CartItemRowProps = {
    item: ItemCart;
    productData: ProductData;
    updateItem: (item: ItemCart) => Promise<boolean>;
    removeItem: (item: ItemCart) => Promise<boolean>;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    handleOpen: (productId: string, isBakerzStore:boolean, itemCart?: ItemCart) => void;
};

// Format variants into readable strings
export const formatVariants = (variants: Variant[], color?: "primary" | "warning", classNames?: {
    text?: string;
}) => {
    if (!variants|| variants.length === 0) return null;

    return variants.map((variant, index) => {
        const options = variant.selectedItems.map(item => {
            const priceText = item.price > 0 ? ` (+${formatCurrency(item.price)})` : '';
            return `${item.label}${priceText}`;
        }).join(", ");

        return (
            <CustomAlert
                key={`${variant.label}-${index}`}
                color={color || "primary"}
                hideIcon={true}
                classNames={{
                    base: 'p-0 mb-1',
                    mainWrapper: 'p-0 py-1 min-h-0',
                }}
            >
                <p className={cn("text-xs", classNames?.text)}><span className="font-medium">{variant.label}:</span> {options}</p>
            </CustomAlert>
        );
    });
};

export const CartItemRow: React.FC<CartItemRowProps> = ({
                                                            item,
                                                            productData,
                                                            updateItem,
                                                            removeItem,
                                                            isLoading,
                                                            setIsLoading,
                                                            handleOpen
                                                        }) => {
    const t = useTranslations("app/(store)/components/cart");

    const handleQuantityChange = async (value: number) => {
        let updatedValue;
        if (value === 0) {
            updatedValue = await removeItem(item);
        } else {
            updatedValue = await updateItem({ ...item, quantity: value });
        }
        return updatedValue;
    };

    const handleDelete = async () => {
        const updateValue = await removeItem(item);
    }

    if (item.quantity === 0) return null;


    return (
        <>
            <div
                className={`flex flex-col gap-2 p-4 w-full  ${!isLoading && 'hover:bg-default-100 cursor-pointer'} border-gray-200`}
                key={item.id}
                onClick={() => {
                    if (!isLoading) {
                        handleOpen(productData.id, false, item);
                    }
                }}
            >
                <div className={'flex'}>
                    <div className="w-20 h-20 aspect-square">
                        <Image
                            removeWrapper
                            alt={productData.name}
                            src={productData.picture}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <Spacer x={4} />
                    <div className="flex justify-between w-[100%]">
                        <div className="flex flex-col w-full">
                            <div className={'flex justify-between'}>
                                <p className="font-medium truncate text-start">{productData.name}</p>
                                {item.quantity > 1 && (
                                    <Button
                                        size={'sm'}
                                        variant={'ghost'}
                                        isLoading={isLoading}
                                        onPress={async () => {
                                            setIsLoading(true);
                                            await handleDelete();
                                            setIsLoading(false);
                                        }}
                                    >
                                        {!isLoading && <Icon icon="solar:trash-bin-trash-broken" width={24} />}
                                    </Button>
                                )}
                            </div>

                            {/* Display variants */}
                            {item.variants && item.variants.length > 0 && (
                                <div className="mt-1 mb-1">
                                    {formatVariants(item.variants)}
                                </div>
                            )}

                            {/* Display note */}
                            {item.note && (
                                <>
                                    <div className="w-full overflow-hidden">
                                        <CustomAlert
                                            color="warning"
                                            hideIcon={true}
                                            classNames={{
                                                base: 'p-0 overflow-visible',
                                                mainWrapper: 'p-0 py-1 overflow-visible',
                                            }}
                                        >
                                            <p className="text-xs break-all word-break text-wrap overflow-visible whitespace-normal">{`${t("note")}: ${item.note}`}</p>
                                        </CustomAlert>
                                    </div>
                                    <Spacer x={4} />
                                </>
                            )}

                            {productData.ingredients && productData.ingredients.length > 0 && (
                                <p className="text-xs text-default-400 font-medium break-words">
                                    {productData.ingredients.join(", ")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(calculateItemTotalPrice(item.variants, productData.price, item.quantity))}
                    </p>
                    <div>
                        <InputStepper
                            isCart
                            min={0}
                            max={999}
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />
                    </div>
                </div>
            </div>
            <Divider />
        </>
    );
};