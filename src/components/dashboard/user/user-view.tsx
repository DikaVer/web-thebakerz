'use client';


import ViewHeader from "@/components/dashboard/user/header-view";
import Image from "next/image";
import {IconAvatar, IconEdit, IconCircleAlert, IconSuccess} from "@/components/ui/icons";
import React, { useMemo, useState} from "react";
import {UsersData} from "@/lib/definitions";
import {useForm} from "react-hook-form";
import {z} from "zod";
import { userEditSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {AvatarUploader} from "@/components/upload-avatar";
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import {NameChangeDialog} from "@/components/dashboard/user/name-change";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {ClipLoader} from "react-spinners";
import {toast} from "sonner";



export default function UserViewDashboard({userDataProps}: { userDataProps: UsersData }) {

    const [userData, setUserData] = useState<UsersData>(userDataProps);

    const [error, setError] = useState<string | undefined>();

    const [isPending, setPending] = useState(false);

    const [dataAvatar, setDataAvatar] = useState<{
        image: string | null
    }>({
        image: null,
    });

    const [dataName, setDataName] = useState<string>(userData.name);

    const [isAvatarDialogOpen, setAvatarDialogOpen] = useState(false);

    const [isNameDialogOpen, setNameDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof userEditSchema>>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            name: userData.name,
            image: null,
        }
    });

    let initialValues =   {
        name: userData.name,
    };

    const isChanged = useMemo(() => {
        const formValues = form.getValues();
        return (
            JSON.stringify(formValues.name) !== JSON.stringify(initialValues.name) ||
            dataAvatar.image !== null
        );
    }, [form, initialValues, dataAvatar]);

    const onSubmit = async (formData: z.infer<typeof userEditSchema>) => {
        setPending(true);

        if (initialValues.name !== formData.name) {
            const response = await fetch(`/api/user/actions/updateName`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userData.id,
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
                            <IconSuccess className={"w-10 h-10 text-primary"}/>
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
            }
        }

        if (formData.image && formData.image instanceof File) {
            console.log(formData.image?.type);
            const response = await fetch(`/api/user/actions/updateAvatar`, {
                method: 'POST',
                headers: {
                    'content-type': formData.image?.type || "application/octet-stream",
                    'user-id': userData.id
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
                            <IconSuccess className={"w-10 h-10 text-primary"}/>
                            <p className={"text-base font-bold"}>
                                {result.message}
                            </p>
                        </div>
                    ),
                    {
                        duration: 10000
                    }
                );
                userData.image = dataAvatar.image;
                dataAvatar.image = null;
            }
        }

        setPending(false);
    };

    return (
        <>
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
                        <p className={"text-2xl"}>Your profile is updating...</p>
                    </div>
                ) : (
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                <ViewHeader user_id={userData.id}/>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6">
                        {isNameDialogOpen &&
                            <NameChangeDialog
                                form={form}
                                isDialogOpen={isNameDialogOpen}
                                setDialogOpen={setNameDialogOpen}
                                setGlobalData={setDataName}
                                originName={userData.name}
                            />}

                        <FormField
                            control={form.control}
                            name="image"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <>
                                            {isAvatarDialogOpen &&
                                                <AvatarUploader
                                                    form={form}
                                                    field={field}
                                                    name={"image"}
                                                    isDialogOpen={isAvatarDialogOpen}
                                                    setDialogOpen={setAvatarDialogOpen}
                                                    setGlobalData={setDataAvatar}
                                                />}
                                        </>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                <div className="flex items-center justify-center cursor-pointer hover:scale-105 transition duration-500"
                     onClick={() => {
                         setDataAvatar({image: null});
                         form.setValue("image", null);
                         setAvatarDialogOpen(true)
                     }}
                >
                    {userData.image ? (
                        <Image
                            src={dataAvatar.image ? dataAvatar.image : userData.image}
                            className="rounded-full border-1 border-black"
                            width={128}
                            height={128}
                            alt={`${userData.name}'s profile picture`}
                        />
                    ) : dataAvatar.image ? (
                        <Image
                            src={dataAvatar.image}
                            className="rounded-full border-1 border-black"
                            width={128}
                            height={128}
                            alt={`${userData.name}'s profile picture`}
                        />
                    ) : (
                        <IconAvatar className="w-32"/>
                    )}
                    <IconEdit
                        className={`absolute ${dataAvatar.image ? "mt-32" : "mt-[104px]"} w-8 rounded-full text-text bg-grayBg p-1 border-1 border-black `}/>
                </div>

                <div className="mt-6 text-center">
                    <h1 className="text-xl font-semibold text-gray-800">{dataName}</h1>
                    <p className="text-gray-600">{userData.email}</p>
                </div>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <div className="bg-grayBg p-4 rounded-lg">
                            <p className="font-semibold text-gray-800">Name:</p>
                            <div className={"flex flex-row items-start cursor-pointer "}
                                 onClick={() => {
                                     setNameDialogOpen(true)
                                 }}
                            >
                                <p>{dataName}</p>
                                <IconEdit className="w-5 ml-2 text-text hover:scale-115 transition duration-500"/>
                            </div>
                        </div>
                        <div className="bg-grayBg p-4 rounded-lg">
                            <p className="font-semibold text-gray-800">Email:</p>
                            <p>{userData.email}</p>
                        </div>
                        <div className="bg-grayBg p-4 rounded-lg">
                            <p className="font-semibold text-gray-800">Role:</p>
                            <p className={"capitalize"}>{userData.role}</p>
                        </div>
                        <div className="bg-grayBg p-4 rounded-lg">
                            <p className="font-semibold text-gray-800">Account created:</p>
                            <p className={"capitalize"}>{userData.date.toString()}</p>
                        </div>
                    </div>
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
                    </form>
                </Form>
                {/*{addressData && (*/}
                {/*    <UserAddresses*/}
                {/*        // @ts-ignore*/}
                {/*        shippingAddress={addressData.shippingAddress}*/}
                {/*        // @ts-ignore*/}
                {/*        savedAddresses={addressData.savedAddresses}*/}
                {/*    />*/}
                {/*    )}*/}
            </div>
                )}
        </>
    );
}