'use client';

import React, {startTransition, useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {Card, CardBody, Input, Textarea, Button, cn, Avatar, Spacer, Link} from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormError } from "@/components/authentication/form-error";
import SuccessRedirect from "@/components/redirect-page";
import { useActionState } from "react";
import { updateProfile} from "@/lib/actions/profile-actions";
import { Icon } from "@iconify/react";

// Import the ProfileSchema we created above
import { ProfileSchema } from "@/lib/schemas";
import {LocationData} from "@/lib/actions/user";
import {Badge} from "@heroui/badge";
import {useTheme} from "next-themes";
import {IconLocation, IconPhone, IconSuccess} from "@/components/ui/icons";
import {toast} from "sonner";
import {Alert} from "@heroui/alert";
import {AvatarImageUploader} from "@/components/image/avatar-upload";
import ImageForm from "@/components/image/image-form";


interface ProfileSettingCardProps {
    className?: string;
}

const ProfileSetting = React.forwardRef<HTMLDivElement, ProfileSettingCardProps & {
    picture: string;
    name: string;
    email: string;
    location?: string;
    storeName?: string;
    description?: string;
    store_loc?: LocationData;
    phone?: string;
    role: string;
}>(
    ({ className, email, name, phone, picture, description, location, storeName, role, ...props }, ref) => {


        const {theme} = useTheme();
        const [nameState, setName] = useState(name);
        const [storeNameState, setStoreName] = useState(storeName);
        const [avatarEdit, setAvatarEdit] = useState(false);
        const [file, setFile] = useState<File | undefined>();
        const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

        // Set up a character counter for the description field (max 500 characters)
        const [charCount, setCharCount] = useState(description?.length || 0);

        // Initialize the form using the ProfileSchema with default values from props
        const form = useForm<z.infer<typeof ProfileSchema>>({
            resolver: zodResolver(ProfileSchema),
            defaultValues: {
                role: role,
                name: name,
                description: description || undefined,
                storeName: storeName || undefined,
            },
        });

        // useActionState similar to your ContactUs example – it will call our updateProfile action.
        const [state, submitAction, isPending] = useActionState(
            async (previousState: any, formData: z.infer<typeof ProfileSchema>) => {
                // Pass along the user's email and role so the updateProfile action can write to the proper tables
                const result = await updateProfile(formData, role);

                if (result?.success) {
                    toast.message((
                            <div className="flex flex-col gap-4 w-full">
                                <Alert
                                    color="success"
                                    title={"Success Notification"}
                                    description={`Your profile ${role === "bakerz" ? '& store have' : 'has'} been updated successfully.`}
                                    variant="faded"

                                />
                            </div>
                        ),
                        {
                            duration: 2000,
                            className: `p-0 rounded-xl`
                        }
                    );

                    setName(formData.name);
                    setStoreName(formData.storeName);
                } else if (result?.error) {
                    toast.message((
                            <div className="flex flex-col gap-4 w-full">
                                <Alert
                                    color="danger"
                                    title={"Warning Notification"}
                                    description={result.error}
                                    variant="faded"

                                />
                            </div>
                        ),
                        {
                            duration: 2000,
                            className: `p-0 rounded-xl`
                        }
                    );
                }
            },
            null
        );

        // Handle the form submission with startTransition
        const handleSubmit = (formData: z.infer<typeof ProfileSchema>) => {
            startTransition(() => {
                submitAction(formData);
            });
        };

        return (
            <div ref={ref} className={cn("p-2", className)} {...props}>
                {/* Profile */}
                <div>
                    <AvatarImageUploader
                        file={file}
                        isOpen={avatarEdit}
                        onClose={() => setAvatarEdit(false)}
                        setFile={setFile}
                        setAvatarUrl={setAvatarUrl}
                    />
                    <p className="text-base font-medium text-default-700">Profile</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        This displays your public profile {role === "bakerz" && "& store"} on the site
                    </p>
                    <Card className="mt-4 bg-default-100" shadow="none">
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <Badge
                                    showOutline
                                    classNames={{
                                        badge: "w-5 h-5",
                                    }}
                                    content={
                                        <ImageForm
                                            setFile={setFile}
                                            onUpload={() => setAvatarEdit(true)}
                                        />
                                    }
                                    placement="bottom-right"
                                    shape="circle"
                                >
                                    <Avatar
                                        key={avatarUrl ? avatarUrl : picture} // changing key forces re-mount
                                        src={avatarUrl ? avatarUrl : picture}
                                        className="h-16 w-16 text-xl"
                                        name={name}
                                        isBordered
                                        color="secondary"
                                        classNames={{ base: "bg-default text-text shadow-lg" }}
                                    />
                                </Badge>
                                <div>
                                    <p className="text-sm font-medium text-default-500">{nameState}</p>
                                    <p className="text-xs text-default-400">{role === "user" ? "Customer" : `TheBakerz - ${storeNameState}`}</p>
                                    <p className="mt-1 text-xs text-default-400">{email}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
                <Spacer y={4} />
                {/* Title */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className={'grid gap-y-1'}
                    >
                        <div>
                            <p className="text-base font-medium text-default-700">Name</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Edit your current name</p>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isRequired
                                                className={'mt-2'}
                                                placeholder={`${name}`}
                                                type="text"
                                                validate={() => {
                                                    return fieldState.error?.message;
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Spacer y={2} />
                        {/* Location */}
                        {role === "bakerz" && (
                            <>
                                <div>
                                    <p className="text-base font-medium text-default-700">Store Name</p>
                                    <p className="mt-1 text-sm font-normal text-default-400">Edit your current store name</p>
                                    <FormField
                                        control={form.control}
                                        name="storeName"
                                        render={({field, fieldState}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        isRequired
                                                        className={'mt-2'}
                                                        placeholder={`${storeNameState ? storeNameState : 'Type your store name'}`}
                                                        type="text"
                                                        validate={() => {
                                                            return fieldState.error?.message;
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Spacer y={2}/>
                                <div>
                                    <p className="text-base font-medium text-default-700">Location & Phone Number</p>
                                    <p className="mt-1 text-sm font-normal text-default-400">You can edit location and phone number
                                        by {" "}
                                        <Link
                                            className={'text-grayText underline'}
                                            href="/support/contact-us"
                                            size="sm"
                                            underline="hover">
                                            Contact Us
                                        </Link>
                                    </p>
                                    <Input
                                        isDisabled
                                        className={'mt-2 opacity-100'}
                                        labelPlacement="outside"
                                        placeholder={location ? location : "Location Placeholder"}
                                        startContent={
                                            <IconLocation size={24}
                                                          primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                          secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                            />
                                        }
                                    />
                                    <Spacer y={2}/>
                                    <Input
                                        isDisabled
                                        className={'mt-2 opacity-100'}
                                        labelPlacement="outside"
                                        placeholder={`${phone ? phone : 'Phone Number Placeholder'}`}
                                        startContent={
                                            <IconPhone size={24}
                                                       primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                       secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                            />
                                        }

                                    />
                                </div>
                                <Spacer y={4}/>
                                {/* Biography */}
                                <div>
                                    <p className="text-base font-medium text-default-700">Description</p>
                                    <p className="mt-1 text-sm font-normal text-default-400">
                                        Write about your store and what makes it unique
                                    </p>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field, fieldState}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        isRequired
                                                        placeholder={`${description ? description : 'Tell us about your store... (max 500 characters)'}`}
                                                        style={{resize: "none"}}
                                                        className="mt-2"
                                                        classNames={{
                                                            input: cn("min-h-[115px]"),
                                                        }}
                                                        minRows={4}
                                                        maxRows={5}
                                                        onValueChange={(value) => {
                                                            setCharCount(value.length);
                                                        }}
                                                        validate={() => {
                                                            return fieldState.error?.message;
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-right text-grayText text-small px-2">{charCount}/2000</p>

                                </div>
                            </>
                        )}
                        <div className={`flex flex-row-reverse w-full`}>
                            <Button
                                startContent={!isPending && <Icon icon="solar:settings-broken" width={24}/>}
                                className="mt-4 text-black shadow"
                                color={'secondary'}
                                type={'submit'}
                                isLoading={isPending}
                            >
                                {
                                    isPending ? 'Updating...' : 'Update Profile'
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        );
    },
);

ProfileSetting.displayName = "ProfileSetting";

export default ProfileSetting;
