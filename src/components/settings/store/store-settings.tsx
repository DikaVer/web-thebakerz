'use client';

import React, {startTransition, useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {Card, CardBody, Input, Textarea, Button, cn, Avatar, Spacer, Link, Badge, addToast} from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useActionState } from "react";
import { updateStore } from "@/lib/actions/store-actions";
import { Icon } from "@iconify/react";

// Import the StoreSchema
import { StoreSettingsSchema } from "@/lib/schemas/index";
import { useTheme } from "next-themes";
import { IconLocation, IconPhone } from "@/components/ui/icons";
import showErrorMessage from "@/components/toast/toast-error";
import { useSession } from "@/components/providers/session-provider";
import NotFound from "@/app/(error_layout)/not-found";
import { useTranslations } from "next-intl";
import { useStore } from "@/components/providers/store-provider";
import { useRouter } from "next/navigation";
import DeliveryOptions from "./delivery-options";

interface StoreSettingCardProps {
    className?: string;
}

const StoreSetting = React.forwardRef<HTMLDivElement, StoreSettingCardProps>(
    ({ className, ...props }, ref) => {

        const t = useTranslations("app/(return_page)/settings/components/store-setting");

        const { session } = useSession();
        const { store } = useStore();
        const router = useRouter();     

        const { user } = session;

        if (!user || !session || !store) {
            return NotFound();
        }

        const { theme } = useTheme();

        // Set up a character counter for the description field (max 200 characters)
        const [charCount, setCharCount] = useState(store?.description?.length || 0);

        // Initialize the form using the StoreSchema with default values from store
        const form = useForm<z.infer<typeof StoreSettingsSchema>>({
            resolver: zodResolver(StoreSettingsSchema),
            defaultValues: {
                role: user.role,
                storeName: store.storeName || undefined,
                storeSlug: store.slug || undefined,
                description: store.description || undefined,
                facebook_url: store.facebook_url || undefined,
                instagram_url: store.instagram_url || undefined,
            },
        });

        // useActionState to call our updateStore action
        const [state, submitAction, isPending] = useActionState(
            async (previousState: any, formData: z.infer<typeof StoreSettingsSchema>) => {
                const result = await updateStore(formData, store.id);

                if (result?.success) {
                    addToast({
                        title: t("storeUpdated"),
                        color: "success",
                        shouldShowTimeoutProgress: true,
                        timeout: 2000,
                    });
                    router.push(`/${store.id}/settings`);

                    // Update local store state
                    // setStore({
                    //     ...store,
                    //     storeName: formData.storeName,
                    //     slug: formData.storeSlug,
                    //     description: formData.description,
                    //     facebook_url: formData.facebook_url,
                    //     instagram_url: formData.instagram_url,
                    // });

                } else if (result?.error) {
                    showErrorMessage({error: result.error});
                }
            },
            null
        );

        // Handle the form submission with startTransition
        const handleSubmit = (formData: z.infer<typeof StoreSettingsSchema>) => {
            startTransition(() => {
                submitAction(formData);
            });
        };

        return (
            <div ref={ref} className={cn( className)} {...props}>
                {/* Delivery Options */}
                <DeliveryOptions className="mb-6" />
                
                <Spacer y={4} />
                {/* Title */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className={'grid gap-y-1'}
                    >
                        <div>
                            {/* Store link */}
                            <p className="text-base font-medium text-default-700">{t("storeLink")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">{t("howUserFindYou")}</p>
                            <FormField
                                control={form.control}
                                name="storeName"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                className={'mt-2'}
                                                placeholder={t("typeYourStoreName")}
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
                            {/* Store Slug */}
                            <p className="text-base font-medium text-default-700">{t("storeSlug")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">{t("howUserRecognizeYou")}</p>
                            <FormField
                                control={form.control}
                                name="storeSlug"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                className={'mt-2'}
                                                placeholder={t("typeYourStoreSlug")}
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
                        {/* Location & Phone Number */}
                        <div>
                            <p className="text-base font-medium text-default-700">{t("locationPhone")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">{t("editLocationPhoneBy")}{" "}
                                <Link
                                    className={'text-grayText underline'}
                                    href="/support/contact-us"
                                    size="sm"
                                    underline="hover">
                                    {t("contactUs")}
                                </Link>
                            </p>
                            <Spacer y={2}/>
                            <Input
                                isDisabled
                                className={'mt-2 opacity-100'}
                                labelPlacement="outside"
                                placeholder={store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : t("locationPlaceholder")}
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
                                placeholder={`${store?.phone ? store.phone : t("phoneNumberPlaceholder")}`}
                                startContent={
                                    <IconPhone size={24}
                                                primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                    />
                                }

                            />
                        </div>
                        <Spacer y={2}/>

                        {/* Facebook URL */}
                        <div>
                            <p className="text-base font-medium text-default-700">{t("facebookURL")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">{t("enterFacebookURL")}</p>
                            <FormField
                                control={form.control}
                                name="facebook_url"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                className="mt-2"
                                                placeholder={t("facebookURLPlaceholder")}
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Spacer y={2} />

                        {/* Instagram URL */}
                        <div>
                            <p className="text-base font-medium text-default-700">{t("instagramURL")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">{t("enterInstagramURL")}</p>
                            <FormField
                                control={form.control}
                                name="instagram_url"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                className="mt-2"
                                                placeholder={t("instagramURLPlaceholder")}
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Spacer y={2} />
                        {/* Description */}
                        <div>
                            <p className="text-base font-medium text-default-700">{t("description")}</p>
                            <p className="mt-1 text-sm font-normal text-default-400">
                                {t("writeAboutStore")}
                            </p>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                isDisabled={isPending}
                                                placeholder={t("storeDescriptionPlaceholder")}
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
                            <p className="text-right text-grayText text-small px-2">{charCount}/200</p>
                        </div>
                          
                        <div className={`flex flex-row-reverse w-full`}>
                            <Button
                                startContent={!isPending && <Icon icon="solar:settings-broken" width={24}/>}
                                className="mt-4 text-black shadow"
                                color={'secondary'}
                                type={'submit'}
                                isDisabled={isPending}
                                isLoading={isPending}
                            >
                                {
                                    isPending ? t('updating') : t('updateStore')
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        );
    },
);

StoreSetting.displayName = "StoreSetting";

export default StoreSetting;
