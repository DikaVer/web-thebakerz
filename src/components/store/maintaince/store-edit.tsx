import React, {useEffect, useMemo, useState} from "react";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {ImageUploader} from "@/components/upload-image";
import {FormError} from "@/components/authentication/form-error";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {storeEditSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {AvatarUploader} from "@/components/upload-avatar";
import {StoreData} from "@/lib/definitions";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {ClipLoader} from "react-spinners";
import {toast} from "sonner";
import {IconCircleAlert, IconSuccess} from "@/components/ui/icons";
import {useRouter} from "next/navigation";


interface StoreViewDashboardProps {
    id: string,
    user_id: string,
    name:  string,
    description: string | null,
    nickname: string,
    image: string | null,
    background_url: string | null,
    setStoreData: (data: StoreData) => void;
}

export default function StoreViewDashboard({ id, user_id, name, image, background_url, setStoreData, nickname, description }: StoreViewDashboardProps) {

    const [error, setError] = useState<string | undefined>();

    const [isPending, setPending] = useState(false);

    const router = useRouter();

    const [dataAvatar, setDataAvatar] = useState<{
        image: string | null
    }>({
        image: image
    });

    const [dataBackground, setDataBackground] = useState<{
        image: string | null
    }>({
        image: background_url
    });

    const [isAvatarDialogOpen, setAvatarDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof storeEditSchema>>({
        resolver: zodResolver(storeEditSchema),
        defaultValues: {
            name: name,
            description: description ? description : "",
            image: null,
            nickname: nickname,
            background: null
        }
    });

    let initialValues =   {
        name: name,
        description: description ? description : "",
        nickname: nickname,
        image: image,
        background: background_url
    };

    const isChanged = useMemo(() => {
        const formValues = form.getValues();
        return (
            JSON.stringify(formValues.name) !== JSON.stringify(initialValues.name) ||
            JSON.stringify(formValues.description) !== JSON.stringify(initialValues.description) ||
            JSON.stringify(formValues.nickname) !== JSON.stringify(initialValues.nickname) ||
            formValues.image !== null ||
            formValues.background !== null
        );
    }, [form, initialValues]);


    const onSubmit = async (formData: z.infer<typeof storeEditSchema>) => {
        setPending(true);

        if (initialValues.name !== formData.name) {
            const response = await fetch(`/api/user/actions/updateName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user_id,
                    nickname: formData.name
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
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
                initialValues.name = formData.name;
                // @ts-ignore
                setStoreData(prevState => ({
                    ...prevState,
                    ["name"]: form.getValues().name,
                }));
            }
        }

        if (initialValues.description !== formData.description) {
            const response = await fetch(`/api/store/actions/updateDescription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    storeId: id,
                    description: formData.description
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
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
                    ["description"]: form.getValues().description,
                }));
            }
        }

        if (formData.image && formData.image instanceof File) {
            const response = await fetch(`/api/user/actions/updateAvatar`, {
                method: 'POST',
                headers: {
                    'content-type': formData.image?.type || "application/octet-stream",
                    'user-id': user_id
                },
                body: formData.image,
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
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
                    ["image"]: dataAvatar.image
                }));
            }
        }

        if (formData.background && formData.background instanceof File) {
            const response = await fetch(`/api/store/actions/updateBackground`, {
                method: 'POST',
                headers: {
                    'content-type': formData.background?.type || "application/octet-stream",
                    'store-id': id
                },
                body: formData.background,
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
                // console.log(result.message);
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
                initialValues.background = dataBackground.image ? dataBackground.image : null;
                // @ts-ignore
                setStoreData(prevState => ({
                    ...prevState,
                    ["background_url"]: dataBackground.image
                }));
            }
        }

        if (initialValues.nickname !== formData.nickname) {
            const response = await fetch(`/api/store/actions/updateName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    storeId: id,
                    nickname: formData.nickname
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error((
                        <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                            <IconCircleAlert color={"primary"} className={"w-10 h-10"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
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
                initialValues.nickname = formData.nickname;
                // @ts-ignore
                setStoreData(prevState => ({
                    ...prevState,
                    ["nickname"]: form.getValues().nickname
                }));
                router.push(`/${formData.nickname}`);
                router.refresh();
            }
        }

        setPending(false);
    }

    return (
        <div>
            {isPending ? (
                <div className={"flex flex-col min-h-screen justify-center items-center"}>
                    <ClipLoader
                        color={"#730C6F"}
                        loading={isPending}
                        size={150}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.3}
                    />
                    <p className={"text-2xl"}>Your store is updating...</p>
                </div>
                ) : (
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
                                    Avatar Image
                                </FormLabel>
                                <FormControl>
                                    <>
                                        {
                                            isAvatarDialogOpen &&
                                                <AvatarUploader
                                                    form={form}
                                                    field={field}
                                                    name={"image"}
                                                    isDialogOpen={isAvatarDialogOpen}
                                                    setDialogOpen={setAvatarDialogOpen}
                                                    setGlobalData={setDataAvatar}
                                                />
                                        }
                                        {
                                            dataAvatar.image &&
                                                <Image
                                                    src={dataAvatar.image}
                                                    width={128}
                                                    height={128}
                                                    alt={name}
                                                    className={"rounded-full w-32 h-32"}
                                                />
                                        }
                                        <Button
                                            type={"button"}
                                            onClick={() => {
                                                setDataAvatar({image: null});
                                                form.setValue("image", null);
                                                setAvatarDialogOpen(true)
                                            }
                                        }
                                            variant={"secondary"}
                                            disabled={isPending}
                                        >
                                            Change Avatar
                                        </Button>
                                    </>
                                </FormControl>
                                <FormDescription>
                                    {dataAvatar.image ? "Click on the image to change it." : "Upload an image to represent your store."}
                                </FormDescription>
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
                                    Store Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder={form.getValues().name}
                                        required
                                        className={"shadow"}
                                        type={"text"}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    This is the name that will be used in your store&apos;s page near avatar.
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nickname"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Nickname
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isPending}
                                        placeholder={form.getValues().nickname}
                                        className={"shadow"}
                                        required
                                        type={"text"}
                                        onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                                    />
                                </FormControl>
                                <FormMessage/>
                                <FormDescription>
                                    This is the name that will be used in your store&apos;s URL.
                                </FormDescription>
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
                                            placeholder={"Tell us about your store... (max 500 characters)"}                                            maxLength={500}
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
                        name="background"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel
                                    className="block text-sm font-medium text-gray-700">
                                    Background Image
                                </FormLabel>
                                <FormControl>
                                    <ImageUploader
                                        form={form}
                                        field={field}
                                        name={"background"}
                                        setError={setError}
                                        data={dataBackground}
                                        setData={setDataBackground}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormError message={error}/>
                    {/* Submit Button */}
                    <div>
                        <div className={"flex flex-row space-x-4"}>
                            <Button
                                type="button"
                                className="mb-4 w-full"
                                variant={"secondary"}
                                disabled={!isChanged || isPending}
                                onClick={() => {
                                    // @ts-ignore
                                    setStoreData(prevState => ({
                                        ...prevState,
                                        ["name"]: form.getValues().name,
                                        ["description"]: form.getValues().description,
                                        ["nickname"]: form.getValues().nickname,
                                        ["image"]: dataAvatar.image,
                                        ["background_url"]: dataBackground.image
                                    }));
                                    // @ts-ignore
                                    document.getElementById("main").scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                Preview
                            </Button>
                            {/*<Button*/}
                            {/*    type="button"*/}
                            {/*    className="mb-4 w-full"*/}
                            {/*    variant={"outline"}*/}
                            {/*    disabled={isPending}*/}
                            {/*    onClick={() => {*/}
                            {/*        // @ts-ignore*/}
                            {/*        setStoreData(prevState => ({*/}
                            {/*            ...prevState,*/}
                            {/*            ...initialStoreValues*/}
                            {/*        }));*/}
                            {/*        form.reset();*/}
                            {/*        setDataAvatar({image: null});*/}
                            {/*        setDataBackground({image: null});*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    Revert*/}
                            {/*</Button>*/}
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    className=" w-full"
                                    disabled={!isChanged || isPending}
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
                    </div>
                </form>
            </Form>
            )}
        </div>
    );
}