import * as React from "react";
import {useEffect, useState} from "react";

import {ClipLoader} from "react-spinners";
import {Button} from "@/components/ui/button";
import {IconCross, IconError, IconSuccess} from "@/components/ui/icons";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ImageUploader} from "@/components/upload-image";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {productEditSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {categories} from "@/lib/local-variables";
import {CaretSortIcon} from "@radix-ui/react-icons";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {CheckIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import {toast} from "sonner";
import {FormError} from "@/components/authentication/form-error";
import {ProductDataField, StoreData} from "@/lib/definitions";

interface ProductsEditProps {
    id: string;
    setDialogOpen: (open: boolean) => void;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
    productData?: ProductDataField;
}

export default function ProductsAdd({ id, isPending, setPending, setDialogOpen, setStoreData, productData}: ProductsEditProps) {


    const form = useForm<z.infer<typeof productEditSchema>>({
        resolver: zodResolver(productEditSchema),
        defaultValues: {
            name: productData?.name || "",
            description: productData?.description || "",
            price: productData?.price || 0,
            category: productData?.category || "",
            image: undefined
        }
    });

    const [error, setError] = useState<string | undefined>();

    const [open, setOpen] = useState(false);

    const [dataBackground, setDataBackground] = useState<{ image: string | null }>({
        image: productData?.image_url || null,
    });

    const onSubmit = async (formData: z.infer<typeof productEditSchema>) => {
        setPending(true);

        let imageUrl = productData?.image_url;

        if(formData.image) {
            const responseImage = await fetch(`/api/store/actions/product/uploadImage`, {
                method: 'POST',
                headers: {
                    'content-type': formData.image?.type || "application/octet-stream",
                    'store-id': id
                },
                body: formData.image,
            });

            const resultImage = await responseImage.json();

            if (!responseImage.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconError color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {resultImage.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
                return;
            } else {
                toast.success((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconSuccess color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {resultImage.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
                imageUrl = resultImage.url;
            }
        }

        console.log({
            name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                file_url: imageUrl
        });

        const response = await fetch(`/api/store/actions/product/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: id,
                productData:{
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    category: formData.category,
                    file_url: imageUrl
                }
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            toast.error((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconError color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
            return;
        } else {
            toast.success((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconSuccess color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
            // @ts-ignore
            setStoreData(prevState => ({
                ...prevState,
                products: [
                    ...prevState.products,
                    {
                        name: formData.name,
                        description: formData.description,
                        price: formData.price,
                        category: formData.category,
                        file_url: imageUrl
                    }
                ]
            }));
        }

        setDialogOpen(false);
        setPending(false);
    }


    return (
        <div className={"mt-4"}>
            <>
                <div className="fixed z-40 h-full bg-black opacity-50 inset-0"
                     onClick={(e) => {
                         setDialogOpen(false);
                     }}/>
                <div
                    className={"fixed left-[50%] top-[60%] z-40 grid w-full max-w-lg sm:max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg rounded-lg"}
                >
                    <ScrollArea className={"max-h-[75vh]"}>
                    <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                        <div className={`flex flex-row justify-between items-center`}>
                            <Button
                                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                onClick={() => {
                                    setDialogOpen(false);
                                }}
                            >
                                <IconCross className={"w-8 h-8 cursor-pointer"}/>
                            </Button>
                            <p className={"text-xl"}>Product details</p>
                            <div className="w-8 h-8 flex "></div>
                        </div>
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
                                                    Image
                                                </FormLabel>
                                                <FormControl>
                                                    <ImageUploader
                                                        form={form}
                                                        field={field}
                                                        name={"image"}
                                                        setError={setError}
                                                        data={dataBackground}
                                                        setData={setDataBackground}
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
                                                    Name
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder={form.getValues().name}
                                                        required
                                                        type={"text"}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel
                                                    className="block text-sm font-medium text-gray-700"
                                                >
                                                    Category
                                                </FormLabel>
                                                <FormControl>
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={open}
                                                                className="w-[300px] justify-between truncate"
                                                            >
                                                                {field.value
                                                                    ? Object.keys(categories).find((category) => category === field.value)
                                                                    : "Select category..."}
                                                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-full p-0">
                                                            <Command>
                                                                <CommandInput placeholder={"Search category..."} className="h-9" />
                                                                <CommandList>
                                                                    <CommandEmpty>No city found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {Object.keys(categories).map((category) => (
                                                                            <CommandItem
                                                                                key={category}
                                                                                value={category}
                                                                                onSelect={() => {
                                                                                    form.setValue("category", category)
                                                                                }}
                                                                            >
                                                                                {category}
                                                                                <CheckIcon
                                                                                    className={cn(
                                                                                        "ml-auto h-4 w-4",
                                                                                        category === field.value ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    </FormControl>
                                                <FormMessage/>
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
                                            value={form.getValues().description ?? undefined}
                                            disabled={isPending}
                                            placeholder={"Tell us about your product... (max 500 characters)"}                                            maxLength={500}
                                            style={{resize: "none"}}
                                        ></textarea>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )
                                        }
                                    />
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="block text-sm font-medium text-gray-700">
                                                    Price
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="0"
                                                        placeholder="Enter price (e.g. 14.99)"
                                                        disabled={isPending}
                                                        onChange={(e) => field.onChange(Number(parseFloat(e.target.value).toFixed(2)))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormError message={error} />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                className=" w-full"
                                                disabled={ isPending}
                                            >
                                                Apply
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. These changes will be seen to everyone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => form.handleSubmit(onSubmit)()}
                                                    disabled={isPending}
                                                >
                                                    Apply
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </form>
                            </Form>
                    </div>
                    </ScrollArea>
                </div>
            </>
        </div>
    );
}

export function ProductsEdit({ id, isPending, setPending, setDialogOpen}: ProductsEditProps) {

    return (
        <div className={"mt-4"}>
            {isPending ? (
                <div className={"flex flex-col justify-center items-center"}>
                    <ClipLoader
                        color={"#730C6F"}
                        loading={isPending}
                        size={150}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.3}
                    />
                    <p className={"text-2xl"}>Your products details are updating...</p>
                </div>
            ) : (
                <>
                    <div className="fixed z-30 h-full bg-black opacity-50 inset-0"
                         onClick={(e) => {
                             setDialogOpen(false);
                         }}/>
                    <div
                        className={"fixed left-[50%] top-[60%] z-40 grid w-full max-w-lg sm:max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg rounded-lg"}
                    >
                        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                            <div className={`flex flex-row justify-between items-center`}>
                                <Button
                                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                    onClick={() => {
                                        setDialogOpen(false);
                                    }}
                                >
                                    <IconCross className={"w-8 h-8 cursor-pointer"}/>
                                </Button>
                                <p className={"text-xl"}>Name Editing</p>
                                <div className="w-8 h-8 flex "></div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}