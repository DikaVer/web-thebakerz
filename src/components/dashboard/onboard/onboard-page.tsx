'use client';

import React, { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Card,
    CardBody,
    Input,
    Textarea,
    Button,
    cn,
    Avatar,
    Spacer,
    Link,
    Badge,
    addToast,
    NumberInput
} from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile-actions";
import { Icon } from "@iconify/react";

// Import the OnboardSchema and User type
import { OnboardSchema } from "@/lib/dashboard/schemas";
import { User } from "@/lib/actions/user";
import {onboardBakerz} from "@/lib/dashboard/onboard-dash";
import showErrorMessage from "@/components/toast/toast-error";
import {useRouter} from "next/navigation";

interface ProfileSettingCardProps {
    className?: string;
    user: User;
}

const OnboardPage = React.forwardRef<HTMLDivElement, ProfileSettingCardProps>(
    ({ user, className, ...props }, ref) => {
        const router = useRouter();

        // Initialize the form with default values for every input in the schema.
        const form = useForm<z.infer<typeof OnboardSchema>>({
            resolver: zodResolver(OnboardSchema),
            defaultValues: {
                name: user.username,
                stripeAccountId: "",
                phoneNumber: "",
                route: "",
                country: "",
                city: "",
                latitude: undefined,
                longitude: undefined,
                zip_code: "",
            },
        });

        // useActionState similar to your ContactUs example – it will call our updateProfile action.
        const [state, submitAction, isPending] = useActionState(
            async (previousState: any, formData: z.infer<typeof OnboardSchema>) => {


                const result = await onboardBakerz(formData, user.id);

                if (result?.success) {
                  addToast({
                    title: "Profile Updated",
                    description: result.success,
                    color: "success",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                  });
                  router.push("/dashboard/users");
                  router.refresh();
                } else if (result?.error) {
                  showErrorMessage({ error: result.error });
                }
            },
            null
        );

        // Handle the form submission with startTransition
        const handleSubmit = (formData: z.infer<typeof OnboardSchema>) => {
            startTransition(() => {
                submitAction(formData);
            });
        };

        return (
            <div ref={ref} className={cn(className)} {...props}>
                {/* Profile Section */}
                <div>
                    <p className="text-base font-medium text-default-700">Onboarding Bakerz Process</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        This displays onboarding process for Bakerz.
                    </p>
                    <Card className="mt-4 bg-default-100" shadow="none">
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    key={user.picture} // changing key forces re-mount
                                    src={user.picture}
                                    className="h-16 w-16 text-xl"
                                    name={user.username}
                                    isBordered
                                    color="secondary"
                                    classNames={{ base: "bg-default text-text shadow-lg" }}
                                />
                                <div>
                                    <p className="text-sm font-medium text-default-500">{user.username}</p>
                                    <p className="text-xs text-default-400">Customer</p>
                                    <p className="mt-1 text-xs text-default-400">{user.email}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
                <Spacer y={4} />
                {/* Form Section */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-y-4">
                        {/* Name Field */}
                        <div>
                            <p className="text-base font-medium text-default-700">Store Name</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Edit Store Name</p>
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
                                                className="mt-2"
                                                placeholder={user?.username}
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Stripe Account ID Field */}
                        <div>
                            <p className="text-base font-medium text-default-700">Stripe Id</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Onboard Bakerz on Stripe.</p>
                            <FormField
                                control={form.control}
                                name="stripeAccountId"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                className="mt-2"
                                                placeholder="Stripe Account Id"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Phone Number Field */}
                        <div>
                            <p className="text-base font-medium text-default-700">Phone Number</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Enter store phone number.</p>
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                className="mt-2"
                                                placeholder="Phone Number"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Route Field */}
                        <div>
                            <p className="text-base font-medium text-default-700">Location</p>
                            <FormField
                                control={form.control}
                                name="route"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                label={'Route'}
                                                className="mt-2"
                                                placeholder="Route"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Country Field */}
                        <div>
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                label={'Country'}
                                                className="mt-2"
                                                placeholder="Country"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* City Field */}
                        <div>

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                label={'City'}
                                                className="mt-2"
                                                placeholder="City"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Latitude Field */}
                        <div className="flex gap-x-4">

                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <NumberInput
                                                {...field}
                                                isDisabled={isPending}
                                                label={'Latitude'}
                                                className="mt-2"
                                                placeholder="Latitude"
                                                onChange={(value) => {
                                                    //@ts-ignore
                                                    field.onChange(parseFloat(value.target.value));
                                                }}
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                        {/* Longitude Field */}

                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <NumberInput
                                                {...field}
                                                isDisabled={isPending}
                                                label={'Longitude'}
                                                className="mt-2"
                                                placeholder="Longitude"
                                                onChange={(value) => {
                                                    //@ts-ignore
                                                    field.onChange(parseFloat(value.target.value));
                                                }}
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Zip Code Field */}
                        <div>
                            <FormField
                                control={form.control}
                                name="zip_code"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                label={'Zip Code'}
                                                className="mt-2"
                                                placeholder="Zip Code"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {/* Onboard Button can be added here */}
                        <div className="flex flex-row-reverse w-full">
                            <Button
                                startContent={!isPending && <Icon icon="solar:settings-broken" width={24} />}
                                className="mt-4 text-black shadow"
                                color="secondary"
                                type="submit"
                                isDisabled={isPending}
                                isLoading={isPending}
                            >
                                {isPending ? "Updating..." : "Onboard Bakerz"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        );
    }
);

OnboardPage.displayName = "ProfileSetting";

export default OnboardPage;
