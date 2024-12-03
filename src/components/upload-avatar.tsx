'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {imageUploadSchema} from "@/lib/schemas";
import {ControllerRenderProps, UseFormReturn} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {IconCross} from "@/components/ui/icons";
import ReactCrop, {centerCrop, convertToPixelCrop, makeAspectCrop, PercentCrop, PixelCrop} from "react-image-crop";
import {FormError} from "@/components/authentication/form-error";
import setCanvasPreview from "@/components/setCanvasPreview";
import {StoreData} from "@/lib/definitions";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 128;

interface AvatarUploaderProps {
    form: UseFormReturn<any>;
    field: ControllerRenderProps<any>;
    name: string;
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    setGlobalData: (data: { image: string | null }) => void;
}

export function AvatarUploader({ form, field, name, isDialogOpen, setDialogOpen, setGlobalData}: AvatarUploaderProps) {

    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);

    const [data, setData] = useState<{ image: string | null }>({
        image: null,
    });

    const [error, setError] = useState<string | undefined>();

    const [file, setFile] = useState<File | null>(null);

    const [dragActive, setDragActive] = useState(false);

    const [crop, setCrop] = useState<PercentCrop | PixelCrop>();

    const onChangePicture = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.currentTarget.files && event.currentTarget.files[0]
            const check = imageUploadSchema.safeParse(file)
            if (!check.success){
                setError("Image must be a valid image format (jpeg, jpg, png)")
                setFile(null);
                setData({ image: null });
                return
            }
            if (file && check.success) {
                if (file.size / 1024 / 1024 > 4.5) {
                    setError('File size too big (max 4.5MB)')
                    setFile(null);
                    setData({ image: null });
                    return
                } else {

                    setFile(file)

                    const reader = new FileReader()

                    reader.onload = (e) => {
                        const base64String = e.target?.result as string;
                        setData({ image: base64String });
                    }
                    setError(undefined);
                    reader.readAsDataURL(file)
                }
            }
        },
        [setData]
    )

    const onImageLoad = (e: ChangeEvent<HTMLImageElement>) => {
        const {width, height, naturalHeight, naturalWidth} = e.currentTarget;

        if (naturalHeight < MIN_DIMENSION || naturalWidth < MIN_DIMENSION) {
            setError(`Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels`);
            setFile(null);
            setData({ image: null });
            return
        }

        const crop = makeAspectCrop(
            {
                unit: "%",
                width: 100,
            },
            ASPECT_RATIO,
            width,
            height
        )
        const centeredCrop = centerCrop(crop, width, height)
        setCrop(centeredCrop)
    }

    const isDisabled = useMemo(() => {
        return !data.image
    }, [data.image]
    );

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);

    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        setTimeout(() => {
            setDialogOpen(false);
        }, 400);
    }

    return (
        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={(e) => {
                    toggleClose();
                }}/>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
            >
                <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                    <div className={`flex flex-row justify-between items-center`}>
                        <Button
                            className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                            onClick={() => toggleClose()}
                        >
                            <IconCross className={"w-8 h-8 cursor-pointer text-text"}/>
                        </Button>
                        <p className={"text-xl"}>Avatar Selection</p>
                        <div className="w-8 h-8 flex "></div>
                    </div>
                    <hr className={"my-1"}></hr>
                    <label
                        className={"group relative mt-2 flex h-72 flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"}>
                        {!data.image && (
                            <div
                                className="absolute z-[5] h-full w-full rounded-md"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(true);
                                }}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(false);

                                    const file = e.dataTransfer.files && e.dataTransfer.files[0];
                                    const check = imageUploadSchema.safeParse(file);
                                    if (!check.success) {
                                        setError("Image must be a valid image format (jpeg, jpg, png)")
                                        setFile(null);
                                        setData({image: null});
                                        return
                                    }
                                    if (file && check.success) {
                                        if (file.size / 1024 / 1024 > 4.5) {
                                            setError('File size too big (max 4.5MB)')
                                            setFile(null);
                                            setData({image: null});
                                            return
                                        } else {

                                            setFile(file)

                                            const reader = new FileReader()

                                            reader.onload = (e) => {
                                                const base64String = e.target?.result as string;
                                                setData({image: base64String});
                                            }
                                            setError(undefined);
                                            reader.readAsDataURL(file)
                                        }
                                    }
                                }}
                            />
                        )}
                        {!data.image && (
                            <div
                                className={`${
                                    dragActive ? 'border-2 border-black' : ''
                                } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all bg-white opacity-100 hover:bg-gray-50`}
                            >
                                <svg
                                    className={`${
                                        dragActive ? 'scale-110' : 'scale-100'
                                    } h-7 w-7 text-primary transition-all duration-75 `}
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
                                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                                    <path d="M12 12v9"></path>
                                    <path d="m16 16-4-4-4 4"></path>
                                </svg>
                                <p className="mt-2 text-center text-sm text-gray-500">
                                    Drag and drop or click to upload.
                                </p>
                                <p className="mt-2 text-center text-sm text-gray-500">Max file size: 4.5MB</p>
                                <span className="sr-only">Photo upload</span>
                            </div>
                        )}

                        {data.image && (
                            <div className={'flex flex-col items-center'}>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(pixelCrop, percentageCrop) => setCrop(percentageCrop)}
                                    circularCrop
                                    keepSelection
                                    aspect={ASPECT_RATIO}
                                    minWidth={MIN_DIMENSION}
                                >
                                    <img
                                        ref={imgRef}
                                        src={data.image}
                                        alt="Preview"
                                        className="h-full w-full rounded-md object-cover"
                                        style={{maxHeight: '287px', maxWidth: '425px'}}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            </div>
                        )}
                    </label>
                    <div className="flex justify-center">
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
                        <div className={"flex flex-col w-full items-start justify-start"}>
                            <Button
                                type="button"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                variant={"secondary"}
                            >
                                Select Image
                            </Button>
                        </div>
                    </div>
                    <FormError message={error}/>
                    <Button
                        type={"button"}
                        onClick={() => {

                            setCanvasPreview(
                                imgRef.current,
                                previewCanvasRef.current,
                                convertToPixelCrop(
                                    // @ts-ignore
                                    crop,
                                    // @ts-ignore
                                    imgRef.current.width,
                                    // @ts-ignore
                                    imgRef.current.height
                                )
                            );

                            // @ts-ignore
                            previewCanvasRef.current.toBlob((blob) => {
                                if (blob) {
                                    // Create a File object from the Blob
                                    const croppedFile = new File([blob], `${file?.name}`, {type: `${file?.type}`});

                                    // Set the File object to your state
                                    setFile(croppedFile);

                                    // Optionally, set the File object to your form field
                                    form.setValue(name, croppedFile);
                                }
                            }, `${file?.type}`);

                            // @ts-ignore
                            setGlobalData({image: previewCanvasRef.current.toDataURL()});

                            setDialogOpen(false);
                        }}
                        disabled={isDisabled}
                    >
                        Apply
                    </Button>
                    {crop && (
                        <canvas

                            ref={previewCanvasRef}
                            className={'mt-4 hidden'}
                            style={{
                                border: "1px solid black",
                                objectFit: "contain",
                                width: MIN_DIMENSION,
                                height: MIN_DIMENSION
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
}