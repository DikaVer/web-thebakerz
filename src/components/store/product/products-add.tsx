import * as React from "react";
import {useState} from "react";

import {ClipLoader} from "react-spinners";
import {Button} from "@/components/ui/button";
import {IconCross, IconError, IconSuccess} from "@/components/ui/icons";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
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
import {cn, formatPrice} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import {toast} from "sonner";
import {FormError} from "@/components/authentication/form-error";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {ProductImageUploader} from "@/components/upload-product-image";
import Image from "next/image";

interface ProductsEditProps {
    storeId: string;
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
    productData?: ProductDataField;
    action: "add" | "update";
}

export default function ProductsAdd({ storeId, isDialogOpen, isPending, setPending, setDialogOpen, setStoreData, productData, action}: ProductsEditProps) {


    const form = useForm<z.infer<typeof productEditSchema>>({
        resolver: zodResolver(productEditSchema),
        defaultValues: {
            name: productData?.name || "",
            description: productData?.description || "",
            price: productData?.price ? formatPrice(productData.price) : 0,
            category: productData?.category || "",
            image: productData?.image_url || undefined
        }
    });

    const [error, setError] = useState<string | undefined>();

    const [isLoading, setIsLoading] = useState(false);

    const [open, setOpen] = useState(false);

    const [dataBackground, setDataBackground] = useState<{ image: string | null }>({
        image: productData?.image_url || null,
    });

    const [isDialogImageOpen, setDialogImageOpen,] = useState(false);

    const onSubmit = async (formData: z.infer<typeof productEditSchema>) => {
        setPending(true);
        setIsLoading(true);

        let imageUrl = productData?.image_url;

        if (formData.image && formData.image instanceof File) {
            const responseImage = await fetch(`/api/store/actions/product/uploadImage`, {
                method: 'POST',
                headers: {
                    'content-type': formData.image?.type || "application/octet-stream",
                    'store-id': storeId
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
                setIsLoading(false);
                setPending(false);
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


        const response = await fetch(`/api/store/actions/product/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: storeId,
                productData:{
                    id: productData?.id,
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
            setIsLoading(false);
            setPending(false);
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
            if (action === "add") {
                // @ts-ignore
                setStoreData(prevState => ({
                    ...prevState,
                    products: [
                        ...prevState.products,
                        {
                            name: formData.name,
                            description: formData.description,
                            price: formData.price * 100, // Convert to integer
                            category: formData.category,
                            image_url: imageUrl
                        }
                    ]
                }));
            } else {
                // @ts-ignore
                setStoreData(prevState => ({
                    ...prevState,
                    // @ts-ignore
                    products: prevState.products.map((product) => {
                        if (product.id === productData?.id) {
                            return {
                                name: formData.name,
                                description: formData.description,
                                price: formData.price * 100, // Convert to integer
                                category: formData.category,
                                image_url: imageUrl
                            }
                        }
                        return product;
                    })
                }));
            }
        }

        setIsLoading(false);
        setDialogOpen(false);
        setPending(false);
    }

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
                    data-state={isOpen ? 'open' : ''}
                    className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                    onClick={(e) => {
                        toggleClose();
                    }}/>
                <div
                    data-state={isOpen ? 'open' : 'closed'}
                    className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
                >
                    <ScrollArea className={"max-h-[75vh]"}>
                        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
                            {isLoading ? (
                                <div className={"flex flex-col justify-center items-center"}>
                                    <ClipLoader
                                        color={"#730C6F"}
                                        loading={isPending}
                                        size={150}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                        speedMultiplier={0.3}
                                    />
                                    <p className={"text-2xl"}>Your product details is updating...</p>
                                </div>
                            ) : (
                                <>
                                    <div className={`flex flex-row justify-between items-center`}>
                                        <Button
                                            className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                            onClick={() => {
                                                toggleClose();
                                            }}
                                        >
                                            <IconCross className={"w-8 h-8 cursor-pointer"}/>
                                        </Button>
                                        <p className={"text-xl"}>Product details</p>
                                        <div className="w-8 h-8 flex "></div>
                                    </div>
                                    <hr className={"my-1"}></hr>
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
                                                        {
                                                            isDialogImageOpen &&
                                                            <ProductImageUploader
                                                                form={form}
                                                                field={field}
                                                                name={"image"}
                                                                isDialogOpen={isDialogImageOpen}
                                                                setDialogOpen={setDialogImageOpen}
                                                                setGlobalData={setDataBackground}
                                                            />
                                                        }
                                                        <FormControl>
                                                            <>
                                                                {dataBackground.image && (
                                                                    <Image
                                                                        src={dataBackground.image}
                                                                        width={128}
                                                                        height={128}
                                                                        alt="Avatar"
                                                                        className="rounded-xl h-28 w-28 cm:h-32 cm:w-32"
                                                                    />
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => setDialogImageOpen(true)}
                                                                    variant={"secondary"}
                                                                >
                                                                    Choose Picture
                                                                </Button>
                                                            </>
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <hr className={"my-1"}></hr>
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
                                                                className={"shadow"}
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
                                                render={({field}) => (
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
                                                                        className="w-[300px] justify-between truncate shadow"
                                                                    >
                                                                        {field.value
                                                                            ? Object.keys(categories).find((category) => category === field.value)
                                                                            : "Select category..."}
                                                                        <CaretSortIcon
                                                                            className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-full p-0">
                                                                    <Command>
                                                                        <CommandInput placeholder={"Search category..."}
                                                                                      className="h-9"/>
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
                                                    className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-black`}
                                                    rows={5}
                                                    value={form.getValues().description ?? undefined}
                                                    disabled={isPending}
                                                    placeholder={"Tell us about your product... (max 500 characters)"}
                                                    maxLength={500}
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
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel className="block text-sm font-medium text-gray-700">
                                                            Price
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                min="0"
                                                                className={"shadow"}
                                                                placeholder="Enter price (e.g. 14.99)"
                                                                disabled={isPending}
                                                                onChange={(e) => field.onChange(Number(parseFloat(e.target.value).toFixed(2)))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                            <hr className={"my-1"}></hr>
                                            <FormError message={error}/>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        className=" w-full"
                                                        disabled={isPending}
                                                    >
                                                        {action === "add" ? "Add Product" : "Update Product"}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. These changes will be seen to
                                                            everyone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => form.handleSubmit(onSubmit)()}
                                                            disabled={isPending}
                                                        >
                                                            {action === "add" ? "Add Product" : "Update Product"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </form>
                                    </Form>
                            </>
                        )}
                        </div>
                    </ScrollArea>
                </div>
            </>
    );
}
