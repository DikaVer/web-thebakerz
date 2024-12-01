'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, { useEffect, useState, ReactNode } from "react";
import {Button} from '@/components/ui/button';
import {Slider} from "@nextui-org/slider";
import {
    IconCircleAlert,
    IconCross, IconEdit, IconEgg, IconEggOff, IconGluten, IconGlutenFree,
    IconHeartFavourites, IconMeet, IconNotebookPen, IconNuts, IconNutsFree,
    IconShare, IconSuccess, IconVegan, MoonIcon, SunIcon,
} from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {useCart} from "@/components/providers/cart-provider";
import {useProductDialog} from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";
// @ts-ignore
import ExpandText from 'react-expand-text';

// @ts-ignore
import confetti from 'canvas-confetti';

import {toast} from "sonner";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {
    Accordion,
    AccordionItem,
    Card,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    Select,
    SelectItem, Switch
} from "@nextui-org/react";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import {backdropEffect} from "@/lib/local-variables";
import {useTheme} from "next-themes";
import Progress from "@/components/ui/progress";
import {limitChar} from "@/components/ui/limitChar";
import {Textarea} from "@nextui-org/input";

interface ProductDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    productData: ProductDataField;
    children: ReactNode;
    isHeartFilled: boolean;
    onToggleHeart: () => void;
}

export function ProductDescriptionBase({
                                            isOpen,
                                            onClose,
                                            productData,
                                            children,
                                            isHeartFilled,
                                            onToggleHeart,
                                        }: ProductDescriptionModalProps) {
    useEffect(() => {
        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <Modal
                backdrop={backdropEffect}
                isOpen={isOpen}
                onClose={onClose}
                size={'xl'}
                shadow={"lg"}
                placement={"center"}
                className={"bg-background"}
            >
                <ModalContent>
                    {(onClose) => (
                        <ModalBody >
                            <ScrollShadow size={50} hideScrollBar className="max-h-[75vh]">
                                <div className="grid gap-4 p-4">
                                    <ModalHeader />
                                    <hr className="my-1" />
                                    <ProductImage productData={productData} />
                                    <ProductDetails
                                        productData={productData}
                                        isHeartFilled={isHeartFilled}
                                        onToggleHeart={onToggleHeart}
                                    />
                                    {children}
                                </div>
                            </ScrollShadow>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}



function ModalHeader() {
    return (
        <div className="flex justify-between items-center">
            <Button
                isIconOnly
                className="flex items-center rounded-full"
                variant={"ghost"}
                onClick={() => { /* TODO: Implement share functionality */ }}
            >
                <IconShare className="w-8 h-8 cursor-pointer text-text" />
            </Button>
            <p className="text-xl font-medium">Product Detail</p>
            <div className={"w-8 h-8"}>
            </div>
        </div>
    );
}

interface ProductImageProps {
    productData: ProductDataField;
}

function ProductImage({ productData }: ProductImageProps) {
    const isSmallScreen = useIsSmallScreen(540);

    return (
        <div className="flex justify-center w-full">
            <Image
                isZoomed
                isBlurred
                src={productData.image_url}
                alt={productData.name}
                className={"rounded-xl object-center"}
                width={isSmallScreen ? 300 : 400}
                height={isSmallScreen ? 300 : 400}
            />
        </div>
    );
}

interface ProductDetailsProps {
    productData: ProductDataField;
    isHeartFilled: boolean;
    onToggleHeart: () => void;
}

function ProductDetails({ productData, isHeartFilled, onToggleHeart }: ProductDetailsProps) {
    return (
        <div className="flex flex-col gap-2">
            <Card
                className={"flex flex-row justify-between items-center p-2"}
            >
                <div>
                    <p className="text-xl font-bold">{productData.name}</p>
                    <span className="text-lg font-bold text-grayText">{formatCurrency(productData.price)}</span>
                </div>
                <Button
                    isIconOnly
                    className={`w-12 h-12 flex items-center rounded-full`}
                    variant={"ghost"}
                    endContent={<IconHeartFavourites
                        className="w-10 h-10 text-primary"
                        state={isHeartFilled ? "full" : "empty"}
                        onClick={onToggleHeart}
                    />}
                    onClick={() => { /* TODO: Implement share functionality */
                    }}
                >

                </Button>
            </Card>
            <p className="font-medium text-grayText clamp-product-description">{productData.description}</p>
        </div>
    );
}

interface ProductDescriptionUserProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    productData: ProductDataField;
    editCartData?: {
        quantity: number;
        uniqueId: string;
    };
}

const flavourTypes = [
    { key: "Vanilla", label: "Vanilla" },
    { key: "Chocolate", label: "Chocolate" },
    { key: "Strawberry", label: "Strawberry" },
    { key: "Mint", label: "Mint" },
    { key: "Coffee", label: "Coffee" },
    { key: "Lemon", label: "Lemon" },
    { key: "Caramel", label: "Caramel" },
    { key: "Raspberry", label: "Raspberry" },
    { key: "Blueberry", label: "Blueberry" },
    { key: "Blackberry", label: "Blackberry" },
    { key: "Peach", label: "Peach" }
]


export function ProductDescriptionUser({
                                           isDialogOpen,
                                           setDialogOpen,
                                           productData,
                                           editCartData,
                                       }: ProductDescriptionUserProps) {
    const [isHeartFilled, setIsHeartFilled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(editCartData ? editCartData.quantity : 1);
    const totalPrice = formatCurrency(productData.price * quantity);
    const { addToCart, updateProductCart } = useCart();

    const [isGlutenFree, setIsGlutenFree] = useState<boolean>(false);
    const [isVegan, setIsVegan] = useState<boolean>(false);
    const [isEggFree, setIsEggFree] = useState<boolean>(false);
    const [isNutFree, setIsNutFree] = useState<boolean>(false);

    const [sweetnessLevel, setSweetnessLevel] = useState<number>(0);
    const [tartnessLevel, setTartnessLevel] = useState<number>(0);
    const getOverviewTartness = () => {
        switch (tartnessLevel) {
            case 0:
                return "like vanilla cake";
            case 1:
                return "strawberries";
            case 2:
                return "raspberries";
            case 3:
                return "lemon bars";
            case 4:
                return "pure citrus, unripe fruits";
        }
    }


    const [umamiLevel, setUmamiLevel] = useState<number>(0);

    const getOverviewUmami = () => {
        switch (umamiLevel) {
            case 0:
                return "traditional desserts";
            case 1:
                return "caramel";
            case 2:
                return "miso desserts";
            case 3:
                return "fermented ingredients";
            case 4:
                return "concentrated savory elements";
        }
    }


    const [bitternessLevel, setBitternessLevel] = useState<number>(0);

    const getOverviewBitternessLevel = () => {
        switch (bitternessLevel) {
            case 0:
                return "milk chocolate";
            case 1:
                return "35% cocoa";
            case 2:
                return "70% cocoa";
            case 3:
                return "85% cocoa";
            case 4:
                return "100% pure cocoa";
        }
    }


    const [type, setType] = useState<string>("");

    const handleAddOrder = () => {
        setIsLoading(true);

        if (editCartData) {
            updateProductCart(
                {
                    ...productData,
                    quantity: editCartData.quantity,
                    uniqueId: editCartData.uniqueId,
                },
                quantity
            );
        } else {
            addToCart(productData, quantity);
        }

        setDialogOpen(false);
        setIsLoading(false);
    };

    // const confetti = require('canvas-confetti').default;

    const handleConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 300,
            origin: { y: 0.6 }
        });
    };

    const [extraInfo, setExtraInfo] = React.useState(false);
    const text =
        "The \"65% Moistness level\" indicates that the\n" +
        "                                product has a moderate level of moisture, which is likely to be perceived as neither too\n" +
        "                                dry nor too wet. This level of moistness is typically desirable for products that need\n" +
        "                                to maintain a certain texture and freshness, such as baked goods or other food\n" +
        "                                items.";
    const limitCharLength = 100;

    const [extraFreezInfo, setExtraFreezInfo] = React.useState(false);
    const textFreez =
        "The \"Low Freezing capability\" indicates that the\n" +
        "                                product has a very low ability to withstand freezing conditions. This means that the\n" +
        "                                product is likely to be negatively affected by freezing, potentially leading to changes\n" +
        "                                in texture, taste, or overall quality. Products with low freezing capability are\n" +
        "                                generally not suitable for storage in freezing temperatures and may require special\n" +
        "                                handling to maintain their quality.";

    return (
        <ProductDescriptionBase
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            productData={productData}
            isHeartFilled={isHeartFilled}
            onToggleHeart={() => setIsHeartFilled(!isHeartFilled)}
        >
            {/* Customization */}
            <Accordion variant="splitted">
                <AccordionItem
                    key="Property"
                    aria-label="Property"
                    title={`${productData.name} Property`}
                    indicator={<IconNotebookPen className="w-6 h-6 text-text rotate-45" />}
                >
                    <div className={`flex flex-col space-y-4 mb-6`}>
                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                aria-label={"Moistness hghg"}
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Moistness level"
                                value={65}
                                showCustomLabelString={false}
                                showValueLabel={true}
                            />
                            <div>
                                <p className={"text-small text-default-500"}>{extraInfo ? text : limitChar(text, limitCharLength)}</p>
                                <button className={`text-small text-default-500 ${extraInfo ? "hidden" : ""}`}
                                        onClick={() => setExtraInfo(true)}>Show More!
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Freezing Level"
                                value={10}

                                showValueLabel={false}
                                showCustomLabelString={true}
                                labelValueString={"Low Freezing Level"}
                            />
                            <div>
                                <p className={"text-small text-default-500"}>{extraFreezInfo ? textFreez : limitChar(textFreez, limitCharLength)}</p>
                                <button className={`text-small text-default-500 ${extraFreezInfo ? "hidden" : ""}`}
                                        onClick={() => setExtraFreezInfo(true)}>Show More!
                                </button>
                            </div>

                        </div>
                        <div>

                            <span>Nutrition Content</span>
                            <p className={`text-small text-default-500`}>Nutrition progress bars below indicates the average
                                proportion compared with other desserts of similar type. Nutrition properties can be
                                changed after customization of your dessert.</p>
                        </div>

                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Calories"
                                value={70}
                                showCustomLabelString={true}
                                showValueLabel={false}
                                labelValueString={"616 cal"}
                            />
                        </div>
                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Fat"
                                value={20}
                                showCustomLabelString={true}
                                showValueLabel={false}
                                labelValueString={"42.2g"}
                            />
                        </div>
                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Protein"
                                value={40}
                                showCustomLabelString={true}
                                showValueLabel={false}
                                labelValueString={"10.3g"}
                            />
                        </div>
                        <div className="flex flex-col w-full space-y-4">
                            <Progress
                                // @ts-ignore
                                size="sm"
                                radius="sm"
                                classNames={{
                                    base: "max-w-md",
                                    track: "drop-shadow-md border border-default",
                                    indicator: "bg-gradient-to-r from-secondary to-primary",
                                    label: "tracking-wider font-medium text-default-600",
                                    value: "text-foreground/60",
                                }}
                                label="Carbonhydrate"
                                value={40}
                                showCustomLabelString={true}
                                showValueLabel={false}
                                labelValueString={"70.4 g"}
                            />
                        </div>
                    </div>

                </AccordionItem>
                <AccordionItem
                    key="Customize"
                    aria-label="Customize"
                    title={`Customize ${productData.name}`}
                    indicator={<IconEdit className="w-6 h-6 text-text"/>}
                >
                    <div className={`flex flex-col w-full space-y-12 mb-6 desktop:px-10 px-3`}>
                        <Slider
                            label="Sweetness Level"
                            color={"secondary"}
                            showTooltip={true}
                            showSteps={true}
                            step={1}
                            formatOptions={{style: "decimal"}}
                            maxValue={4}
                            minValue={0}
                            renderValue={() => {
                                switch (sweetnessLevel) {
                                    case 0:
                                        return "Low";
                                    case 1:
                                        return "Light";
                                    case 2:
                                        return "Medium";
                                    case 3:
                                        return "High";
                                    case 4:
                                        return "Sweet Bomb";
                                }
                            }}
                            marks={[
                                {
                                    value: 0,
                                    label: "Low",
                                },
                                {
                                    value: 2,
                                    label: "Normal",
                                },
                                {
                                    value: 4,
                                    label: "Extreme",
                                },
                            ]}
                            defaultValue={2}
                            onChange={(value) => setSweetnessLevel(Number(value))}
                            className="max-w-full"
                        />
                        <div className="flex flex-col w-full space-y-4">
                            <Slider
                                label="Tartness Level"
                                color={"secondary"}
                                showTooltip={true}
                                showSteps={true}
                                step={1}
                                formatOptions={{style: "decimal"}}
                                maxValue={4}
                                minValue={0}
                                renderValue={() => {
                                    switch (tartnessLevel) {
                                        case 0:
                                            return "No tartness";
                                        case 1:
                                            return "Mild";
                                        case 2:
                                            return "Medium";
                                        case 3:
                                            return "High";
                                        case 4:
                                            return "Extreme";
                                    }
                                }}
                                marks={[
                                    {
                                        value: 0,
                                        label: "Without",
                                    },
                                    {
                                        value: 2,
                                        label: "Medium",
                                    },
                                    {
                                        value: 4,
                                        label: "Extreme",
                                    },
                                ]}
                                defaultValue={1}
                                onChange={(value) => setTartnessLevel(Number(value))}
                                className="max-w-full"
                            />
                            <p className="text-small text-default-500">Overview: {getOverviewTartness()}</p>
                        </div>
                        <div className="flex flex-col w-full space-y-4">
                            <Slider
                                label="Bitterness Level"
                                color={"secondary"}
                                showTooltip={true}
                                showSteps={true}
                                step={1}
                                formatOptions={{style: "decimal"}}
                                maxValue={4}
                                minValue={0}
                                renderValue={() => {
                                    switch (bitternessLevel) {
                                        case 0:
                                            return "No bitterness";
                                        case 1:
                                            return "Slight";
                                        case 2:
                                            return "Moderate";
                                        case 3:
                                            return "Strong";
                                        case 4:
                                            return "Intense";
                                    }
                                }}
                                marks={[
                                    {
                                        value: 0,
                                        label: "Without",
                                    },
                                    {
                                        value: 2,
                                        label: "Moderate",
                                    },
                                    {
                                        value: 4,
                                        label: "Intense",
                                    },
                                ]}
                                defaultValue={3}
                                onChange={(value) => setBitternessLevel(Number(value))}
                                className="max-w-full"
                            />
                            <p className="text-small text-default-500">Overview: {getOverviewBitternessLevel()}</p>
                        </div>
                        <div className="flex w-full max-w-xs flex-col gap-2">
                            <Select
                                label="Flavour Type"
                                placeholder="Select a flavour"
                                description={`${productData.name} can have different flavours`}
                                defaultSelectedKeys={["vanilla"]}
                                selectedKeys={type}
                                className="max-w-xs"
                                onSelectionChange={(selected) => setType(selected as string)}
                            >
                                {flavourTypes.map((flavour) => (
                                    <SelectItem key={flavour.key}>
                                        {flavour.label}
                                    </SelectItem>
                                ))}
                            </Select>
                            <p className="text-small text-default-500">Selected: {type}</p>
                        </div>
                        <div className={"flex flex-col space-y-3"}>
                            <span>Dietary Accommodation</span>
                            <div className={"grid grid-cols-1  space-y-3"}>
                                <Switch
                                    size="lg"
                                    color="secondary"
                                    startContent={<IconGlutenFree />}
                                    endContent={<IconGluten />}
                                    isSelected={isGlutenFree}
                                    onChange={() => setIsGlutenFree(!isGlutenFree)}
                                >
                                    {isGlutenFree ? "Gluten Free" : "Contains Gluten"}
                                </Switch>
                                <Switch
                                    size="lg"
                                    color="secondary"
                                    startContent={<IconVegan />}
                                    endContent={<IconMeet />}
                                    isSelected={isVegan}
                                    onChange={() => setIsVegan(!isVegan)}
                                >
                                    {isVegan ? "Vegan" : "Non-Vegan"}
                                </Switch>
                                <Switch
                                    size="lg"
                                    color="secondary"
                                    startContent={<IconEggOff />}
                                    endContent={<IconEgg />}
                                    isSelected={isEggFree}
                                    onChange={() => setIsEggFree(!isEggFree)}
                                >
                                    {isEggFree ? "Egg Free" : "Contains Egg"}
                                </Switch>
                                <Switch
                                    size="lg"
                                    color="secondary"
                                    startContent={<IconNutsFree />}
                                    endContent={<IconNuts />}
                                    isSelected={isNutFree}
                                    onChange={() => setIsNutFree(!isNutFree)}
                                >
                                    {isNutFree ? "Nut Free" : "Contains Nuts"}
                                </Switch>
                            </div>
                        </div>
                        <div className={"flex flex-col space-y-3"}>
                            <span>Notes </span>
                            <Textarea
                                variant="faded"
                                placeholder="Enter your custom notes for Bakerz"
                                description="Enter a description in case you want something truly special."
                                className="max-w-xs"
                            />
                        </div>
                    </div>
                </AccordionItem>
            </Accordion>
            {/* Quantity Selector */}
            <div>
                <Slider
                    label={`${productData.name} to buy`}
                    size="lg"
                    color={"secondary"}
                    defaultValue={quantity}
                    minValue={1}
                    maxValue={100}
                    getValue={(items) => `${items} of 100 ${productData.name}`}
                    onChangeEnd={(value) => setQuantity(Number(value))}
                    className="max-w-full"
                />
            </div>

            {/* Add to Order Button */}
            <div className="text-center">
                <Button
                    className="w-full text-white py-3 rounded-md"
                    variant={"default"}
                    onClick={handleAddOrder}
                    disabled={isLoading}
                    onPress={handleConfetti}
                >
                    Add {quantity} to order • {totalPrice}
                </Button>
            </div>
        </ProductDescriptionBase>
    );
}

interface ProductDescriptionBakerzProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    productData: ProductDataField;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
}

export function ProductDescriptionBakerz({
                                             isDialogOpen,
                                             setDialogOpen,
                                             productData,
                                             isPending,
                                             setPending,
                                             setStoreData,
                                         }: ProductDescriptionBakerzProps) {
    const [isHeartFilled, setIsHeartFilled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {editProductDialogBakerz} = useProductDialog();

    const handleEditProduct = () => {
        setIsLoading(true);
        editProductDialogBakerz(productData, isPending, setPending, setStoreData);
        setDialogOpen(false);
        setIsLoading(false);
    };

    const onSubmit = async () => {
        setPending(true);
        setIsLoading(true);


        const response = await fetch(`/api/store/actions/product/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: productData.store_id,
                productId: productData.id
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            toast.error((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
            setIsLoading(false);
            setPending(false);
            return;
        } else {
            toast.success((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconSuccess color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );

            // @ts-ignore
            setStoreData(prevState => ({
                ...prevState,
                // @ts-ignore
                products: prevState.products.filter((product) => product.id !== productData?.id)
            }));
        }

        setIsLoading(false);
        setDialogOpen(false);
        setPending(false);
    }



    return (
        <ProductDescriptionBase
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            productData={productData}
            isHeartFilled={isHeartFilled}
            onToggleHeart={() => setIsHeartFilled(!isHeartFilled)}
        >
            {/* Update Product Button */}
            <div className="flex flex-row text-center gap-x-10">
                <Button
                    className="w-full py-3 rounded-md"
                    onClick={() => onSubmit()}
                    disabled={isLoading}
                    color={"warning"}
                >
                    Delete
                </Button>
                <Button
                    className="w-full text-white py-3 rounded-md"
                    onClick={handleEditProduct}
                    disabled={isLoading}
                >
                    Update
                </Button>
            </div>
        </ProductDescriptionBase>
    );
}
