"use client";

import React, {startTransition, useActionState, useEffect, useState} from "react";
import {
    addToast,
    Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader,
    Spacer,
    useDisclosure
} from "@heroui/react";

import {Icon} from "@iconify/react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, today} from "@internationalized/date";

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
import {CustomerOrderSchema, ProfileSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {createOrder} from "@/lib/actions/order";


interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    handleNext: () => void;
}

type ClientSecretResponse = string | { error: string }

export function ScheduleBakerzOrder({ dateParam, timeParam, handleNext}: StoreSubHeaderProps) {
    const searchParams = useSearchParams();
    const { store } = useStore();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    const [clientSecret, setClientSecret] = useState<string | null | undefined>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { theme } = useTheme();

    const form = useForm<z.infer<typeof CustomerOrderSchema>>({
        resolver: zodResolver(CustomerOrderSchema),
        defaultValues: {
            email: undefined,
            phoneNumber: undefined,
        },
    });

    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof CustomerOrderSchema>) => {
            // Pass along the user's email and role so the updateProfile action can write to the proper tables
            setIsLoading(true);
            const result = await createOrder(formData);

            if (result?.success) {
                addToast({
                    title: "Order Created",
                    description: `Your Customer Order has been created successfully.`,
                    color: "success",
                    shouldShowTimeoutProgress: true,
                    timeout: 2000,
                })

            } else if (result?.error) {
                showErrorMessage({error: result.error});
            }
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
                const errorMsg = 'Failed to initialize checkout'
                showErrorMessage({ error: errorMsg })
            }
        } catch (err) {
            const errorMsg = 'Something went wrong. Please try again.'
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
                    minValue={today("Europe/Amsterdam").add({ days: 1 })}
                    value={selectedDate}
                    onValueChange={handleDateChange}
                    placeholder='Schedule Order Time'
                >
                    <Button
                        startContent={<Icon icon={'solar:walking-round-linear'} width={24}/>}
                        isLoading={isLoading}
                        variant={selectedDate instanceof CalendarDateTime ? "bordered" : 'solid'}
                        className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600' : 'text-white bg-gradient-primary'} text-sm`}
                        onPress={() =>
                            addToast({
                                // title: "Pick Up",
                                description: "Pick Up Option is selected",
                                //@ts-ignore
                                color: "success",
                                shouldShowTimeoutProgress: true,
                                timeout: 1000,
                            })}
                    >
                        {(selectedDate instanceof CalendarDateTime) ? `Pick Up at ${formatDate(selectedDate)}` : "Select Pick Up Time"}
                    </Button>
                </SmartDatetimeInput>
            </div>
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-center max-w-[440px] gap-x-4'}>
                {clientSecret && (
                    <>
                        <Modal
                            isOpen={isOpen}
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
                                        <ModalHeader className="flex flex-col gap-1">Order Link</ModalHeader>
                                        <ModalBody>
                                            <p>
                                                Copy the link below and send it to the client to complete the order.
                                            </p>
                                            <Input
                                                label="Order Link"
                                                classNames={{
                                                    input: 'truncate',
                                                }}
                                                value={process.env.NEXT_PUBLIC_API_BASE_URL + "/" + store.storeName + "/pay/" + clientSecret}
                                                // isDisabled={true}
                                            />
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button variant="light" onPress={onClose}>
                                                Close
                                            </Button>
                                            <Button color="primary" variant="light" onPress={() => {
                                                onClose();
                                                navigator.clipboard.writeText(process.env.NEXT_PUBLIC_API_BASE_URL + "/" + store.storeName + "/pay/" + clientSecret);
                                                showSuccessMessage({success: "Order Link Copied, Send it to Client!"});
                                            }}>
                                                Copy Link
                                            </Button>
                                        </ModalFooter>
                                    </>
                                )}
                            </ModalContent>
                        </Modal>
                    </>
                )}
                {!isCreating ? (
                    <>
                        <Button
                            variant={'bordered'}
                            isDisabled={!(selectedDate instanceof CalendarDateTime)}
                            className={`w-1/3`}
                            isLoading={isLoading}
                            onPress={() => setIsCreating(true)}
                        >
                            Create Order
                        </Button>
                        <Button
                            isLoading={isLoading}
                            variant={'bordered'}
                            isDisabled={!(selectedDate instanceof CalendarDateTime)}
                            className={`${!(selectedDate instanceof CalendarDateTime) ? "" : "bg-gradient-primary text-white border-none"}  w-2/3`}
                            endContent={<Icon icon={'solar:alt-arrow-right-linear'} width={24}/>}
                            onPress={async () => {
                                await getClientSecret();
                                onOpen();
                            }}
                        >
                            Send Order Ticket
                        </Button>
                    </>
                ) : (
                    <>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className={'grid gap-y-1 w-full'}
                        >
                            <div>
                                <p className="text-base font-medium text-default-700">Customer Details</p>
                                <p className="mt-1 text-sm font-normal text-default-400">Enter one of two customer details: e-mail address or phone number</p>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className={'mt-2'}
                                                    isDisabled={isLoading}
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
                                                    <Icon icon={"solar:phone-calling-bold"} className="text-2xl text-default-400 pointer-events-none flex-shrink-0" width={24}/>
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
