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
import { IconClose } from "@/components/ui/icons";
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
import {TagsAutoInput, TagsInput, TagsSelectInput} from "@/components/ui/tags-input";
import { useMediaQuery } from "usehooks-ts";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import {ImageUploadSection} from "@/components/store/product/dialog/image-upload-section";
import {DeleteConfirmationModal} from "@/components/store/product/dialog/delete-confirmation";

// Extend ProductSchema to include additional images
const ExtendedProductSchema = ProductSchema.extend({
    additionalImages: z.array(z.string()).max(3).optional(),
});

type ProductDialogProps = {
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
    setIsDismissable: (isDismissable: boolean) => void;
};



export default function BakerzProductDialog({ productData, onClose, setIsDismissable }: ProductDialogProps) {
    const { theme } = useTheme();
    const t = useTranslations("TheBakerz");
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

    // Form setup with zod validation
    const form = useForm<z.infer<typeof ExtendedProductSchema>>({
        resolver: zodResolver(ExtendedProductSchema),
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
        },
    });

    useEffect(() => {
        console.log(form.getValues());
    }, [form]);

    const [state, submitAction, isPending] = useActionState(
        async (prevState: any, formData: z.infer<typeof ExtendedProductSchema>) => {
            const result = await addProduct(formData, productData?.id);
            if (result?.success) {
                showSuccessMessage({ success: result.success });
                router.refresh();
                onClose();
            } else if (result?.error) {
                showErrorMessage({ error: result.error });
            }
        },
        null
    );

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        setFile(files ? files[0] : undefined);
        if (fileRef.current) fileRef.current.value = "";
        setPictureEdit(true);
    };

    const handleSubmit = (formData: z.infer<typeof ExtendedProductSchema>) => {
        startTransition(() => submitAction(formData));
    };

    const handleDelete = async () => {
        if (productData) {
            setIsDismissable(false);
            setIsLoadingDelete(true);
            await deleteProduct(productData.id);
            showSuccessMessage({ success: t("Product Deleted") });
            router.refresh();
            onClose();
            setIsOpenDelete(false);
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
                title={t("Item Image")}
                subtitle={t("Upload Image Subtitle")}
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
                        copyText={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${productData?.store_id}?product=${productData?.id}`}
                        textNotify={t("Product Link Copied")}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" />
                    </CopyText>
                )}
            </ModalHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-1">
                    <ModalBody className={`px-0 ${picture ? "" : "pt-0"}`}>
                        <ScrollShadow className="md:flex max-h-[80svh] w-full space-x-0 overscroll-contain" size={0}>
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
                                                    placeholder={t("Add Description Placeholder")}
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
                                                    placeholder={t("Add Ingredients Placeholder")}
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
                                                    placeholder={t("Add Allergies Placeholder")}
                                                />
                                            </FormControl>
                                            {fieldState.error && <p className="text-danger-400 text-sm">{fieldState.error.message}</p>}
                                        </FormItem>
                                    )}
                                />
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
                                    t={t}
                                    theme={theme}
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
                            onPress={() => setIsDismissable(false)}
                        >
                            {isPending ? t("Loading") : productData ? t("Update Item") : t("Add Item")}
                        </Button>
                    </ModalFooter>
                </form>
            </Form>
        </>
    );
}
