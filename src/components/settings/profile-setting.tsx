'use client';

import React, {startTransition, useState} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {Card, CardBody, Input, Textarea, Button, cn, Avatar, Spacer, Link, Badge, addToast} from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useActionState } from "react";
import { updateProfile} from "@/lib/actions/profile-actions";
import { Icon } from "@iconify/react";

// Import the ProfileSchema we created above
import { ProfileSettingsSchema } from "@/lib/schemas/index";
import { User} from "@/lib/actions/user";
import {useTheme} from "next-themes";
import {ImageUploader} from "@/components/image/image-upload";
import AvatarImageForm from "@/components/image/image-form";
import showErrorMessage from "@/components/toast/toast-error";
import {useSession} from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import {SessionValidationResult} from "@/lib/actions/session";
import {useTranslations} from "next-intl";

interface ProfileSettingCardProps {
    className?: string;
}

const ProfileSetting = React.forwardRef<HTMLDivElement, ProfileSettingCardProps>(
    ({ className, ...props }, ref) => {
        const t = useTranslations("app/(return_page)/settings/components/profile-setting");

        const { session, setSession } = useSession();

        const { user } = session;

        if (!user || !session ) {
            return NotFound();
        }

        const {theme} = useTheme();

        const [avatarEdit, setAvatarEdit] = useState(false);
        const [file, setFile] = useState<File | undefined>();

        // Initialize the form using the ProfileSchema with default values from props
        const form = useForm<z.infer<typeof ProfileSettingsSchema>>({
            resolver: zodResolver(ProfileSettingsSchema),
            defaultValues: {
                role: user.role,
                name: user.username,
            },
        });

        // useActionState similar to your ContactUs example – it will call our updateProfile action.
        const [state, submitAction, isPending] = useActionState(
            async (previousState: any, formData: z.infer<typeof ProfileSettingsSchema>) => {
                // Pass along the user's email and role so the updateProfile action can write to the proper tables
                const result = await updateProfile(formData);

                if (result?.success) {
                    addToast({
                        title: t("profileUpdated"),
                        description: t("profileHasUpdated"),
                        color: "success",
                        shouldShowTimeoutProgress: true,
                        timeout: 2000,
                    })

                    setSession((prevSession): SessionValidationResult => {
                        if (!prevSession) return prevSession;

                        if (prevSession.user) {
                            return {
                                ...prevSession,
                                user: {
                                    ...prevSession.user,
                                    username: formData.name
                                } as User
                            }
                        }

                        return prevSession;
                    });

                } else if (result?.error) {
                    showErrorMessage({error: result.error});
                }
            },
            null
        );

        // Handle the form submission with startTransition
        const handleSubmit = (formData: z.infer<typeof ProfileSettingsSchema>) => {
            startTransition(() => {
                submitAction(formData);
            });
        };

        return (
            <div ref={ref} className={cn( className)} {...props}>
                {/* Profile */}
                <div>
                    <ImageUploader
                        type={"circle"}
                        file={file}
                        isOpen={avatarEdit}
                        onClose={() => setAvatarEdit(false)}
                        container={"avatars"}
                    />
                    <p className="text-base font-medium text-default-700">{t("profile")}</p>
                    <p className="mt-1 text-sm font-normal text-default-500">
                        {user.role === "bakerz" ? t("displaysProfileStore") : t("displaysProfile")}
                    </p>
                    <Card shadow="none" className="mt-4 ">
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <Badge
                                    showOutline
                                    classNames={{
                                        badge: "w-5 h-5",
                                    }}
                                    content={
                                        <AvatarImageForm
                                            setFile={setFile}
                                            onUpload={() => setAvatarEdit(true)}
                                        />
                                    }
                                    placement="bottom-right"
                                    shape="circle"
                                >
                                    <Avatar
                                        key={user.picture} // changing key forces re-mount
                                        src={user.picture}
                                        className="h-16 w-16 text-xl"
                                        name={user.username}
                                        isBordered
                                        color="primary"
                                        classNames={{ base: "bg-default text-text shadow-lg" }}
                                    />
                                </Badge>
                                <div>
                                    <p className="text-sm font-medium text-default-500">{user.username}</p>
                                    <p className="text-xs text-default-500">
                                        {user.role === "bakerz" ? t("bakerz") : t("customer")}
                                    </p>
                                    <p className="mt-1 text-xs text-default-500">{user.email}</p>
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
                            <p className="text-base font-medium text-default-700">
                                {user.role === "bakerz" ? t("storeName") : t("name")}
                            </p>
                            <p className="mt-1 text-sm font-normal text-default-500">
                                {user.role === "bakerz" ? t("editCurrentStoreName") : t("editCurrentName")}
                            </p>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                className={'mt-2'}
                                                placeholder={`${user?.username}`}
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
                        <div className={`flex flex-row-reverse w-full`}>
                            <Button
                                startContent={!isPending && <Icon icon="solar:settings-broken" width={24}/>}
                                className="mt-4"
                                color={'secondary'}
                                type={'submit'}
                                isDisabled={isPending}
                                isLoading={isPending}
                            >
                                {
                                    isPending ? t('updating') : t('updateProfile')
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
