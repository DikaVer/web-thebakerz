'use client';
import React, {startTransition, useActionState, useEffect, useRef, useState} from "react";
import {
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Button, Image, Textarea, cn, Input, Select, SelectItem,
    Spacer, NumberInput, ScrollShadow, Alert, PressEvent
} from "@heroui/react";
import {addProduct, deleteProduct, ProductData} from "@/lib/actions/product";
import {IconClose} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/ui/copy-text";
import {ItemCart} from "@/lib/actions/cart";
import {Icon} from "@iconify/react";
import {ImageUploader} from "@/components/image/image-upload";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {ProductSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {categories} from "@/lib/local-variables";
import showErrorMessage from "@/components/toast/toast-error";
import {Form, FormField, FormItem, FormControl} from "@/components/ui/form";
import {useRouter} from "next/navigation";
import showSuccessMessage from "@/components/toast/toast-succes";
import {TagsAutoInput, TagsInput} from "@/components/ui/tags-input";
import {useMediaQuery} from "usehooks-ts";
import {useTranslations} from "next-intl";
import {PressEvents} from "@react-types/shared";

// Extend ProductSchema to include additional images
const ExtendedProductSchema = ProductSchema.extend({
    additionalImages: z.array(z.string()).max(3).optional(),
});

type ProductDialogProps = {
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
};

export default function BakerzProductDialog({productData, onClose}: ProductDialogProps) {
    const {theme} = useTheme();
    const t = useTranslations("TheBakerz");
    const router = useRouter();
    const isSmall = useMediaQuery("(max-width: 460px)");
    const fileRef = useRef<HTMLInputElement>(null);

    // State
    const [picture, setPicture] = useState<string | undefined>(productData?.picture);
    const [additionalImages, setAdditionalImages] = useState<string[]>(productData?.additionalImages || []);
    const [pictureEdit, setPictureEdit] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [fileAdditional, setFileAdditional] = useState<File[]>([]);
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

    // Form setup
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
        console.log(form.getValues())
    }, [form.getValues()]);

    // Form submission and action handlers
    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof ExtendedProductSchema>) => {
            const result = await addProduct(formData, productData?.id);
            if (result?.success) {
                showSuccessMessage({success: result.success});
                router.refresh();
                onClose();
            } else if (result?.error) {
                showErrorMessage({error: result.error});
            }
        },
        null
    );

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
            setIsLoadingDelete(true);
            await deleteProduct(productData.id);
            showSuccessMessage({success: t("Product Deleted")});
            router.refresh();
            onClose();
            setIsOpenDelete(false);
        }
    };

    // Handle setting an additional image as the main image
    const setAsMainImage = (index: number) => {
        if (index >= 0 && index < additionalImages.length) {
            const newMainImage = additionalImages[index];
            const newMainFile = fileAdditional[index];
            const newAdditionalImages = [...additionalImages];
            const newFileAdditional = [...fileAdditional];

            if (picture) {
                // Replace the selected additional image with the current main image
                newAdditionalImages[index] = picture;
                // Get the current main file from form
                const currentMainFile = form.getValues('file_picture');
                if (currentMainFile) {
                    newFileAdditional[index] = currentMainFile;
                } else {
                    // If there was no main file, remove the selected additional image
                    newFileAdditional.splice(index, 1);
                }
            } else {
                // If there was no main image, remove the selected additional image
                newAdditionalImages.splice(index, 1);
                newFileAdditional.splice(index, 1);
            }

            setPicture(newMainImage);
            setAdditionalImages(newAdditionalImages);
            setFileAdditional(newFileAdditional);

            // Update form values
            form.setValue('url', newMainImage);
            form.setValue('file_picture', newMainFile);
            form.setValue('additionalImages', newAdditionalImages);
            form.setValue('file_additional_pictures', newFileAdditional);
        }
    };

    // Handle adding a new image to additional images
    const addNewImage = (file: File, url: string) => {
        if (currentImageIndex !== null) {
            // Update existing additional image
            const newAdditionalImages = [...additionalImages];
            newAdditionalImages[currentImageIndex] = url;
            setAdditionalImages(newAdditionalImages);
            form.setValue('additionalImages', newAdditionalImages);

            // Update the file_additional_pictures array
            const newFileAdditional = [...fileAdditional];
            newFileAdditional[currentImageIndex] = file;
            setFileAdditional(newFileAdditional);
            form.setValue('file_additional_pictures', newFileAdditional);

            setCurrentImageIndex(null);
        } else if (!picture) {
            // Set as main image if none exists
            setPicture(url);
            form.setValue('url', url);
            form.setValue('file_picture', file);
        } else if (additionalImages.length < 3) {
            // Add to additional images if less than 3
            const newAdditionalImages = [...additionalImages, url];
            setAdditionalImages(newAdditionalImages);
            form.setValue('additionalImages', newAdditionalImages);

            // Add to file_additional_pictures array
            const newFileAdditional = [...fileAdditional, file];
            setFileAdditional(newFileAdditional);
            form.setValue('file_additional_pictures', newFileAdditional);
        }
    };

    const removeMainImage = (e: PressEvent) => {
        // If there are any additional images, use the first one as the main image
        if (additionalImages.length > 0) {
            // Get the first additional image and its file
            const newMainImage = additionalImages[0];
            const newMainFile = fileAdditional[0];

            // Remove the first elements from both arrays
            const newAdditionalImages = additionalImages.slice(1);
            const newFileAdditional = fileAdditional.slice(1);

            // Set the new main image and its file
            setPicture(newMainImage);
            form.setValue('url', newMainImage);
            form.setValue('file_picture', newMainFile);

            // Update additional images and their files
            setAdditionalImages(newAdditionalImages);
            setFileAdditional(newFileAdditional);
            form.setValue('additionalImages', newAdditionalImages);
            form.setValue('file_additional_pictures', newFileAdditional);
        } else {
            // If no additional images exist, just clear the main image
            setPicture(undefined);
            form.setValue('url', '');
            form.setValue('file_picture', undefined);
        }
    };

    const removeAdditionalImage = (index: number, e: PressEvent) => {
        // Remove from additional images array
        const newAdditionalImages = [...additionalImages];
        newAdditionalImages.splice(index, 1);
        setAdditionalImages(newAdditionalImages);
        form.setValue('additionalImages', newAdditionalImages);

        // Remove from file additional pictures array
        const newFileAdditional = [...fileAdditional];
        newFileAdditional.splice(index, 1);
        setFileAdditional(newFileAdditional);
        form.setValue('file_additional_pictures', newFileAdditional);
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
                <Button isIconOnly variant="light" radius="full" onPress={onClose}>
                    <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" />
                </Button>
                {productData && (
                    <CopyText
                        onClose={onClose}
                        isIconOnly={true}
                        copyText={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${productData?.store_id}?product=${productData?.id}`}
                        textNotify={t("Product Link Copied")}
                    >
                        <Icon icon="mi:share" width={32} className="text-default-400" />
                    </CopyText>
                )}
            </ModalHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-1">
                    <ModalBody className={`px-0 ${picture ? '' : 'pt-0'}`}>
                        <ScrollShadow className="md:flex max-h-[80svh] w-full space-x-0 overscroll-contain" size={0}>
                            {/* Main Image Upload */}
                            <div className={'md:pl-4'}>
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({field, fieldState}) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="flex w-full justify-center cursor-pointer items-center">
                                                    <input type="file" className="hidden" ref={fileRef}
                                                           onChange={handleFileChange}/>
                                                    {picture ? (
                                                        <div
                                                            className={cn(
                                                                "relative flex flex-col justify-center items-center md:w-[258px] w-full max-w-[400px] aspect-square",
                                                                isSmall ? "rounded-none" : "rounded-xl"
                                                            )}
                                                            onClick={() => {
                                                                if (!isPending) fileRef.current?.click()
                                                            }}
                                                        >
                                                            {/* Remove button for main image */}
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                color="danger"
                                                                variant="flat"
                                                                radius="full"
                                                                className="absolute top-2 right-2 z-50 opacity-90"
                                                                onPress={removeMainImage}
                                                            >
                                                                <Icon icon="solar:close-circle-bold" width={20}/>
                                                            </Button>
                                                            <Image
                                                                removeWrapper
                                                                alt={productData?.name || t("Item Image")}
                                                                className={cn("object-cover w-full", isSmall ? "rounded-none border-none" : "rounded-xl")}
                                                                src={picture}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={cn(
                                                                "flex flex-col justify-center items-center w-full md:w-[258px] max-w-[400px] aspect-square md:shadow-small cursor-pointer",
                                                                isSmall ? "border-b-1 border-t-1 rounded-none" : "border-1 rounded-xl"
                                                            )}
                                                            onClick={() => {
                                                                if (!isPending) fileRef.current?.click()
                                                            }}
                                                        >
                                                            <Icon icon="solar:gallery-add-bold-duotone"
                                                                  className="text-default-500 w-full" width={64}/>
                                                            <p className="text-default-500">{t("Upload Item Image")}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            {fieldState.error?.message && (
                                                <div className="px-4 md:px-0">
                                                    <Alert color="danger" title={fieldState.error?.message}/>
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                {/* Additional Images */}
                                {form.getValues('url') && (
                                    <div className="flex flex-row gap-2 mt-2 justify-start w-full px-4 md:px-0">
                                        {additionalImages.map((img, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative flex justify-center items-center w-20 h-20 cursor-pointer border-1",
                                                    "rounded-lg"
                                                )}
                                                onClick={() => setAsMainImage(index)}
                                            >
                                                {/* Remove button for additional image */}
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    radius="full"
                                                    className="absolute top-0 right-0 z-50 scale-75 opacity-90"
                                                    onPress={(e) => removeAdditionalImage(index, e)}
                                                >
                                                    <Icon icon="solar:close-circle-bold" width={18}/>
                                                </Button>
                                                <Image
                                                    removeWrapper
                                                    alt={`Additional image ${index + 1}`}
                                                    className={cn("object-cover w-full h-full", "rounded-lg")}
                                                    src={img}
                                                />
                                            </div>
                                        ))}

                                        {additionalImages.length < 3 && (
                                            <div
                                                className={cn(
                                                    "flex justify-center items-center w-20 h-20 cursor-pointer border-1",
                                                    "rounded-lg"
                                                )}
                                                onClick={() => {
                                                    if (!isPending) {
                                                        setCurrentImageIndex(additionalImages.length);
                                                        fileRef.current?.click();
                                                    }
                                                }}
                                            >
                                                <Icon icon="solar:gallery-add-bold-duotone"
                                                      className="text-default-500 w-full" width={24}/>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="file_picture"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        {fieldState.error?.message && (
                                            <div className="pl-4">
                                                <Alert color="danger" title={fieldState.error?.message} />
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col px-4 my-4">
                                <div className="flex flex-row">
                                    {/* Product Name */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field, fieldState}) => (
                                            <FormItem className="w-2/3">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        isDisabled={isPending}
                                                        variant="underlined"
                                                        placeholder={t("Item Name")}
                                                        classNames={{input: "text-xl sm:text-2xl truncate font-medium"}}
                                                        validate={() => fieldState.error?.message}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Price */}
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({field, fieldState}) => (
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
                                                            inputWrapper: "h-8"
                                                        }}
                                                        startContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-3xl">€</span></div>}
                                                        validate={() => fieldState.error?.message}
                                                        onChange={(value) => {
                                                            if (typeof value === 'number') {
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

                                {/* Rest of the form fields remain the same */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({field, fieldState}) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    isDisabled={isPending}
                                                    value={field.value ?? ""}
                                                    placeholder={t("Add Description Placeholder")}
                                                    variant="underlined"
                                                    style={{resize: "none"}}
                                                    className="text-default-400"
                                                    classNames={{input: "min-h-[40px] text-base text-default-400"}}
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
                                    render={({field, fieldState}) => (
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
                                    render={({field, fieldState}) => (
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
                                    render={({field, fieldState}) => (
                                        <FormItem>
                                            <FormControl>
                                                <TagsAutoInput
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
                                <Modal
                                    isDismissable={!isLoadingDelete}
                                    backdrop="blur"
                                    isOpen={isOpenDelete}
                                    size="sm"
                                    hideCloseButton={isLoadingDelete}
                                    onClose={onClose}
                                    classNames={{closeButton: 'p-1'}}
                                    closeButton={
                                        <div className="absolute w-full right-0">
                                            <IconClose
                                                size={32}
                                                primaryColor={theme === 'light' ? '#730c70' : '#faf4d1'}
                                                secondaryColor={theme === 'light' ? '#5d5d5b' : '#a3a3a3'}
                                            />
                                        </div>
                                    }
                                >
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">{t("Delete Confirmation")}</ModalHeader>
                                                <ModalBody>
                                                    <p>{t("Delete Product Warning")}</p>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="primary" isDisabled={isLoadingDelete} onPress={() => setIsOpenDelete(false)}>{t("Close")}</Button>
                                                    <Button color="danger" isLoading={isLoadingDelete} variant="light" onPress={handleDelete}>{t("Confirm")}</Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
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
                        >
                            {isPending ? t("Loading") : productData ? t("Update Item") : t("Add Item")}
                        </Button>
                    </ModalFooter>
                </form>
            </Form>
        </>
    );
}