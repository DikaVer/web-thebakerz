import React, {useState, useTransition} from "react";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ImageUploader} from "@/components/upload-image";
import {FormError} from "@/components/authentication/form-error";
import {FormSuccess} from "@/components/authentication/form-success";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {storeEditSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";

interface StoreViewDashboardProps {
    store: any;
    setStore: (store: any) => void;
    user: any;
    setUser: (user: any) => void;
}

export default function StoreViewDashboard({ store, setStore, user, setUser }: StoreViewDashboardProps) {

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof  storeEditSchema>>({
        resolver: zodResolver(storeEditSchema),
        defaultValues: {
            name: user.name,
            description: store.description,
            image: user.image,
            nickname: store.nickname,
            background: store.background_url
        }
    });

    const onSubmit = (formData: z.infer<typeof storeEditSchema>) => {

        startTransition(() => {


        });
    }

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    <FormField
                        control={form.control}
                        name="image"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Avatar Image
                                </FormLabel>
                                <FormControl>
                                    <ImageUploader
                                        form={form}
                                        field={field}
                                        name={"image"}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
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
                                        value={user.name}
                                        required
                                        type={"text"}
                                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                    />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    This is the name that will be used in your store's page near avatar.
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nickname"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Nickname
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        value={store.nickname}
                                        required
                                        type={"text"}
                                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                    />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    This is the name that will be used in your store's URL.
                                </FormDescription>
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
                                            value={store.description}
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
                        name="background"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Background Image
                                </FormLabel>
                                <FormControl>
                                    <ImageUploader
                                        form={form}
                                        field={field}
                                        name={"background"}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
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
    );
}