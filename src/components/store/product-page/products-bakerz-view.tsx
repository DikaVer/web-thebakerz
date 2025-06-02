'use client';
import React, { useState, useRef, startTransition, useCallback } from "react";
import {
    Button,
    Textarea,
    Input,
    Select,
    SelectItem,
    Spacer,
    NumberInput,
    Alert,
    PressEvent,
} from "@heroui/react";
import {addProduct, deleteProduct, ProductData, ProductDataClean, ProductVariant} from "@/lib/actions/product";
import { Icon } from "@iconify/react";
import { ImageUploader } from "@/components/image/image-upload";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ProductSchema } from "@/lib/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { categories } from "@/lib/local-variables";
import showErrorMessage from "@/components/toast/toast-error";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import showSuccessMessage from "@/components/toast/toast-succes";
import {TagsInput, TagsSelectInput, DietarySelectInput} from "@/components/ui/tags-input";
import { useMediaQuery } from "usehooks-ts";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {VariantsFormField} from "@/components/store/product/components/variants-form-field";
import {DeleteConfirmationModal} from "@/components/store/product/components/delete-confirmation";
import {ImageUploadSection} from "@/components/store/product/components/image-upload-section";
import {MinLeadTime} from "@/components/store/product/components/min-lead-time";
import { DescriptionTitleSection, ProductTitleSection, IngredientsTitleSection, AllergiesTitleSection, DietaryTitleSection, VariantsTitleSection, VariantsInstructionSection } from "@/components/store/product/components/product-title-section";
import SwitchCell from "@/components/ui/switch-cell";
import { uploadImage } from "@/lib/actions/image";
import { useStore } from  "@/components/providers/store-provider"

;
type ProductViewProps = {
    storeId: string;
    productData: ProductData | ProductDataClean | undefined;
};

export default function BakerzProductView({ storeId, productData }: ProductViewProps) {
    const t = useTranslations("app/(store)/components/product-page");
    const router = useRouter();
    const isSmall = useMediaQuery("(max-width: 460px)");
    const fileRef = useRef<HTMLInputElement>(null);
    const { store } = useStore();

    // State declarations
    const [picture, setPicture] = useState<string | undefined>(productData?.picture);
    const [additionalImages, setAdditionalImages] = useState<string[]>(productData?.additionalImages || []);
    const [pictureEdit, setPictureEdit] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [fileAdditional, setFileAdditional] = useState<File[]>([]);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            dietary: productData?.dietary || [],
            additionalImages: productData?.additionalImages || [],
            file_additional_pictures: undefined,
            variants: (productData?.variants || []).map((variant: ProductVariant) => ({
                ...variant,
                options: variant.options.map(option => ({
                    ...option,
                    price: option.price ? option.price / 100 : 0
                }))
            })),
            min_order: productData?.min_order || 1,
            min_lead_time: productData?.min_lead_time || 30,
            hide_product: productData?.hide_product,
            isPostDelivery: productData?.isPostDelivery,
        },
    });

    const [state, submitAction, isPending] = useActionState(
        async (prevState: any, formData: z.infer<typeof ProductSchema>) => {
            setIsLoading(false);
            try {
                const result = await addProduct(formData, storeId, productData?.id);
                if (result?.success) {
                    showSuccessMessage({ success: result.success });
                    router.push(`/${store?.storeName || result.product.store_id}`);
                    router.refresh();
                } else if (result?.error) {
                    showErrorMessage({ error: result.error });
                }
            } catch (error) {
                console.error('Form submission error:', error);
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

    const handleSubmit = useCallback(async (data: z.infer<typeof ProductSchema>) => {

        setIsLoading(true);

        // Validate that all files are properly loaded
        const mainFile = data.file_picture;
        const additionalFiles = data.file_additional_pictures || [];

        const allFiles = [mainFile, ...additionalFiles].filter(Boolean);
        const hasInvalidFiles = allFiles.some(file => !file || file.size === 0);

        if (hasInvalidFiles && (!productData?.id || (productData?.id && (mainFile || additionalFiles.length > 0)))) {
             showErrorMessage({
                error: t("invalidImages", {
                    defaultValue: "Some images are not properly loaded. Please try uploading them again."
                })
            });
            return;
        }
        
        const processedFormData = { ...data };

        // Upload main picture if it's a new file
        if (data.file_picture instanceof File) {
            const uploadResult = await uploadImage(data.file_picture, "products");
            if (uploadResult.error || !uploadResult.url) {
                showErrorMessage({ error: uploadResult.error || t("failedUploadImage") });
                return;
            }
            processedFormData.url = uploadResult.url;
        } else if (!data.url && productData?.picture) { // if main picture was removed and not replaced by new one
             processedFormData.url = ""; // explicitly set to empty to signify removal
        }


        // Upload additional pictures if they are new files
        if (data.file_additional_pictures && data.file_additional_pictures.length > 0) {
            const newAdditionalImageUrls: string[] = [];
            // Keep existing URLs that were not replaced by new files
            const existingUrls = data.additionalImages || [];
            
            for (let i = 0; i < Math.max(existingUrls.length, data.file_additional_pictures.length); i++) {
                const file = data.file_additional_pictures[i];
                if (file instanceof File) {
                    const uploadResult = await uploadImage(file, "products");
                    if (uploadResult.error) {
                        showErrorMessage({ error: uploadResult.error });
                        return;
                    }
                    if(uploadResult.url) {
                        newAdditionalImageUrls.push(uploadResult.url);
                    }
                } else if (existingUrls[i] && !file) { // If there's an existing URL and no new file at this position
                    newAdditionalImageUrls.push(existingUrls[i]);
                }
            }
            processedFormData.additionalImages = newAdditionalImageUrls;
        } else if (productData?.id && (!data.file_additional_pictures || data.file_additional_pictures.length === 0) && data.additionalImages?.length === 0) {
            // if existing product and all additional images were removed and no new ones added
            processedFormData.additionalImages = [];
        }


        // Clear file objects from form data as they've been processed
        processedFormData.file_picture = undefined;
        processedFormData.file_additional_pictures = undefined;

        startTransition(() => submitAction(processedFormData));
    }, [submitAction, t, productData]);

    const handleDelete = async () => {
        if (productData?.id) {
            setIsLoadingDelete(true);
            try {
                const response = await deleteProduct(productData.id, storeId);
                if (response.success) {
                    showSuccessMessage({ success: t("productDeleted") });
                    setIsOpenDelete(false);
                    router.push(`/${store?.storeName || productData.store_id}`);
                    router.refresh();
                } else if (response.error) {
                    showErrorMessage({error: response.error});
                } else {
                    showErrorMessage({error: t("productDeleteFailed")});
                }
            } catch (error) {
                console.error('Delete error:', error);
                showErrorMessage({ 
                    error: t("productDeleteFailed", {
                        defaultValue: "Failed to delete the product. Please try again."
                    })
                });
            } finally {
                setIsLoadingDelete(false);
            }
        }
    };

    const setAsMainImage = useCallback((index: number) => {
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
    }, [additionalImages, fileAdditional, form, picture]);

    const addNewImage = useCallback((file: File, url: string) => {
        // Debug information to track image format
        console.log(`Adding image: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        
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
    }, [additionalImages, currentImageIndex, fileAdditional, form, picture]);

    const removeMainImage = useCallback((e: PressEvent) => {
        if (productData?.id) {
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
        }
    }, [additionalImages, fileAdditional, form, productData?.id]);

    const removeAdditionalImage = useCallback((index: number, e: PressEvent) => {
        const updatedAdditionalImages = [...additionalImages];
        updatedAdditionalImages.splice(index, 1);
        setAdditionalImages(updatedAdditionalImages);
        form.setValue("additionalImages", updatedAdditionalImages);

        const updatedFileAdditional = [...fileAdditional];
        updatedFileAdditional.splice(index, 1);
        setFileAdditional(updatedFileAdditional);
        form.setValue("file_additional_pictures", updatedFileAdditional);
    }, [additionalImages, fileAdditional, form]);

    return (
        <div
            className={'w-full max-w-full md:max-w-3xl pt-4'}
        >
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-1">
                    <div className={`px-0 ${picture ? "" : "pt-0"}`}>
                        <div className="md:flex w-full md:space-x-2">
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <ImageUploadSection
                                                isProductExisting={!!productData?.id}
                                                picture={picture}
                                                additionalImages={additionalImages}
                                                isPending={isPending || isLoading}
                                                isSmall={isSmall}
                                                fileRef={fileRef}
                                                onFileChange={handleFileChange}
                                                onMainClick={() => {
                                                    if (!isPending && !isLoading && !productData?.id) fileRef.current?.click();
                                                }}
                                                onAdditionalClick={(index?: number) => {
                                                    if (!isPending && !isLoading) {
                                                        if (typeof index === "number" && !productData?.id) {
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
                            <div className="flex flex-col my-4">
                                
                                <ProductTitleSection isPending={isPending || isLoading} />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <div className="flex flex-row">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field, fieldState }) => (
                                                <FormItem className="w-2/3">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            isDisabled={isPending || isLoading}
                                                            variant="underlined"
                                                            placeholder={t("Item Name")}
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
                                                            isDisabled={isPending || isLoading}
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
                                    <Spacer y={8} />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field, fieldState }) => (
                                            <FormItem className="flex w-full justify-end">
                                                <FormControl>
                                                    <Select
                                                        {...field}
                                                        isDisabled={isPending || isLoading}
                                                        placeholder={t("Select Category")}
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
                                </div>
                                <Spacer y={8} />
                                <DescriptionTitleSection/>
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        isDisabled={isPending || isLoading}
                                                        value={field.value ?? ""}
                                                        placeholder={t("Add Description Placeholder")}
                                                        variant="underlined"
                                                        style={{ resize: "none", whiteSpace: "pre-wrap" }}
                                                        className="text-default-400 whitespace-pre-wrap"
                                                        classNames={{ input: "min-h-[40px] text-base text-default-400 whitespace-pre-wrap" }}
                                                        validate={() => fieldState.error?.message}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Spacer y={8} />
                                <IngredientsTitleSection />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <FormField
                                        control={form.control}
                                        name="ingredients"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <TagsInput
                                                        isLoading={isPending || isLoading}
                                                        tags={field.value || []}
                                                        setTags={(newTags) => field.onChange(newTags)}
                                                        placeholder={t("Add Ingredients Placeholder")}
                                                    />
                                                </FormControl>
                                                {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Spacer y={8} />
                                <AllergiesTitleSection />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <FormField
                                        control={form.control}
                                        name="allergies"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <TagsSelectInput
                                                        isLoading={isPending || isLoading}
                                                        tags={field.value || []}
                                                        setTags={(newTags) => field.onChange(newTags)}
                                                        type="warning"
                                                        placeholder={t("Add Allergies Placeholder")}
                                                    />
                                                </FormControl>
                                                {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Spacer y={8} />
                                <DietaryTitleSection />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <FormField
                                        control={form.control}
                                        name="dietary"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <DietarySelectInput
                                                        isLoading={isPending || isLoading}
                                                        tags={field.value || []}
                                                        setTags={(newTags) => field.onChange(newTags)}
                                                        placeholder={t("Add Dietary Restrictions")}
                                                    />
                                                </FormControl>
                                                {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Spacer y={8} />
                                <VariantsTitleSection />
                                <VariantsInstructionSection />
                                <div className="flex flex-col rounded-lg">
                                    <VariantsFormField
                                        form={form}
                                        isPending={isPending || isLoading}
                                    />
                                </div>

                                <Spacer y={8} />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <div className="flex w-full justify-between">
                                        <h3 className="text-lg font-medium">{t("Minimal Order")}</h3>
                                        <FormField
                                            control={form.control}
                                            name="min_order"
                                            render={({ field, fieldState }) => (
                                                <FormItem className="w-1/3">
                                                    <FormControl>
                                                        <NumberInput
                                                            {...field}
                                                            isRequired
                                                            isDisabled={isPending || isLoading}
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
                                    <Spacer y={4} />
                                    <h4 className="text-base font-light text-default-700 mb-2">{t("MinimalNumberDescription")}</h4>
                                </div>
                                <Spacer y={8} />
                                <div className="flex flex-col bg-white rounded-lg p-4">
                                    <MinLeadTime form={form} isPending={isPending || isLoading} />
                                </div>
                                <Spacer y={8} />

                                <FormField
                                    control={form.control}
                                    name="hide_product"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <SwitchCell
                                                    isSelected={field.value}
                                                    onChange={e => field.onChange(e.target.checked)}
                                                    isDisabled={isPending || isLoading}
                                                    label={t("Hide Product")}
                                                    description={t("Hide Product Helper", { defaultValue: "If enabled, this product will be hidden from customers but still available for editing." })}
                                                    classNames={{
                                                        base: "bg-white",
                                                        label: "text-base font-medium",
                                                        description: "font-light text-default-700",
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Spacer y={8} />
                                <FormField
                                    control={form.control}
                                    name="isPostDelivery"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <SwitchCell
                                                    isSelected={field.value}
                                                    onChange={e => field.onChange(e.target.checked)}
                                                    isDisabled={isPending || isLoading}
                                                    label={t("Post Delivery")}
                                                    description={t("Post Delivery Helper", { defaultValue: "If enabled, this product will be available for post delivery." })}
                                                    classNames={{
                                                        base: "bg-white",
                                                        label: "text-base font-medium",
                                                        description: "font-light text-default-700",
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                              

                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row space-x-4 mt-8">
                        {productData?.id && (
                            <>
                                <DeleteConfirmationModal
                                    isOpen={isOpenDelete}
                                    isLoadingDelete={isLoadingDelete}
                                    onClose={() => setIsOpenDelete(false)}
                                    onConfirm={handleDelete}
                                />
                                <Button
                                    aria-label="Delete product"
                                    variant="bordered"
                                    className="w-1/3 bg-white text-foreground"
                                    isDisabled={isPending || isLoading}
                                    onPress={() => setIsOpenDelete(true)}
                                    type="button"
                                >
                                    <Icon icon="solar:trash-bin-trash-broken" width={24} />
                                </Button>
                            </>
                        )}
                        <Button
                            aria-label="Save product"
                            className={`w-2/3 bg-gradient-primary ${!productData?.id && "w-full"}`}
                            color="primary"
                            type="submit"
                            isLoading={isPending || isLoading}
                        >
                            {isPending || isLoading ? t("Loading") : productData?.id ? t("Update Item") : t("Add Item")}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
