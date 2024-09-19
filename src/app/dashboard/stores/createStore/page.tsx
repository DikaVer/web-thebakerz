"use client";
import { useForm} from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {AddressDataFieldSchema, storeCreationSchema} from "@/lib/schemas";
import { z } from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {useEffect, useState, useTransition} from "react";
import {FormError} from "@/components/authentication/form-error";
import {createStore} from "@/lib/actions/store/store-actions";
import {ImageUploader} from "@/components/upload-image";
import {Switch} from "@/components/ui/switch";
import {ScrollArea} from "@/components/ui/scroll-area";
import {AddressSelection} from "@/components/store/address-selection";
import { AddressDataField} from "@/lib/definitions";
import {IconEdit, IconLocation} from "@/components/ui/icons";
import {Calendar} from "@/components/ui/calendar";
import {AvailabilitySelection} from "@/components/store/availability-selection";
import DeliveryOptions, {DeliveryLocation} from "@/components/store/delivery-options-selection";
import {store} from "next/dist/build/output/store";
import {FormSuccess} from "@/components/authentication/form-success";
import {toast} from "sonner";


export default function StoreForm() {

    const [error, setError] = useState<string | undefined>();

    const [success, setSuccess] = useState<string | undefined>();

    const [isPending, startTransition] = useTransition();

    const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    const [address, setAddress] = useState<AddressDataField | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    const [availabilityData, setAvailabilityData] = useState<Record<string, { from: string; to: string; availability: "Free" | "Busy" }>>({});


    const form = useForm<z.infer<typeof  storeCreationSchema>>({
        resolver: zodResolver(storeCreationSchema),
        defaultValues: {
            storeName: "",
            description: "",
            backgroundImage: null,
            availabilityCalendar: {},
            delivery: false,
            deliveryLocations: [],
        }
    });

    useEffect(() => {
        if (!form.getValues("delivery")) {
            setDeliveryLocations([]);
        }
    }, [form.getValues("delivery")]);

    useEffect(() => {
        form.setValue("deliveryLocations", deliveryLocations);
        form.setValue("availabilityCalendar", availabilityData);
    }, [deliveryLocations, availabilityData]);

    useEffect(() => {
        const results = storeCreationSchema.safeParse(form.getValues());
        if (!results.success) {
            setError(results.error.issues[0].message);
            setSuccess(undefined)
        } else {
            setError(undefined);
            setSuccess(undefined)
        }
    }, [form.getValues()]);


    const onSubmit = (formData: z.infer<typeof storeCreationSchema>) => {

        startTransition(() => {

            createStore(formData)
                .then((data) => {
                    console.log(data);
                if (data && data.error) {
                    toast.error(data.error);
                } else if (data && data.success) {
                    toast.success(data.success);
                }
            })
        });
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-lg">
            {isAddressDialogOpen && (
                <>
                    <div className="fixed z-30 h-full bg-black opacity-50 inset-0"
                         onClick={(e) => {
                             setIsAddressDialogOpen(false);
                         }}/>
                    <div
                        className={"fixed left-[50%] top-[60%] z-40 grid w-full max-w-lg sm:max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg rounded-lg"}
                    >
                        <ScrollArea className={"max-h-[75vh]"}>
                            <AddressSelection
                                initialInput={address}
                                setInputAddress={setAddress}
                                setAddressDialogOpen={setIsAddressDialogOpen}
                                isEditing={isEditing}/>
                        </ScrollArea>
                    </div>
                </>
            )}
            <div className="bg-white p-8 w-full max-w-lg rounded-lg shadow-md">
                <h2 className="text-3xl font-semibold mb-8 text-center text-black">Create a Store</h2>
                <p className={"block text-sm text-end font-medium text-gray-700"}>* - optional </p>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6">
                        {/* Store Name */}
                        <FormField
                            control={form.control}
                            name="storeName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel
                                        className="block text-sm font-medium text-gray-700">
                                        Store Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="mrs.bombochka"
                                            required
                                            type={"text"}
                                            onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel
                                        className="block text-sm font-medium text-gray-700">
                                        Description*
                                    </FormLabel>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black`}
                                            rows={5}
                                            placeholder="Tell us about your store... (max 500 characters)"
                                            maxLength={500}
                                            style={{resize: "none"}}
                                        ></textarea>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="backgroundImage"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel
                                        className="block text-sm font-medium text-gray-700">
                                        Background Image*
                                    </FormLabel>
                                    <FormControl>
                                        <ImageUploader form={form} field={field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({field}) => {

                                useEffect(() => {
                                    if (address) {
                                        field.onChange(address as AddressDataField); // Update the field when address is not null

                                        const result = AddressDataFieldSchema.safeParse(address);

                                        if (!result.success) {
                                            setError(result.error.issues[0].message);
                                            setSuccess(undefined)
                                        } else {
                                            setSuccess(undefined)
                                            setError(undefined);
                                        }
                                    } else {
                                        setSuccess(undefined)
                                        setError("Please provide a location store");
                                    }

                                }, [address]);

                                return (
                                    <FormItem>
                                        <FormLabel
                                            className="block text-sm font-medium text-gray-700">
                                            Location
                                        </FormLabel>
                                        <FormControl>
                                            <>
                                                {address ? (
                                                    <div>
                                                        <div
                                                            className={`flex flex-row justify-between items-center space-x-2 pr-2 py-1 transition duration-300 cursor-pointer rounded-lg`}
                                                        >
                                                            <IconLocation
                                                                className={"w-9 h-9"}
                                                                color={"primary"}
                                                            />
                                                            <div className={"flex w-full"}>
                                                                <p className="text-black text-lg">
                                                                    {address.streetAddress}
                                                                </p>
                                                            </div>
                                                            <div
                                                                className={`transition duration-500 hover:scale-115`}
                                                                onClick={() => {
                                                                    setIsEditing(true);
                                                                    setIsAddressDialogOpen(true);
                                                                }}
                                                            >
                                                                <IconEdit className={"w-6 h-6"}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type={"button"}
                                                        onClick={() => setIsAddressDialogOpen(true)}
                                                        className="w-full"
                                                        variant={"secondary"}
                                                    >
                                                        Add Location
                                                    </Button>
                                                )}
                                            </>
                                        </FormControl>
                                    </FormItem>
                                )
                            }}
                        />
                        <div
                            className="block text-sm font-medium text-gray-700">
                            Availability*
                        </div>
                        <div className={"flex justify-center"}>
                            <Calendar
                                setAvailabilityData={setAvailabilityData}
                                availabilityData={availabilityData}
                                mode="single"
                                className={"border-1 rounded-lg"}
                                initialFocus
                            />
                        </div>
                        <div
                            className="block text-sm text-center font-medium text-gray-700">
                            Advance option to set uo availability
                        </div>
                        <AvailabilitySelection
                            setAvailabilityData={setAvailabilityData}
                            availabilityData={availabilityData}
                        />
                        <FormField
                            control={form.control}
                            name="delivery"
                            render={({field}) => (
                                <FormItem className={"flex flex-row items-end gap-x-5 mt-0"}>
                                    <FormLabel
                                        className="block text-sm font-medium text-gray-700">
                                        Delivery Options*
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {form.getValues("delivery") && (
                            <DeliveryOptions
                                deliveryLocations={deliveryLocations}
                                setDeliveryLocations={setDeliveryLocations}
                            />
                        )}
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        {/* Submit Button */}
                        <div>
                            <Button
                                type="submit"
                                className=" w-full"
                                disabled={isPending}
                            >
                                Create Store
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
