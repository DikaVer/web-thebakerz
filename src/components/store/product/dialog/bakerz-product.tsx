'use client';
import React, {startTransition, useActionState, useRef, useState} from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Image, Card, Textarea, cn, Input, Select, SelectItem, Spacer,
} from "@heroui/react";
import {addProduct, ProductData} from "@/lib/actions/product";
import {CardFooter} from "@heroui/card";
import {formatCurrency} from "@/lib/utils";
import {IconCopy} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {CopyText} from "@/components/ui/copy-text";
import {ItemCart} from "@/lib/actions/cart";
import {Icon} from "@iconify/react";
import {ImageUploader} from "@/components/image/image-upload";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {ProductSchema, ProfileSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {categories} from "@/lib/local-variables";
import {updateProfile} from "@/lib/actions/profile-actions";
import {toast} from "sonner";
import {Alert} from "@heroui/alert";
import {SessionValidationResult} from "@/lib/actions/session";
import {User} from "@/lib/actions/user";
import {StoreData} from "@/lib/actions/store";
import showErrorMessage from "@/components/toast/toast-error";
import {Form} from "@/components/ui/form";
type ProductDialogProps = {
    productData: ProductData | undefined;
    onClose: () => void;
    itemCart?: ItemCart;
}

export default function BakerzProductDialog({productData, onClose}: ProductDialogProps) {

    const { theme } = useTheme();

    const [picture, setPicture] = useState<string | undefined>(productData?.picture);
    const [pictureEdit, setPictureEdit] = useState(false);
    const [file, setFile] = useState<File | undefined>();
    const [isOpenDelete, setIsOpenDelete] = useState(false);


    const fileRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files || undefined;

        setFile(file ? file[0] : undefined);
        // Reset the input so the same file can be selected again if needed

        if (fileRef.current) {
            fileRef.current.value = "";
        }
        setPictureEdit(true);
    };

    const form = useForm<z.infer<typeof ProductSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            category: productData?.category,
            name: productData?.name,
            price: productData?.price,
            description: productData?.description,
            url: productData?.picture,
        },
    });

    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof ProductSchema>) => {
            // Pass along the user's email and role so the updateProfile action can write to the proper tables
            const result = await addProduct(formData);

            if (result?.success) {
                toast.message((
                        <div className="flex flex-col gap-4 w-full">
                            <Alert
                                color="success"
                                title={"Success Notification"}
                                description={result.success}
                                variant="faded"

                            />
                        </div>
                    ),
                    {
                        duration: 2000,
                        className: `p-0 rounded-xl`
                    }
                );

            } else if (result?.error) {
                showErrorMessage({error: result.error});
            }
        },
        null
    );

    // Handle the form submission with startTransition
    const handleSubmit = (formData: z.infer<typeof ProductSchema>) => {
        startTransition(() => {
            submitAction(formData);
        });
    };

    const handleDelete = () => {
        onClose();
        setIsOpenDelete(false);
    }


    return (
        <>
            <ImageUploader
                file={file}
                isOpen={pictureEdit}
                onClose={() => setPictureEdit(false)}
                title={'Item Image'}
                subtitle={'Upload an image for your item'}
                container={'products'}
                setImageURL={setPicture}
            />
            <ModalHeader className="flex flex-col gap-1 p-1">
                {productData && (
                <CopyText
                    isIconOnly={true}
                    copyText={"https://www.thebakerz.com/" + productData?.store_id + "?product=" + productData?.id}
                    textNotify={"Product Link Copied!"}
                >
                    <IconCopy size={24}
                              primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                              secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                    />
                </CopyText>
                )}
            </ModalHeader>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className={'grid gap-y-1'}
                >
                    <ModalBody className={`px-0 ${picture ? 'pt-0' : 'pt-8'}`}>
                        <>
                            <form>
                                <Input
                                    className={"hidden"}
                                    type="file"
                                    ref={fileRef}
                                    onChange={handleChange}
                                />
                                {picture ? (
                                    <div
                                        className={'flex flex-col justify-center items-center w-full h-full aspect-square rounded-none border-1 cursor-pointer'}
                                        onClick={() => {
                                            if (fileRef.current) {
                                                fileRef.current.click();
                                            }
                                        }}
                                    >
                                        <Image
                                            removeWrapper
                                            alt={productData?.name || 'Item Image'}
                                            className="object-cover w-full rounded-none"
                                            src={picture}
                                        />
                                    </div>
                                    ):(
                                    <div
                                        className={'flex flex-col justify-center items-center w-full h-full aspect-square rounded-none border-1 cursor-pointer'}
                                        onClick={() => {
                                            if (fileRef.current) {
                                                fileRef.current.click();
                                            }
                                        }}
                                    >
                                        <Icon icon={'solar:gallery-add-bold-duotone'} className={'text-default-500 w-full'}
                                              width={64}/>
                                        <p className={'text-default-500'}>
                                            Upload Item Image
                                        </p>
                                    </div>
                                    )}
                            </form>
                            <div className={'flex flex-col px-4'}>
                                <div className={'flex flex-row'}>
                                    <Input
                                        variant={'underlined'}
                                        className={'w-2/3'}
                                        classNames={{
                                            input: cn("text-xl sm:text-2xl truncate font-medium"),
                                        }}
                                        value={productData?.name}
                                        placeholder={'Item Name'}
                                    />
                                    <Input
                                        variant={'underlined'}
                                        className={'w-1/3'}
                                        classNames={{
                                            input: cn("text-lg cm:text-xl font-light"),
                                        }}
                                        value={productData?.price ? (productData?.price / 100).toString() : ''}
                                        placeholder="0.00"
                                        startContent={
                                            <div className="pointer-events-none flex items-center">
                                                <span className="text-default-400 text-3xl">€</span>
                                            </div>
                                        }
                                        type="number"
                                    />
                                </div>
                                <Spacer y={2} />
                                <Textarea
                                    labelPlacement={'inside'}
                                    variant={'underlined'}
                                    placeholder={`Add a description to your item...`}
                                    style={{resize: "none"}}
                                    className=" text-default-400"
                                    classNames={{
                                        input: cn("min-h-[40px] text-base text-default-400"),
                                    }}
                                    value={productData?.description}
                                />
                                <Spacer y={2} />
                                <div className={'flex w-full justify-end'}>
                                    <Select
                                        className="w-1/2"
                                        placeholder="Select a category"
                                        variant={"underlined"}
                                        value={productData?.category}
                                    >
                                        {Object.keys(categories).map((key) => (
                                            <SelectItem key={key} >{key}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </>
                    </ModalBody>
                    <ModalFooter
                        className={'px-4 space-x-4'}
                        >
                        {productData && (
                            <>
                                <Modal isOpen={isOpenDelete} size={"sm"} onClose={onClose}>
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
                                                    <Button color="primary"  onPress={() => setIsOpenDelete(false)}>
                                                        Close
                                                    </Button>
                                                    <Button color="danger" variant={'light'} onPress={handleDelete}>
                                                        Confirm
                                                    </Button>
                                                </ModalFooter>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                                <Button
                                    variant={'bordered'}
                                    className={'w-1/3'}
                                    onPress={() => setIsOpenDelete(true)}
                                    type={'button'}
                                >
                                    <Icon icon="solar:trash-bin-trash-broken" width={24}/>
                                </Button>
                            </>
                        )}
                        <Button
                            className={`w-2/3 ${!productData && "w-full"}`}
                            color="primary"
                            type={'submit'}
                            isLoading={isPending}
                        >
                            { isPending ? 'Loading...' : productData ? 'Update' : 'Add'} Item
                        </Button>
                    </ModalFooter>
                </form>
        </Form>
        </>
    );
}

