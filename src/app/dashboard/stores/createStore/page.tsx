"use client";
import { useForm} from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {storeCreateSchema} from "@/lib/schemas";
import { z } from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {useEffect, useState, useTransition} from "react";
import {FormError} from "@/components/authentication/form-error";
import {createStore} from "@/lib/actions/store/store-actions";
import {ScrollArea} from "@/components/ui/scroll-area";
import {AddressSelection} from "@/components/store/address-selection";
import { AddressDataField} from "@/lib/definitions";
import {IconEdit, IconLocation} from "@/components/ui/icons";
import {FormSuccess} from "@/components/authentication/form-success";
import {formatAddress} from "@/lib/utils";
import {useRouter} from "next/navigation";


export default function StoreForm() {

    const [error, setError] = useState<string | undefined>();

    const [success, setSuccess] = useState<string | undefined>();

    const [isPending, startTransition] = useTransition();

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    const [address, setAddress] = useState<AddressDataField | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    const { refresh, push } = useRouter();


    const form = useForm<z.infer<typeof  storeCreateSchema>>({
        resolver: zodResolver(storeCreateSchema),
        defaultValues: {
            nickname: "",
            locationData: undefined
        }
    });



    const onSubmit = (formData: z.infer<typeof storeCreateSchema>) => {
        startTransition(() => {
            createStore(formData)
                .then((data) => {
                if (data && data.error) {
                    setError(data.error);
                } else if (data && data.success) {
                    setSuccess(data.success)
                    push(`/dashboard/stores`);
                    refresh();
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
                                setAddress={setAddress}
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
                            name="nickname"
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
                            name="locationData"
                            render={({field, fieldState}) => {

                                useEffect(() => {
                                    if (address) {
                                        field.onChange(address as AddressDataField); // Update the field when address is not null
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
                                                                    {formatAddress(address)}
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
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
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
