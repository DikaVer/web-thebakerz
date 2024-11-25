"use client";
import React, {useCallback, useEffect, useState, useTransition} from "react";
import {useCart} from "@/components/providers/cart-provider";
import {pacifico} from "@/components/fonts";
import {addUserLocationData, useCheckoutSettings} from "@/lib/hooks/useCheckoutSettings";
import {SwitchDelivery} from "@/components/scheduler/switch-delivery";
import {AddressSearch} from "@/components/scheduler/address-search";
import {IconAvatar, IconClock} from "@/components/ui/icons";
import {formatCurrency, formatDateTime} from "@/lib/utils";
import {timeMap} from "@/lib/local-variables";
import {Button} from "@/components/ui/button";
import {AddressDataUserField, CartItem, CheckoutData} from "@/lib/definitions";
import {ScrollArea} from "@/components/ui/scroll-area";
import {TimeSelection} from "@/components/scheduler/time-selection";
import {AddressSelection} from "@/components/scheduler/address-selection";
import Shop from "@/components/cart/shop";
import {useRouter, useSearchParams} from "next/navigation";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import Image from "next/image";
import ShopItem from "@/components/cart/shop-item";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {CheckoutSchema, LoginSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {login, loginWithProvider} from "@/lib/actions/auth-actions";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {FormSuccess} from "@/components/authentication/form-success";
import {FormError} from "@/components/authentication/form-error";
import {Search} from "lucide-react";
import {ClipLoader} from "react-spinners";
import VerifyCode from "@/components/emails/verification/verify-email-code";


interface CheckoutViewProps {
    id: string;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
    userLocation: AddressDataUserField[] | null;
    email?: string | null
}

type CheckoutFormValues = z.infer<typeof CheckoutSchema>;

export interface SelectedTime {
    date: `${number}/${number}/${number}`;
    time: string;
}

export default function CheckoutView({id, availability, userLocation, email}: CheckoutViewProps) {

    const { cart } = useCart();

    useEffect(() => {
        if (userLocation) {
            addUserLocationData(userLocation);
        }
    }, [userLocation]);

    const { checkoutData, updateCheckoutData } = useCheckoutSettings();

    // State to control the visibility of the Scheduler dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // State to control the current view within the Scheduler
    const [isSchedulerView, setIsSchedulerView] = useState<
        "scheduler" | "timeSelection" | "addressSelection" | "addressEditing"
    >("scheduler");

    // State to manage the input address
    const [inputAddress, setInputAddress] = useState<AddressDataUserField | null>(null);

    const [error, setError] = useState<string | undefined>();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [isOTPWindow, setOTPWindow] = useState(false);
    const [otpCode, setOTPcode] = useState("");


    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            deliveryMode: checkoutData.deliveryMode,
            deliveryAddress: (checkoutData.deliveryAddress !== null && checkoutData.savedAddresses !== null) ? checkoutData.savedAddresses[checkoutData.deliveryAddress] : null,
            selectedTime: checkoutData.selectedTime as SelectedTime,
            email: email ? email : "",
        },
    });

    useEffect(() => {
        if (checkoutData.selectedTime) {
            form.setValue('selectedTime', checkoutData.selectedTime);
        }
    }, [checkoutData.selectedTime]);

    // Define handleSchedulerView to update the view and open the dialog
    const handleSchedulerView = (
        view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing"
    ) => {
        setIsSchedulerView(view);
        setIsDialogOpen(true);
    };

    // Define handleDialogClose to close the dialog
    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };
    const { handleSubmit, setValue, watch, formState: { errors, isSubmitting }, setError: setFormError } = form;

    const emailVerify = async (email: string) => {
        try {
            const emailValid = await validateEmailAPI(email);
            if (!emailValid) {
                setFormError('email', { type: 'manual', message: 'Email is already used' });
                return;
            } else {

            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
    }

    const onSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
        // Validate cart
        if (!cart[id] || cart[id].products.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        try {

            // Proceed to the next step, e.g., payments
            router.push('/payment');
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    return (
            !isOTPWindow ? (
                <div>
                    <VerifyCode
                        setOTPWindow={setOTPWindow}
                        setOTPcode={setOTPcode}
                        error={error}
                    />
                </div>
            ) : (

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className={`border-1 border-grayComp rounded-lg h-fit shadow-md`}>
                        <div className={'flex flex-col justify-center p-5 gap-4'}>
                            <p className={`text-3xl font-bold text-center ${pacifico.className}`}>Checkout Process</p>
                            <hr className="border-grayBg"/>

                            {/* Delivery Mode Switch */}
                            <div className={"flex flex-col justify-between items-center"}>
                                <FormField
                                    control={form.control}
                                    name="deliveryMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <SwitchDelivery
                                                    isPickup={checkoutData.deliveryMode === "PICKUP"}
                                                    onSwitchClick={() => {
                                                        setValue('deliveryMode', checkoutData.deliveryMode);
                                                    }}
                                                    checkoutData={checkoutData}
                                                    updateCheckoutData={updateCheckoutData}
                                                />

                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Address Search */}
                            {checkoutData.deliveryMode === "DELIVERY" && (
                                <FormField
                                    control={form.control}
                                    name="deliveryAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <AddressSearch
                                                    handleSchedulerView={handleSchedulerView}
                                                    setInputAddress={setInputAddress}
                                                    checkoutData={checkoutData}
                                                    updateCheckoutData={updateCheckoutData}
                                                />
                                            </FormControl>
                                            <FormDescription>Select your delivery address</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Time Preferences */}
                            <FormField
                                control={form.control}
                                name="selectedTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-medium">Time Preferences</FormLabel>
                                        <FormControl>
                                            <div
                                                className="flex flex-row justify-between items-center space-x-2 my-1 py-1 transition duration-500 cursor-pointer rounded-lg"
                                                onClick={() => handleSchedulerView("timeSelection")}
                                            >
                                                <IconClock className={"w-8 h-8 tm:w-10 tm:h-10"}/>
                                                <div className={"flex flex-col w-full"}>
                                                    {
                                                        checkoutData.selectedTime ? (
                                                            <>
                                                                <p className="font-medium text-left text-sm tm:text-base">
                                                                    {new Date(checkoutData.selectedTime?.date as string).toDateString()}
                                                                </p>
                                                                <p className="font-medium text-left text-sm tm:text-base">
                                                                    {formatDateTime(timeMap[checkoutData.selectedTime.time as string].from)} - {formatDateTime(timeMap[checkoutData.selectedTime.time as string].to)}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <p className="text-left text-lg tm:text-xl">Schedule {checkoutData.deliveryMode === "PICKUP" ? "Pickup" : "Delivery"}</p>
                                                        )
                                                    }
                                                </div>
                                                <Button
                                                    className={"text-lg h-9"}
                                                    type="button"
                                                    onClick={() => handleSchedulerView("timeSelection")}
                                                >
                                                    Schedule
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Select your preferred time</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Contact Information - Email */}
                            {(email === undefined || email === null) && (
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormDescription>Enter your email address for contact</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Cart Products */}
                            <div className={'gap-4'}>
                                <p className="text-xl font-medium">Cart Products</p>
                                {cart[id] && (
                                    <CartView
                                        storeId={cart[id].storeId}
                                        avatar_url={cart[id].image}
                                        shopName={cart[id].nickname}
                                        value={`shop-${id}`}
                                        productItems={cart[id].products}
                                    />
                                )}
                                {errors && <p className="text-red-500">{errors.root?.message}</p>}
                            </div>

                            {/* General Form Error */}
                            {error && <p className="text-red-500">{error}</p>}

                            {/* Submit Button */}
                            {/*<div className="flex my-4 justify-end">*/}
                            {/*    <Button*/}
                            {/*        className="w-48 h-10 py-0 px-4"*/}
                            {/*        type="submit"*/}
                            {/*        disabled={isSubmitting}*/}
                            {/*    >*/}
                            {/*        {isSubmitting ? 'Processing...' : 'Next'}*/}
                            {/*    </Button>*/}
                            {/*</div>*/}
                        </div>

                        {/* Scheduler Dialog */}
                        <CheckoutContent
                            availability={availability}
                            checkoutData={checkoutData}
                            updateCheckoutData={updateCheckoutData}
                            isDialogOpen={isDialogOpen}
                            handleDialogClose={handleDialogClose}
                            isSchedulerView={isSchedulerView}
                            setIsSchedulerView={setIsSchedulerView}
                            setInputAddress={(input: AddressDataUserField | null) => {
                                setInputAddress(input);
                                form.setValue('deliveryAddress', input);
                            }}
                            inputAddress={inputAddress}
                        />
                    </form>
                </Form>
            )
    );
}

interface CheckoutContentProps {
    isDialogOpen: boolean;
    handleDialogClose: () => void;
    checkoutData: CheckoutData;
    updateCheckoutData: () => void;
    isSchedulerView: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing";
    setIsSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => void;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
    inputAddress: AddressDataUserField | null;
    setInputAddress: (input: AddressDataUserField | null) => void;
}

function CheckoutContent({availability, checkoutData, isDialogOpen, handleDialogClose, isSchedulerView, updateCheckoutData, setIsSchedulerView, setInputAddress, inputAddress }: CheckoutContentProps) {

    const toggleSchedulerView = (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => {
        setIsSchedulerView(view);
    };

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);

    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        toggleSchedulerView("scheduler");
        setTimeout(() => {
            handleDialogClose();
        }, 400);
    }

    return (

        <>
        {isSchedulerView !== "scheduler" && (
            <>
                <div
                    data-state={isOpen ? 'open' : 'closed'}
                    className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=open]:fade-in-0"
                    onClick={(e) => {
                        toggleClose();
                    }}/>
                <div
                    data-state={isOpen ? 'open' : 'closed'}
                    className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
                >
                    <ScrollArea className={"max-h-[75vh]"}>

                        {isSchedulerView === "timeSelection" && (
                            <TimeSelection
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                handleSchedulerView={toggleSchedulerView}
                                availability={availability}
                            />
                        )}
                        {isSchedulerView === "addressSelection" && (
                            <AddressSelection
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                initialInput={inputAddress}
                                setInputAddress={setInputAddress}
                                handleSchedulerView={toggleSchedulerView}
                                isEditing={false}
                            />
                        )}
                        {isSchedulerView === "addressEditing" && (
                            <AddressSelection
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                initialInput={inputAddress}
                                setInputAddress={setInputAddress}
                                handleSchedulerView={toggleSchedulerView}
                                isEditing={true}
                            />
                        )}
                    </ScrollArea>
                </div>
            </>
        )}
        </>
    );
}

interface CartViewProps {
    avatar_url: string;
    shopName: string;
    storeId: string;
    value: string;
    productItems: CartItem[];
    email?: string | null;
}

const CartView: React.FC<CartViewProps> = ({storeId, avatar_url, shopName, value, productItems, email}) => {
    const [total, setTotal] = useState(0);
    const [isHoveringStepper, setIsHoveringStepper] = useState(false);
    const [isItemsUpdating, setIsItemsUpdating] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const router = useRouter();

    const { removeFromCart, updateProductCart } = useCart();

    // Function to calculate the total sum
    const calculateTotal = (items: CartItem[] = productItems) => {
        return items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    };

    useEffect(() => {
        setIsItemsUpdating(true);
        setTotal(calculateTotal(productItems));
        setIsItemsUpdating(false);
    }, [productItems]);

    const deleteItem = useCallback(async (id: string) => {
        setIsItemsUpdating(true);

        removeFromCart(storeId, id);

        setIsItemsUpdating(false);
    }, [productItems]);


    const updateItem = useCallback(async (id: string, amount: number) => {
        setIsItemsUpdating(true);

        const product = productItems.find((item) => item.uniqueId === id);

        if (product) {
            updateProductCart(product, amount);
        }

        setIsItemsUpdating(false);
    }, [productItems]);


    if (!productItems || productItems.length === 0) {
        return null;
    }

    return (
        <>
            <div className="my-2 flex flex-row items-center space-x-3 justify-start">
                <div className="relative w-14 h-14">
                    {!isLoaded && !hasError && (
                        <IconAvatar
                            className="w-14 h-14 absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full"/>
                    )}
                    {avatar_url && !hasError && (
                        <Image
                            src={avatar_url}
                            alt="Avatar"
                            fill
                            sizes="25vw"
                            style={{objectFit: 'cover'}}
                            className={`rounded-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIsLoaded(true)}
                            onError={() => setHasError(true)}
                        />
                    )}
                    {(hasError || !avatar_url) && (
                        <IconAvatar
                            className="w-14 h-14 inset-0 flex items-center justify-center bg-gray-100 rounded-full"/>
                    )}
                </div>
                <div className="grid grid-col gap-0">
                    <p className="flex text-lg font-medium underline-on-hover">{shopName.charAt(0).toUpperCase() + shopName.slice(1)}</p>
                    <p className="flex text-sm text-grayText">{Object.values(productItems).length} items</p>
                </div>
            </div>
            <hr className="border-grayBg"/>
            <ScrollArea className="max-h-72">
                <ul className="grid">
                    {Object.values(productItems).map((item, index) => (
                        <ShopItem
                            key={item.uniqueId}
                            {...item}
                            onDelete={deleteItem}
                            onUpdate={updateItem}
                            isUpdating={setIsItemsUpdating}
                            onHoverChange={setIsHoveringStepper}
                            isHoveringStepper={isHoveringStepper}
                        />
                    ))}
                </ul>
            </ScrollArea>
            {isItemsUpdating ? (
                <div className={"flex flex-col justify-center items-center"}>
                    <ClipLoader
                        color={"#730C6F"}
                        loading={isItemsUpdating}
                        size={95}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.3}
                    />
                </div>
            ) : (
                <div className={"mt-2 flex flex-col gap-2"}>
                    <div className="flex justify-between">
                        <p className="text-grayText">Subtotal:</p>
                        <p className="text-grayText">{formatCurrency(total)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-grayText">Fees:</p>
                        <p className="text-grayText">{formatCurrency(0)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-bold">Total:</p>
                        <p className="font-bold">{formatCurrency(total)}</p>
                    </div>
                </div>
            )}
            <div className="flex my-4 justify-end">
                <Button
                    className="w-48 h-10 py-0 px-4"
                    disabled={isItemsUpdating}
                    type={"button"}
                >

                    <div className="flex flex-row w-full justify-center items-center">
                        <p className="text-xl">{email ? 'Proceed Payment' : 'Verify email'}</p>
                    </div>
                </Button>
            </div>
        </>
    );
};

export async function validateEmailAPI(email: string): Promise<boolean> {
    try {
        const response = await fetch('/api/validate-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        return result.valid;
    } catch (error) {
        console.error('Error validating email:', error);
        return false;
    }
}
