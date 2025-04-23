'use client';
import React, { useState, useRef, useEffect, useCallback, startTransition } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image,
    Textarea,
    cn,
    Input,
    Select,
    SelectItem,
    Spacer,
    NumberInput,
    ScrollShadow,
    Alert,
    PressEvent,
} from "@heroui/react";
import { addProduct, deleteProduct, ProductData } from "@/lib/actions/product";
import { useTheme } from "next-themes";
import { CopyText } from "@/components/ui/copy-text";
import { ItemCart } from "@/lib/actions/cart";
import { Icon } from "@iconify/react";
import { ImageUploader } from "@/components/image/image-upload";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProductSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { categories } from "@/lib/local-variables";
import showErrorMessage from "@/components/toast/toast-error";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import showSuccessMessage from "@/components/toast/toast-succes";
import {TagsInput, TagsSelectInput} from "@/components/ui/tags-input";
import { useMediaQuery } from "usehooks-ts";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {VariantsFormField} from "@/components/store/product/components/variants-form-field";
import {DeleteConfirmationModal} from "@/components/store/product/components/delete-confirmation";
import {ImageUploadSection} from "@/components/store/product/components/image-upload-section";


type ProductDialogProps = {
    storeId: string;
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
    setIsDismissable: (isDismissable: boolean) => void;
    setIsUpdating: (isUpdating: boolean) => void;
    isOpen: boolean;
};

export default function BakerzProductDialog({
    storeId, 
    productData, 
    onClose, 
    setIsDismissable, 
    setIsUpdating,
    isOpen 
}: ProductDialogProps) {
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/product-page");
    const router = useRouter();
    const isSmall = useMediaQuery("(max-width: 460px)");
    const fileRef = useRef<HTMLInputElement>(null);

    // State declarations
    const [picture, setPicture] = useState<string | undefined>(productData?.picture);
    const [additionalImages, setAdditionalImages] = useState<string[]>(productData?.additionalImages || []);
    const [pictureEdit, setPictureEdit] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [fileAdditional, setFileAdditional] = useState<File[]>([]);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    // Get origin of the current page from window object
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // console.log(productData);

    // Form setup with zod validation
    const form = useForm<z.infer<typeof ProductSchema>>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            category: productData?.category,
            name: productData?.name,
            price: productData?.price ? productData.price / 100 : undefined,
            description: productData?.description,
            url: productData?.picture,
            file_picture: undefined,
            ingredients: productData?.ingredients || [],
            allergies: productData?.allergies || [],
            additionalImages: productData?.additionalImages || [],
            file_additional_pictures: undefined,
            variants: (productData?.variants || []).map(variant => ({
                ...variant,
                options: variant.options.map(option => ({
                    ...option,
                    price: option.price ? option.price / 100 : 0
                }))
            })),
            min_order: productData?.min_order || 1,
        },
    });

    // useEffect(() => {
    //     console.log(form.getValues());
    // }, [form]);

    const [state, submitAction, isPending] = useActionState(
        async (prevState: any, formData: z.infer<typeof ProductSchema>) => {
            try {
                setIsDismissable(false);
                const result = await addProduct(formData, storeId, productData?.id);
                if (result?.success) {
                    setIsUpdating(true);
                    showSuccessMessage({ success: result.success });
                    router.refresh();
                    onClose();
                } else if (result?.error) {
                    setIsDismissable(true);
                    showErrorMessage({ error: result.error });
                }
            } catch (error) {
                console.error('Form submission error:', error);
                setIsDismissable(true);
                showErrorMessage({ 
                    error: t("submitError", {
                        defaultValue: "Failed to submit the form. Please try again."
                    })
                });
            }
        },
        null
    );

    // Handlers
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files[0]) return;
        
        const file = files[0];
        // Ensure the file is properly loaded before proceeding
        if (file.size > 0) {
            // Check if it's a HEIC/HEIF file before setting state
            const isHeic = file.type.toLowerCase() === 'image/heic' || 
                          file.type.toLowerCase() === 'image/heif' ||
                          file.name.toLowerCase().endsWith('.heic') || 
                          file.name.toLowerCase().endsWith('.heif');

            if (isHeic) {
                showErrorMessage({ 
                    error: t("unsupportedFormat")
                });
                if (fileRef.current) fileRef.current.value = "";
                return;
            }

            setFile(file);
            if (fileRef.current) fileRef.current.value = "";
            setPictureEdit(true);
        }
    }, [t]);

    const handleSubmit = useCallback((formData: z.infer<typeof ProductSchema>) => {
        // Validate that all files are properly loaded
        const mainFile = formData.file_picture;
        const additionalFiles = formData.file_additional_pictures || [];
        
        const allFiles = [mainFile, ...additionalFiles].filter(Boolean);
        const hasInvalidFiles = allFiles.some(file => !file || file.size === 0);
        
        if (hasInvalidFiles) {
            showErrorMessage({ 
                error: t("invalidImages", {
                    defaultValue: "Some images are not properly loaded. Please try uploading them again."
                })
            });
            return;
        }

        startTransition(() => submitAction(formData));
    }, [submitAction]);

    const handleDelete = async () => {
        if (productData) {
            setIsDismissable(false);
            setIsLoadingDelete(true);
            const response = await deleteProduct(productData.id, storeId);
            if (response.success) {
                setIsUpdating(true);
                showSuccessMessage({success: t("productDeleted")});
                router.refresh();
                onClose();
                setIsOpenDelete(false);
            } else if (response.error) {
                showErrorMessage({error: response.error});
            } else {
                showErrorMessage({error: t("productDeleteFailed")});
            }
        }
    };

    const setAsMainImage = (index: number) => {
        if (index < 0 || index >= additionalImages.length) return;
        const newMainImage = additionalImages[index];
        const newMainFile = fileAdditional[index];
        const updatedAdditionalImages = [...additionalImages];
        const updatedFileAdditional = [...fileAdditional];

        if (picture) {
            updatedAdditionalImages[index] = picture;
            const currentMainFile = form.getValues("file_picture");
            if (currentMainFile) {
                updatedFileAdditional[index] = currentMainFile;
            } else {
                updatedFileAdditional.splice(index, 1);
            }
        } else {
            updatedAdditionalImages.splice(index, 1);
            updatedFileAdditional.splice(index, 1);
        }

        setPicture(newMainImage);
        setAdditionalImages(updatedAdditionalImages);
        setFileAdditional(updatedFileAdditional);
        form.setValue("url", newMainImage);
        form.setValue("file_picture", newMainFile);
        form.setValue("additionalImages", updatedAdditionalImages);
        form.setValue("file_additional_pictures", updatedFileAdditional);
    };

    const addNewImage = (file: File, url: string) => {
        if (currentImageIndex !== null) {
            const updatedAdditionalImages = [...additionalImages];
            updatedAdditionalImages[currentImageIndex] = url;
            setAdditionalImages(updatedAdditionalImages);
            form.setValue("additionalImages", updatedAdditionalImages);

            const updatedFileAdditional = [...fileAdditional];
            updatedFileAdditional[currentImageIndex] = file;
            setFileAdditional(updatedFileAdditional);
            form.setValue("file_additional_pictures", updatedFileAdditional);
            setCurrentImageIndex(null);
        } else if (!picture) {
            setPicture(url);
            form.setValue("url", url);
            form.setValue("file_picture", file);
        } else if (additionalImages.length < 3) {
            const updatedAdditionalImages = [...additionalImages, url];
            setAdditionalImages(updatedAdditionalImages);
            form.setValue("additionalImages", updatedAdditionalImages);

            const updatedFileAdditional = [...fileAdditional, file];
            setFileAdditional(updatedFileAdditional);
            form.setValue("file_additional_pictures", updatedFileAdditional);
        }
    };

    const removeMainImage = (e: PressEvent) => {
        if (additionalImages.length > 0) {
            const newMainImage = additionalImages[0];
            const newMainFile = fileAdditional[0];
            const updatedAdditionalImages = additionalImages.slice(1);
            const updatedFileAdditional = fileAdditional.slice(1);

            setPicture(newMainImage);
            form.setValue("url", newMainImage);
            form.setValue("file_picture", newMainFile);
            setAdditionalImages(updatedAdditionalImages);
            setFileAdditional(updatedFileAdditional);
            form.setValue("additionalImages", updatedAdditionalImages);
            form.setValue("file_additional_pictures", updatedFileAdditional);
        } else {
            setPicture(undefined);
            form.setValue("url", "");
            form.setValue("file_picture", undefined);
        }
    };

    const removeAdditionalImage = (index: number, e: PressEvent) => {
        const updatedAdditionalImages = [...additionalImages];
        updatedAdditionalImages.splice(index, 1);
        setAdditionalImages(updatedAdditionalImages);
        form.setValue("additionalImages", updatedAdditionalImages);

        const updatedFileAdditional = [...fileAdditional];
        updatedFileAdditional.splice(index, 1);
        setFileAdditional(updatedFileAdditional);
        form.setValue("file_additional_pictures", updatedFileAdditional);
    };

    // Reset form state when dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setIsDismissable(true);
        }
    }, [isOpen, setIsDismissable]);

    return (
        <>
            <ImageUploader
                type="square"
                file={file}
                isOpen={pictureEdit}
                onClose={() => {
                    setPictureEdit(false);
                    setCurrentImageIndex(null);
                }}
                container="products"
                setImageURL={(file: File, url: string) => {
                    addNewImage(file, url);
                }}
            />

            <ModalHeader className="px-4 justify-between">
                <Button isDisabled={isPending} isIconOnly variant="light" radius="full" onPress={onClose}>
                    <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" />
                </Button>
                {productData && (
                    <CopyText
                        onClose={onClose}
                        isDisabled={isPending}
                        isIconOnly
                        copyText={`${origin}/${productData?.store_name || productData?.store_id}/${productData?.web_name}`}
                        textNotify={t("productLinkCopied")}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" />
                    </CopyText>
                )}
            </ModalHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-1">
                    <ModalBody className={`px-0 ${picture ? "" : "pt-0"}`}>
                        <ScrollShadow className="md:flex max-h-[80svh] w-full space-x-0" size={0}>
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ImageUploadSection
                                                picture={picture}
                                                additionalImages={additionalImages}
                                                isPending={isPending}
                                                isSmall={isSmall}
                                                fileRef={fileRef}
                                                onFileChange={handleFileChange}
                                                onMainClick={() => {
                                                    if (!isPending) fileRef.current?.click();
                                                }}
                                                onAdditionalClick={(index?: number) => {
                                                    if (!isPending) {
                                                        if (typeof index === "number") {
                                                            setAsMainImage(index);
                                                        } else {
                                                            setCurrentImageIndex(additionalImages.length);
                                                            fileRef.current?.click();
                                                        }
                                                    }
                                                }}
                                                onRemoveMain={removeMainImage}
                                                onRemoveAdditional={removeAdditionalImage}
                                            />
                                        </FormControl>
                                        {fieldState.error?.message && (
                                            <div className="px-4 md:ml-4 md:px-0">
                                                <Alert color="danger" title={fieldState.error?.message} />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="file_picture"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        {fieldState.error?.message && (
                                            <div className="px-4 md:px-0">
                                                <Alert color="danger" title={fieldState.error?.message} />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col px-4 my-4">
                                <div className="flex flex-row">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="w-2/3">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        isDisabled={isPending}
                                                        variant="underlined"
                                                        placeholder={t("itemName")}
                                                        classNames={{ input: "text-xl sm:text-2xl truncate font-medium" }}
                                                        validate={() => fieldState.error?.message}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="w-1/3">
                                                <FormControl>
                                                    <NumberInput
                                                        {...field}
                                                        isRequired
                                                        isDisabled={isPending}
                                                        placeholder="0.00"
                                                        variant="underlined"
                                                        classNames={{
                                                            input: "text-lg cm:text-xl font-light",
                                                            inputWrapper: "h-8",
                                                        }}
                                                        startContent={
                                                            <div className="pointer-events-none flex items-center">
                                                                <span className="text-default-400 text-3xl">€</span>
                                                            </div>
                                                        }
                                                        validate={() => fieldState.error?.message}
                                                        onChange={(value) => {
                                                            if (typeof value === "number") {
                                                                field.onChange(value);
                                                            } else {
                                                                field.onChange(parseFloat(value.target.value));
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Spacer y={2} />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    isDisabled={isPending}
                                                    value={field.value ?? ""}
                                                    placeholder={t("addDescriptionPlaceholder")}
                                                    variant="underlined"
                                                    style={{ resize: "none" }}
                                                    className="text-default-400"
                                                    classNames={{ input: "min-h-[40px] text-base text-default-400" }}
                                                    validate={() => fieldState.error?.message}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Spacer y={2} />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex w-full justify-end">
                                            <FormControl>
                                                <Select
                                                    {...field}
                                                    isDisabled={isPending}
                                                    placeholder={t("selectCategory")}
                                                    variant="underlined"
                                                    className="w-1/2"
                                                    validate={() => fieldState.error?.message}
                                                    defaultSelectedKeys={[field.value]}
                                                >
                                                    {Object.keys(categories).map((key) => (
                                                        <SelectItem key={key}>{key}</SelectItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="ingredients"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <TagsInput
                                                    isLoading={isPending}
                                                    tags={field.value || []}
                                                    setTags={(newTags) => field.onChange(newTags)}
                                                    placeholder={t("addIngredientsPlaceholder")}
                                                />
                                            </FormControl>
                                            {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allergies"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormControl>
                                                <TagsSelectInput
                                                    isLoading={isPending}
                                                    tags={field.value || []}
                                                    setTags={(newTags) => field.onChange(newTags)}
                                                    type="warning"
                                                    placeholder={t("addAllergiesPlaceholder")}
                                                />
                                            </FormControl>
                                            {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                        </FormItem>
                                    )}
                                />

                                <Spacer y={4} />
                                <h3 className="text-lg font-medium mb-2">{t("itemOptions")}</h3>
                                <VariantsFormField
                                    form={form}
                                    isPending={isPending}
                                />

                                <Spacer y={4} />
                                <div className="flex w-full justify-between">
                                    <h3 className="text-lg font-medium">{t("minimalOrder")}</h3>
                                    <FormField
                                        control={form.control}
                                        name="min_order"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="w-1/3">
                                                <FormControl>
                                                    <NumberInput
                                                        {...field}
                                                        isRequired
                                                        isDisabled={isPending}
                                                        placeholder="1"
                                                        variant="underlined"
                                                        classNames={{
                                                            input: "text-lg cm:text-xl font-light",
                                                            inputWrapper: "h-8",
                                                        }}
                                                        validate={() => fieldState.error?.message}
                                                        onChange={(value) => {
                                                            if (typeof value === "number") {
                                                                field.onChange(value);
                                                            } else {
                                                                field.onChange(parseFloat(value.target.value));
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <h4 className="text-base text-default-400 font-medium mb-2">{t("minimalOrderDescription")}</h4>

                            </div>
                        </ScrollShadow>
                    </ModalBody>
                    <ModalFooter className="px-4 space-x-4">
                        {productData && (
                            <>
                                <DeleteConfirmationModal
                                    isOpen={isOpenDelete}
                                    isLoadingDelete={isLoadingDelete}
                                    onClose={onClose}
                                    onConfirm={handleDelete}
                                />
                                <Button
                                    variant="bordered"
                                    className="w-1/3"
                                    isDisabled={isPending}
                                    onPress={() => setIsOpenDelete(true)}
                                    type="button"
                                >
                                    <Icon icon="solar:trash-bin-trash-broken" width={24} />
                                </Button>
                            </>
                        )}
                        <Button
                            className={`w-2/3 ${!productData && "w-full"}`}
                            color="primary"
                            type="submit"
                            isLoading={isPending}
                            onPress={() => {
                                setIsDismissable(false)
                            }}
                        >
                            {isPending ? t("loading") : productData ? t("updateItem") : t("addItem")}
                        </Button>
                    </ModalFooter>
                </form>
            </Form>
        </>
    );
}
