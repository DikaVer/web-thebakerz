"use client";
import { useForm} from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {LoginSchema, storeCreationSchema} from "@/lib/schemas";
import { z } from "zod";
import {login} from "@/lib/actions/auth-actions";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {ChangeEvent, useCallback, useEffect, useMemo, useState, useTransition} from "react";
import {FormError} from "@/components/authentication/form-error";
import {createStore} from "@/lib/actions/store/store-actions";
import {toast} from "sonner";


export default function CreateStore() {

    const [error, setError] = useState<string | undefined>();

    const [isPending, startTransition] = useTransition();

    const [data, setData] = useState<{
        image: string | null
    }>({
        image: null
    })
    const [file, setFile] = useState<File | null>(null)

    const [dragActive, setDragActive] = useState(false)

    const form = useForm<z.infer<typeof  storeCreationSchema>>({
        resolver: zodResolver(storeCreationSchema),
        defaultValues: {
            storeName: "",
            description: "",
            backgroundImage: "",
        }
    });


    const onChangePicture = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.currentTarget.files && event.currentTarget.files[0]
            if (file) {
                if (file.size / 1024 / 1024 > 5) {
                    toast.error('File size too big (max 5MB)')
                } else {
                    setFile(file)
                    const reader = new FileReader()

                    reader.onload = (e) => {
                        const base64String = e.target?.result as string;
                        setData((prev) => ({ ...prev, image: base64String }));
                    }
                    form.setValue('backgroundImage', file.name)
                    reader.readAsDataURL(file)
                }
            }
        },
        [setData]
    )


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
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
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
                                            className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            rows={5}
                                            placeholder="Tell us about your store..."
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
                                        <label
                                            htmlFor={"image-upload"}
                                            className={"group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"}>
                                            <div
                                                className="absolute z-[5] h-full w-full rounded-md"
                                                onDragOver={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDragActive(true)
                                                }}
                                                onDragEnter={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDragActive(true)
                                                }}
                                                onDragLeave={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDragActive(false)
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setDragActive(false)

                                                    const file = e.dataTransfer.files && e.dataTransfer.files[0]
                                                    if (file) {
                                                        if (file.size / 1024 / 1024 > 5) {
                                                            toast.error('File size too big (max 5MB)')
                                                        } else {
                                                            setFile(file)
                                                            const reader = new FileReader()
                                                            reader.onload = (e) => {
                                                                setData((prev) => ({
                                                                    ...prev,
                                                                    image: e.target?.result as string,
                                                                }))
                                                            }
                                                            reader.readAsDataURL(file)
                                                        }
                                                    }
                                                }}
                                            />
                                            <div
                                                className={`${
                                                    dragActive ? 'border-2 border-black' : ''
                                                } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
                                                    data.image
                                                        ? 'bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md'
                                                        : 'bg-white opacity-100 hover:bg-gray-50'
                                                }`}
                                            >
                                                <svg
                                                    className={`${
                                                        dragActive ? 'scale-110' : 'scale-100'
                                                    } h-7 w-7 text-primary transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path
                                                        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                                                    <path d="M12 12v9"></path>
                                                    <path d="m16 16-4-4-4 4"></path>
                                                </svg>
                                                <p className="mt-2 text-center text-sm text-gray-500">
                                                    Drag and drop or click to upload.
                                                </p>
                                                <p className="mt-2 text-center text-sm text-gray-500">
                                                    Max file size: 5MB
                                                </p>
                                                <span className="sr-only">Photo upload</span>
                                            </div>
                                            {data.image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={data.image}
                                                    alt="Preview"
                                                    className="h-full w-full rounded-md object-cover"
                                                />
                                            )}
                                            <div className="mt-1 flex rounded-md shadow-sm">
                                                <Input
                                                    {...field}
                                                    id="image-upload"
                                                    name="backgroundImage"
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    value={undefined}
                                                    onChange={onChangePicture}
                                                />
                                            </div>
                                        </label>
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
