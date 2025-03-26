"use client";

import React, {startTransition, useActionState, useEffect, useState} from "react";
import {
    addToast,
    Button, cn, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader,
    Spacer,
    useDisclosure
} from "@heroui/react";

import {Icon} from "@iconify/react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, today, now} from "@internationalized/date";

import {useStore} from "@/components/providers/store-provider";
import {
    parseDateParams, parseDateTime,

} from "@/components/store/store-header/calendar/calendar-params";
import {formatDate, SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {fetchClientSecret} from "@/lib/actions/stripe";
import showErrorMessage from "@/components/toast/toast-error";
import {CopyText} from "@/components/ui/copy-text";
import {IconClose, IconMail} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {CustomerOrderSchema, ProfileSettingsSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {createOrder} from "@/lib/actions/order";
import {useTranslations} from "next-intl";
import {useCart} from "@/components/providers/cart-provider";


interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    handleNext: () => void;
}

type ClientSecretResponse = string | { error: string }

export function ScheduleBakerzOrder({ dateParam, timeParam, handleNext}: StoreSubHeaderProps) {
    const t = useTranslations("app/(store)/components/orders/add");
    const searchParams = useSearchParams();
    const { store } = useStore();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    const [clientSecret, setClientSecret] = useState<string | null | undefined>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const { removeAllItems } = useCart();
    const router = useRouter();

    const form = useForm<z.infer<typeof CustomerOrderSchema>>({
        resolver: zodResolver(CustomerOrderSchema),
        defaultValues: {
            name: undefined,
            email: undefined,
            phoneNumber: undefined,
        },
    });
    const storeUrl = store?.storeName ? store?.storeName : store?.id;

    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof CustomerOrderSchema>) => {
            // Pass along the user's email and role so the updateProfile action can write to the proper tables
            setIsLoading(true);
            const result = await createOrder(formData);

            if (result?.orderId) {
                addToast({
                    title: t("orderCreated"),
                    description: t("orderCreatedSuccess"),
                    color: "success",
                    shouldShowTimeoutProgress: true,
                    timeout: 2000,
                })
                removeAllItems();
                handleNext();
                router.push(`/${storeUrl}/orders/${result.orderId}?email=${formData.email}`);
                router.refresh();
            } else if (result?.error) {
                showErrorMessage({error: result.error});
            } else {
                showErrorMessage({error: t("failedCreateOrder")});
            }
            setIsLoading(false);
        },
        null
    );




    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = async (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
        } else {
            const {date, time} = parseDateTime(newDate);
            // Update the URL search parameters (make sure this runs on the client)
            if (date && time) {
                setSelectedDate(parseDateParams(`${date} ${time}`))
                await updateOrderTime(date, time);
            }
            setSelectedDate(newDate);
        }
    };

    const handleSubmit = (formData: z.infer<typeof CustomerOrderSchema>) => {
        startTransition(() => {
            submitAction(formData)
        });
    };


    useEffect(() => {
        const dateParam = searchParams.get("date");
        const timeParam = searchParams.get("time");
        setSelectedDate(parseDateParams(`${dateParam} ${timeParam}`));
        // Add your handling logic here.
    }, [searchParams]);

    const getClientSecret = async () => {
        try {
            setIsLoading(true)
            if (!store.id || !store.stripe_id) {
                throw new Error('Invalid store id or stripe id')
            }

            const response = await fetchClientSecret(store.id, store.stripe_id) as ClientSecretResponse

            if (typeof response === 'object' && 'error' in response) {
                showErrorMessage({ error: response.error })
            } else if (typeof response === 'string') {
                setClientSecret(response)
            } else {
                const errorMsg = t("failedInitCheckout")
                showErrorMessage({ error: errorMsg })
            }
        } catch (err) {
            const errorMsg = t("somethingWentWrong")
            showErrorMessage({ error: errorMsg })
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className={'flex flex-col gap-y-4 w-full max-w-[440px]'}>
                <SmartDatetimeInput
                    schedule={store.schedule}
                    minValue={(() => {
                        return now("Europe/Amsterdam");
                    })()}
                    value={selectedDate}
                    onValueChange={handleDateChange}
                    placeholder={t("scheduleOrderTime")}
                >
                    <Button
                        startContent={<Icon icon={'solar:walking-round-linear'} width={24}/>}
                        isLoading={isLoading || isPending}
                        variant={selectedDate instanceof CalendarDateTime ? "bordered" : 'solid'}
                        className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600' : 'text-white bg-gradient-primary'} text-sm`}
                        onPress={() =>
                            addToast({
                                description: t("pickUpOptionSelected"),
                                color: "success",
                                shouldShowTimeoutProgress: true,
                                timeout: 1000,
                            })}
                    >
                        {(selectedDate instanceof CalendarDateTime) ? `${t("pickUpAt")} ${formatDate(selectedDate)}` : t("selectPickUpTime")}
                    </Button>
                </SmartDatetimeInput>
            </div>
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-center max-w-[440px] gap-x-4'}>
                {clientSecret && (
                    <>
                        <Modal
                            isOpen={isOpen}
                            backdrop="blur"
                            size="sm"
                            onOpenChange={onOpenChange}
                            classNames={{
                                closeButton: 'p-1'
                            }}
                            closeButton={
                                <div className={'absolute w-full right-0'}>
                                    <IconClose size={32} primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                               secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                                    />
                                </div>
                            }
                        >
                            <ModalContent>
                                {(onClose) => (
                                    <>
                                        <ModalHeader className="flex flex-col gap-1">{t("orderLink")}</ModalHeader>
                                        <ModalBody>
                                            <p>
                                                {t("copyLinkInstructions")}
                                            </p>
                                            <Input
                                                label={t("orderLink")}
                                                classNames={{
                                                    input: 'truncate',
                                                }}
                                                value={process.env.NEXT_PUBLIC_API_BASE_URL + "/" + storeUrl + "/pay/" + clientSecret}
                                            />
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="light" onPress={onClose}>
                                                {t("close")}
                                            </Button>
                                            <Button color="primary" variant="light" onPress={() => {
                                                onClose();
                                                navigator.clipboard.writeText(process.env.NEXT_PUBLIC_API_BASE_URL + "/" + storeUrl + "/pay/" + clientSecret);
                                                showSuccessMessage({success: t("orderLinkCopiedClient")});
                                            }}>
                                                {t("copyLink")}
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </>
                )}
                {(!isCreating) ? (
                    (selectedDate instanceof CalendarDateTime) && (
                        <section id={'create order - buttons'}>
                            <p className={cn("text-center my-2 text-default-500",

                            )}>
                                {t("hasCustomerPaid")}
                            </p>
                            <div className={'flex w-full gap-x-8'}>
                                <Button
                                    variant={'bordered'}
                                    className={`w-1/3`}
                                    isLoading={isLoading}
                                    onPress={() => setIsCreating(true)}
                                >
                                    {t("Yes")}
                                </Button>
                                <Button
                                    isLoading={isLoading}
                                    variant={'bordered'}
                                    className={`${!(selectedDate instanceof CalendarDateTime) ? "" : "bg-gradient-primary text-white border-none"}  w-2/3`}
                                    onPress={async () => {
                                        await getClientSecret();
                                        onOpen();
                                    }}
                                >
                                    {t("No")}
                                </Button>
                            </div>
                        </section>
                    )
                ) : (
                    <>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                            className={'grid gap-y-1 w-full'}
                        >
                            <div>
                                <p className="text-base font-medium text-default-700">Customer Details</p>

                                <p className="mt-1 text-sm font-normal text-default-400">Enter customer name.</p>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className={'mt-2'}
                                                    isDisabled={isLoading || isPending}
                                                    startContent={
                                                        <Icon icon={'stash:user-avatar'} className={'text-default-500'} width={24}/>
                                                    }
                                                    placeholder={`Enter customer name`}
                                                    type="text"
                                                    validate={() => {
                                                        return fieldState.error?.message;
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Spacer y={2}/>

                                <p className="mt-1 text-sm font-normal text-default-400">Enter customer e-mail address.</p>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className={'mt-2'}
                                                    isDisabled={isLoading || isPending}
                                                    startContent={
                                                        <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                    }
                                                    placeholder={`Enter customer email address`}
                                                    type="text"
                                                    validate={() => {
                                                        return fieldState.error?.message;
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Spacer y={2}/>

                                <p className="mt-1 text-sm font-normal text-default-400">Enter customer phone number. (Optional)</p>
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className={'mt-2'}
                                                    isDisabled={isLoading}
                                                    startContent={
                                                        <Icon icon={"solar:phone-calling-bold"} className="text-default-400 pointer-events-none flex-shrink-0" width={24}/>
                                                    }
                                                    placeholder={`Enter customer phone number`}
                                                    type="text"
                                                    validate={() => {
                                                        return fieldState.error?.message;
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end w-full mt-4">
                                <Button
                                    type="submit"
                                    variant={'bordered'}
                                    isLoading={isPending || isLoading}
                                    isDisabled={!form.watch("email") && !form.watch("phoneNumber")}
                                    className={`${(!form.watch("email") && !form.watch("phoneNumber")) ? "" : "bg-gradient-primary text-white border-none"} w-full`}
                                    endContent={<Icon icon="solar:alt-arrow-right-linear" width={24} />}
                                >
                                    Create Order
                                </Button>
                            </div>


                        </form>
                    </Form>
                    </>
                    )
                }
            </div>
        </div>
    );
}
