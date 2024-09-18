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
import {IconCross, IconEdit, IconLocation} from "@/components/ui/icons";
import {hidden} from "next/dist/lib/picocolors";
import {Calendar} from "@/components/ui/calendar";


export default function CreateStore() {

    const [error, setError] = useState<string | undefined>();

    const [isPending, startTransition] = useTransition();

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    const [address, setAddress] = useState<AddressDataField | null>(null);

    const [isEditing, setIsEditing] = useState(false);


    const form = useForm<z.infer<typeof  storeCreationSchema>>({
        resolver: zodResolver(storeCreationSchema),
        defaultValues: {
            storeName: "",
            description: "",
            backgroundImage: null,
            delivery: false,
        }
    });


    const onSubmit = (formData: z.infer<typeof storeCreationSchema>) => {
        startTransition(() => {
            console.log(formData);
            createStore(formData)
                .then((data) => {
                if (data && data.error) {
                    setError(data.error.message);
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
                                    <FormMessage />
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
                                        Description
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
                                    <FormMessage />
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
                                        Background Image
                                    </FormLabel>
                                    <FormControl>
                                        <ImageUploader form={form} field={field}/>
                                    </FormControl>
                                    <FormMessage />
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
                                        } else {
                                            setError(undefined);
                                        }
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
                            Availability
                        </div>
                        <div className={"flex justify-center"}>
                            <Calendar
                                mode="single"
                                className={"border-1 rounded-lg"}
                                initialFocus
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="delivery"
                            render={({field}) => (
                                <FormItem className={"flex flex-row items-end gap-x-5 mt-0"}>
                                    <FormLabel
                                        className="block text-sm font-medium text-gray-700">
                                        Delivery Options
                                    </FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormError message={error}/>

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
