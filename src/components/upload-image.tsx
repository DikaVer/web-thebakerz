'use client';


import React, {ChangeEvent, useCallback, useState} from "react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {imageUploadSchema} from "@/lib/schemas";
import {ControllerRenderProps, UseFormReturn} from "react-hook-form";
import {FormError} from "@/components/authentication/form-error";
import {StoreData} from "@/lib/definitions";

interface ImageUploaderProps {
    form: UseFormReturn<any>;
    field: ControllerRenderProps<any>;
    name: string;
    setError: (input: string | undefined) => void;
    setStoreData: (data: StoreData) => void;
    data: {
        image: string | null;
    };
    setData: (data: { image: string | null }) => void;
}

export function ImageUploader({ form, field, name, setError, data, setData }: ImageUploaderProps) {

    const [file, setFile] = useState<File | null>(null)

    const [dragActive, setDragActive] = useState(false)

    const onChangePicture = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.currentTarget.files && event.currentTarget.files[0]
            const check = imageUploadSchema.safeParse(file)
            if (!check.success){
                setError(check.error.errors[0].message)
                setFile(null)
                setData({ image: null })
                return
            }
            if (file && check.success) {
                if (file.size / 1024 / 1024 > 4.5) {
                    setError('File size too big (max 4.5MB)')
                    setFile(null)
                    setData({ image: null })
                    return
                } else {
                    setFile(file)
                    const reader = new FileReader()

                    reader.onload = (e) => {
                        const base64String = e.target?.result as string;
                        setData({ image: base64String });
                    }
                    setError(undefined);
                    form.setValue(name, file)
                    reader.readAsDataURL(file)
                }
            }
        },
        [setData]
    )

    return (
        <label
            htmlFor={"image-upload"}
            className={"group relative mt-2 flex w-[390px] h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"}>
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
                    const check = imageUploadSchema.safeParse(file)
                    if (!check.success){
                        setError(check.error.errors[0].message)
                        setFile(null)
                        setData({ image: null })
                        return
                    }
                    if (file && check.success) {
                        if (file.size / 1024 / 1024 > 4.5) {
                            setError('File size too big (max 4.5MB)')
                            setFile(null)
                            setData({ image: null })
                            return
                        } else {
                            setFile(file)
                            const reader = new FileReader()

                            reader.onload = (e) => {
                                const base64String = e.target?.result as string;
                                setData({image: base64String });
                            }
                            setError(undefined);
                            form.setValue(name, file)
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
                    Max file size: 4.5MB
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
            <div className="flex rounded-md shadow-sm">
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
    );
}