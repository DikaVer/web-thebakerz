'use client';

import React, {startTransition, useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {Card, CardBody, Input, Textarea, Button, cn, Avatar, Spacer, Link, Badge, addToast, Select, SelectItem, Switch, DatePicker} from "@heroui/react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useActionState } from "react";
import { updateProfile} from "@/lib/actions/profile-actions";
import { Icon } from "@iconify/react";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";

// Import the ProfileSchema we created above
import { ProfileSettingsSchema } from "@/lib/utils/schemas";
import { User} from "@/lib/actions/user";
import {useTheme} from "next-themes";
import {ImageUploader} from "@/components/image/image-upload";
import AvatarImageForm from "@/components/image/image-form";
import showErrorMessage from "@/components/toast/toast-error";
import {useSession} from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import {SessionValidationResult} from "@/lib/actions/session";
import {useTranslations} from "next-intl";
import { logger } from '@/lib/logger';

interface ProfileSettingCardProps {
    className?: string;
}

const ProfileSetting = React.forwardRef<HTMLDivElement, ProfileSettingCardProps>(
    ({ className, ...props }, ref) => {
        const t = useTranslations("app/(return_page)/settings/components/profile-setting");

        const { session, setSession, registerSaveHandler, setSaveOpen, isLoading } = useSession();

        const { user } = session;

        if (!user || !session ) {
            return NotFound();
        }

        const {theme} = useTheme();

        const [avatarEdit, setAvatarEdit] = useState(false);
        const [file, setFile] = useState<File | undefined>();
        const [formIsDirty, setFormIsDirty] = useState(false);

        // Initialize the form using the ProfileSchema with default values from props
        const form = useForm<z.infer<typeof ProfileSettingsSchema>>({
            resolver: zodResolver(ProfileSettingsSchema),
            defaultValues: {
                role: user.role,
                name: user.username,
                birth: user.birth || "",
                sex: user.sex || "",
                push_note: user.push_note || false,
                email_note: user.email_note || false,
                phone_note: user.phone_note || false,
            },
        });

        // Track form changes
        useEffect(() => {
            const subscription = form.watch((value, { name, type }) => {
                if (name && type) {
                    // Check if any value has changed
                    const isDirty = 
                        user.username !== value.name ||
                        user.birth !== value.birth ||
                        user.sex !== value.sex ||
                        user.push_note !== value.push_note ||
                        user.email_note !== value.email_note ||
                        user.phone_note !== value.phone_note;
                        
                    if (isDirty && !formIsDirty) {
                        logger.debug('profileSetting', 'form changed, enabling save button');
                        setFormIsDirty(true);
                        setSaveOpen(true);
                    } else if (!isDirty && formIsDirty) {
                        setFormIsDirty(false);
                        setSaveOpen(false);
                    }
                }
            });
            
            return () => subscription.unsubscribe();
        }, [form, user, formIsDirty, setSaveOpen]);

        // Register save handler
        useEffect(() => {
            const handleSaveProfile = async () => {
                logger.debug('profileSetting', 'save handler called', { formIsDirty });
                if (!formIsDirty) {
                    logger.debug('profileSetting', 'no changes to save');
                    return true;
                }
                
                try {
                    const formData = form.getValues();
                    
                    logger.debug('profileSetting', 'saving profile changes', { formData });
                    const result = await updateProfile(formData);

                    if (result?.success) {
                        addToast({
                            title: t("profileUpdated"),
                            description: t("profileHasUpdated"),
                            color: "success",
                            shouldShowTimeoutProgress: true,
                            timeout: 2000,
                        });

                        setSession((prevSession): SessionValidationResult => {
                            if (!prevSession) return prevSession;

                            if (prevSession.user) {
                                return {
                                    ...prevSession,
                                    user: {
                                        ...prevSession.user,
                                        username: formData.name,
                                        birth: formData.birth,
                                        sex: formData.sex,
                                        push_note: formData.push_note,
                                        email_note: formData.email_note,
                                        phone_note: formData.phone_note,
                                    } as User
                                }
                            }

                            return prevSession;
                        });
                        
                        setFormIsDirty(false);
                        return true;
                    } else if (result?.error) {
                        logger.error('profileSetting', 'error saving profile', { error: result.error });
                        showErrorMessage({error: result.error});
                        return false;
                    }
                    
                    return false;
                } catch (error) {
                    logger.error('profileSetting', 'exception while saving profile', { error });
                    return false;
                }
            };
            
            logger.debug('profileSetting', 'registering save handler');
            registerSaveHandler('profile-setting', handleSaveProfile);
            
            // No need to unregister as the session provider will handle this on pathname change
        }, [registerSaveHandler, form, formIsDirty, t, setSession]);

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
                                    username: formData.name,
                                    birth: formData.birth,
                                    sex: formData.sex,
                                    push_note: formData.push_note,
                                    email_note: formData.email_note,
                                    phone_note: formData.phone_note,
                                } as User
                            }
                        }

                        return prevSession;
                    });
                    
                    setFormIsDirty(false);

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
                                                isDisabled={isPending || isLoading}
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
                        
                        {/* Date of birth */}
                        <div className="mt-4">
                            <p className="text-base font-medium text-default-700">
                                {t("dateOfBirth") || "Date of birth"}
                            </p>
                            <FormField
                                control={form.control}
                                name="birth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <DatePicker
                                                isDisabled={isPending || isLoading}
                                                className="mt-2 w-full"
                                                // @ts-ignore
                                                value={field.value ? new CalendarDate(
                                                    new Date(field.value).getFullYear(),
                                                    new Date(field.value).getMonth() + 1,
                                                    new Date(field.value).getDate()
                                                ) : null}
                                                // @ts-ignore
                                                maxValue={new CalendarDate(
                                                    new Date().getFullYear() - 18,
                                                    new Date().getMonth() + 1,
                                                    new Date().getDate()
                                                )}
                                                onChange={(date) => {
                                                    if (date) {
                                                        // Convert from CalendarDate to ISO string format
                                                        const jsDate = new Date(date.year, date.month - 1, date.day + 1);
                                                        const formattedDate = jsDate.toISOString().split('T')[0];
                                                        field.onChange(formattedDate);
                                                    } else {
                                                        field.onChange("");
                                                    }
                                                }}
                                                placeholder={t("selectDate") || "Select date"}
                                                variant="flat"
                                                color="default"
                                                showMonthAndYearPickers
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        {/* Sex/Gender */}
                        <div className="mt-4">
                            <p className="text-base font-medium text-default-700">
                                {t("gender") || "Gender"}
                            </p>
                            <FormField
                                control={form.control}
                                name="sex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Select
                                                {...field}
                                                defaultSelectedKeys={field.value ? [field.value] : []}
                                                selectedKeys={field.value ? [field.value] : []}
                                                isDisabled={isPending || isLoading}
                                                placeholder={t("selectSex") || "Select gender"}
                                                className="mt-2"
                                            >
                                                <SelectItem key="male">
                                                    {t("male") || "Male"}
                                                </SelectItem>
                                                <SelectItem key="female">
                                                    {t("female") || "Female"}
                                                </SelectItem>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        {/* Ads and Promos */}
                        <div className="mt-6">
                            <p className="text-base font-medium text-default-700 mb-3">
                                {t("adsAndPromos") || "Ads and promos"}
                            </p>
                            
                            {/* Email notifications */}
                            <FormField
                                control={form.control}
                                name="email_note"
                                render={({ field }) => (
                                    <FormItem className="flex justify-between items-center my-4 py-2 border-b">
                                        <FormLabel className="cursor-pointer">{t("email") || "Email"}</FormLabel>
                                        <FormControl>
                                            <Switch
                                                isSelected={field.value}
                                                onValueChange={field.onChange}
                                                isDisabled={isPending || isLoading}
                                                color="warning"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            {/* SMS notifications */}
                            <FormField
                                control={form.control}
                                name="phone_note"
                                render={({ field }) => (
                                    <FormItem className="flex justify-between items-center my-4 py-2 border-b">
                                        <FormLabel className="cursor-pointer">{t("smsWithDiscounts") || "SMS with discounts and promo codes"}</FormLabel>
                                        <FormControl>
                                            <Switch
                                                isSelected={field.value}
                                                onValueChange={field.onChange}
                                                isDisabled={isPending || isLoading}
                                                color="warning"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            
                            {/* Push notifications */}
                            <FormField
                                control={form.control}
                                name="push_note"
                                render={({ field }) => (
                                    <FormItem className="flex justify-between items-center my-4 py-2 border-b">
                                        <div>
                                            <FormLabel className="cursor-pointer">{t("pushNotifications") || "Push notifications with discounts and promo codes"}</FormLabel>
                                            <p className="text-xs text-default-500 mt-1">
                                                {t("pushNotificationsNote") || "We will turn off the marketing push, and we will continue to send the order statuses"}
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                isSelected={field.value}
                                                onValueChange={field.onChange}
                                                isDisabled={isPending || isLoading}
                                                color="warning"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </div>
        );
    },
);

ProfileSetting.displayName = "ProfileSetting";

export default ProfileSetting;
