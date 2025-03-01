'use client';
import React, {startTransition, useActionState, useEffect, useRef, useState} from "react";
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
    ScrollShadow
} from "@heroui/react";
import {addProduct, deleteProduct, ProductData} from "@/lib/actions/product";
import {IconClose, IconCopy} from "@/components/ui/icons";
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
import { Form, FormField, FormItem, FormControl} from "@/components/ui/form";
import {useRouter} from "next/navigation";
import showSuccessMessage from "@/components/toast/toast-succes";
import {TagsInput} from "@/components/ui/tags-input";

type ProductDialogProps = {
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
};

export default function BakerzProductDialog({ productData, onClose }: ProductDialogProps) {
    const { theme } = useTheme();

    const [picture, setPicture] = useState<string | undefined>(productData?.picture);
    const [pictureEdit, setPictureEdit] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const router = useRouter();

    const fileRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files || undefined;
        setFile(files ? files[0] : undefined);
        if (fileRef.current) {
            fileRef.current.value = "";
        }
        setPictureEdit(true);
    };

    // Initialize the form with the ProductSchema and default values.
    const form = useForm<z.infer<typeof ProductSchema>>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            category: productData?.category,
            name: productData?.name,
            price: productData?.price ? productData.price / 100 : undefined,
            description: productData?.description,
            url: productData?.picture,
            ingredients: productData?.ingredients || [],
            allergies: productData?.allergies || [],
        },
    });

    // Update the submit action to pass productData?.id to addProduct.
    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof ProductSchema>) => {
            const result = await addProduct(formData, productData?.id);
            if (result?.success) {
                showSuccessMessage({ success: "Product added!" });
                onClose();
                router.refresh();
            } else if (result?.error) {
                showErrorMessage({ error: result.error });
            }
        },
        null
    );

    // Handle form submission with startTransition.
    const handleSubmit = (formData: z.infer<typeof ProductSchema>) => {
        startTransition(() => {
            submitAction(formData);
        });
    };

    const handleDelete = async () => {
        if(productData) {
            await deleteProduct(productData.id)
            router.refresh();
            onClose();
            setIsOpenDelete(false);
        }
    };

    return (
        <>
            <ImageUploader
                type={"square"}
                file={file}
                isOpen={pictureEdit}
                onClose={() => setPictureEdit(false)}
                title={"Item Image"}
                subtitle={"Upload an image for your item"}
                container={"products"}
                // When a new image URL is returned, update both the local state and the form field.
                setImageURL={(url: string) => {
                    setPicture(url);
                    form.setValue("url", url);
                }}
            />
            <ModalHeader className="flex flex-col gap-1 p-1">
                {productData && (
                    <CopyText
                        onClose={onClose}
                        isIconOnly={true}
                        copyText={process.env.NEXT_PUBLIC_API_BASE_URL + "/" + productData?.store_id + "?product=" + productData?.id}
                        textNotify={"Product Link Copied!"}
                    >
                        <IconCopy
                            size={28}
                            primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                            secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />
                    </CopyText>
                )}
            </ModalHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-1">
                    <ModalBody className={`px-0 ${productData?.picture ? '': 'pt-10'}`}>
                        <>
                            <ScrollShadow className={"max-h-[70vh]"} size={20}>
                            <div>
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileRef}
                                    onChange={handleChange}
                                />
                                {picture ? (
                                    <div
                                        className="flex flex-col justify-center items-center w-full h-full aspect-square rounded-none cursor-pointer"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <Image
                                            removeWrapper
                                            alt={productData?.name || "Item Image"}
                                            className="object-cover w-full rounded-none"
                                            src={picture}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col justify-center items-center w-full h-full aspect-square rounded-none border-b-1 border-t-1 cursor-pointer"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <Icon icon="solar:gallery-add-bold-duotone" className="text-default-500 w-full"
                                              width={64}/>
                                        <p className="text-default-500">Upload Item Image</p>
                                    </div>
                                )}
                            </div>
                                <div className="flex flex-col px-2">
                                    <div className="flex flex-row">
                                        {/* Product Name Field */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field, fieldState }) => (
                                                <FormItem className="w-2/3">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            variant="underlined"
                                                            placeholder="Item Name"
                                                            classNames={{
                                                                input: cn("text-xl sm:text-2xl truncate font-medium"),
                                                            }}
                                                            validate={() => {
                                                                return fieldState.error?.message;
                                                            }}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {/* Price Field */}
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field, fieldState }) => (
                                                <FormItem className="w-1/3">
                                                    <FormControl>
                                                        <NumberInput
                                                            {...field}
                                                            isRequired
                                                            placeholder="0.00"
                                                            variant={'underlined'}
                                                            classNames={{
                                                                input: cn("text-lg cm:text-xl font-light"),
                                                                inputWrapper: cn("h-8"),
                                                            }}
                                                            startContent={
                                                                <div className="pointer-events-none flex items-center">
                                                                    <span className="text-default-400 text-3xl">€</span>
                                                                </div>
                                                            }
                                                            validate={() => {
                                                                return fieldState.error?.message;
                                                            }}

                                                            onChange={(value) => {
                                                                //@ts-ignore
                                                                field.onChange(parseFloat(value.target.value));
                                                            }}
                                                            className="text-lg cm:text-xl font-light"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Spacer y={2} />
                                    {/* Description Field */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        placeholder="Add a description to your item..."
                                                        variant="underlined"
                                                        style={{ resize: "none" }}
                                                        className=" text-default-400"
                                                        classNames={{
                                                            input: cn("min-h-[40px] text-base text-default-400"),
                                                        }}
                                                        validate={() => {
                                                            return fieldState.error?.message;
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Spacer y={2} />
                                    {/* Category Field */}
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field, fieldState }) => (
                                            <FormItem className={'flex w-full justify-end'}>
                                                <FormControl>
                                                    <Select
                                                        {...field}
                                                        placeholder="Select a category"
                                                        variant="underlined"
                                                        className="w-1/2"
                                                        validate={() => {
                                                            return fieldState.error?.message;
                                                        }}
                                                        defaultSelectedKeys={[field.value]}

                                                    >
                                                        {Object.keys(categories).map((key) => (
                                                            <SelectItem key={key}>
                                                                {key}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    {/* Ingredients and Allergies Fields */}
                                    <FormField
                                        control={form.control}
                                        name="ingredients"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <TagsInput
                                                        tags={field.value || []}
                                                        setTags={(newTags) => field.onChange(newTags)}
                                                        placeholder="Add ingredients... (Press Enter to add)"
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <p className="text-danger-400 text-sm">{fieldState.error.message}</p>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="allergies"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <TagsInput
                                                        tags={field.value || []}
                                                        setTags={(newTags) => field.onChange(newTags)}
                                                        type={'warning'}
                                                        placeholder="Add allergies... (Press Enter to add)"
                                                    />
                                                </FormControl>
                                                {fieldState.error && (
                                                    <p className="text-danger-400 text-sm">{fieldState.error.message}</p>
                                                )}
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </ScrollShadow>
                        </>
                    </ModalBody>

                    <ModalFooter className="px-4 space-x-4">
                        {productData && (
                            <>
                                <Modal
                                    isOpen={isOpenDelete}
                                    size="sm"
                                    onClose={onClose}
                                    classNames={{
                                        closeButton: 'p-1'
                                    }}
                                    closeButton={
                                        <div className={'absolute w-full right-0'}>
                                            <IconClose size={32} primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                                       secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                                            />
                                        </div>
                                    }
                                >
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader className="flex flex-col gap-1">Are you sure?</ModalHeader>
                                                <ModalBody>
                                                    <p>
                                                        After removing, item will be permanently deleted and cannot be recovered.
                                                    </p>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="primary" onPress={() => setIsOpenDelete(false)}>
                                                        Close
                                                    </Button>
                                                    <Button color="danger" variant="light" onPress={handleDelete}>
                                                        Confirm
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Button
                                    variant="bordered"
                                    className="w-1/3"
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
                            {isPending ? "Loading..." : productData ? "Update" : "Add"} Item
                        </Button>
                    </ModalFooter>
                </form>
            </Form>
        </>
    );
}
