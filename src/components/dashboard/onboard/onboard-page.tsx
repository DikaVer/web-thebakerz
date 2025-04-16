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
    NumberInput,
    Switch,
    Select,
    SelectItem
} from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useActionState } from "react";
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
                // Store settings
                app_fee: 8,
                delivery_fee: 20,
                region: "NL",
                currency: "EUR",
                // Business information fields
                businessName: "",
                vat: "",
                kvk: "",
                bankAccount: "",
                businessRoute: "",
                businessCity: "",
                businessZipCode: "",
                businessCountry: "",
                regionBusiness: "NL",
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
                                                isRequired
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
                                                isRequired
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
                                                isRequired
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
                                                isRequired
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
                                                isRequired
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
                                                isRequired
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
                                                isRequired
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
                        {/* Store Settings Section */}
                        <div>
                            <p className="text-base font-medium text-default-700 mt-6">Store Settings</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Configure store payment and regional settings</p>
                            
                            <div className="flex gap-x-4 mt-4">
                                {/* App Fee Field */}
                                <FormField
                                    control={form.control}
                                    name="app_fee"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <NumberInput
                                                    {...field}
                                                    isDisabled={isPending}
                                                    label="App Fee (%)"
                                                    className="mt-2"
                                                    placeholder="App Fee"
                                                    endContent={<div className="pointer-events-none flex items-center"><span>%</span></div>}
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

                                {/* Delivery Fee Field */}
                                <FormField
                                    control={form.control}
                                    name="delivery_fee"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <NumberInput
                                                    {...field}
                                                    isDisabled={isPending}
                                                    label="Delivery Fee (%)"
                                                    className="mt-2"
                                                    placeholder="Delivery Fee"
                                                    endContent={<div className="pointer-events-none flex items-center"><span>%</span></div>}
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

                            <div className="flex gap-x-4 mt-2">
                                {/* Region Field */}
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Select
                                                    isDisabled={isPending}
                                                    isRequired
                                                    label="Region"
                                                    className="mt-2"
                                                    placeholder="Select Region"
                                                    selectedKeys={[field.value]}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                >
                                                    <SelectItem key="NL">Netherlands (NL)</SelectItem>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Currency Field */}
                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Select
                                                    isDisabled={isPending}
                                                    isRequired
                                                    label="Currency"
                                                    className="mt-2"
                                                    placeholder="Select Currency"
                                                    selectedKeys={[field.value]}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                >
                                                    <SelectItem key="EUR">Euro (EUR)</SelectItem>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        {/* Business Information Section */}
                        <div>
                            <p className="text-base font-medium text-default-700 mt-6">Business Information</p>
                            <p className="mt-1 text-sm font-normal text-default-400">Enter business details for invoicing</p>

                            {/* KOR switch field */}
                            <FormField
                                control={form.control}
                                name="kor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <label className="inline-flex items-center mt-4">
                                                <Switch
                                                    defaultSelected={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                                <span className="ml-2 text-sm font-medium">KOR</span>
                                            </label>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {/* Business Name Field */}
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="Business Name"
                                                className="mt-2"
                                                placeholder="Legal Business Name"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* VAT Number Field */}
                            <FormField
                                control={form.control}
                                name="vat"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="VAT Number"
                                                className="mt-2"
                                                placeholder="VAT Registration Number"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* KVK Number Field */}
                            <FormField
                                control={form.control}
                                name="kvk"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="KVK Number"
                                                className="mt-2"
                                                placeholder="Chamber of Commerce Number"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Bank Account Field */}
                            <FormField
                                control={form.control}
                                name="bankAccount"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="Bank Account"
                                                className="mt-2"
                                                placeholder="IBAN or Bank Account Number"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <p className="text-base font-medium text-default-700 mt-4">Business Address</p>

                            {/* Business Route Field */}
                            <FormField
                                control={form.control}
                                name="businessRoute"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="Address"
                                                className="mt-2"
                                                placeholder="Street Address"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Business City Field */}
                            <FormField
                                control={form.control}
                                name="businessCity"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isDisabled={isPending}
                                                isRequired
                                                label="City"
                                                className="mt-2"
                                                placeholder="City"
                                                type="text"
                                                validate={() => fieldState.error?.message}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-x-4">
                                {/* Business Zip Code Field */}
                                <FormField
                                    control={form.control}
                                    name="businessZipCode"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    isDisabled={isPending}
                                                    isRequired
                                                    label="Postal Code"
                                                    className="mt-2"
                                                    placeholder="Postal/Zip Code"
                                                    type="text"
                                                    validate={() => fieldState.error?.message}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Business Country Field */}
                                <FormField
                                    control={form.control}
                                    name="businessCountry"
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    isDisabled={isPending}
                                                    isRequired
                                                    label="Country"
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

                            {/* Business Region Field */}
                            <FormField
                                control={form.control}
                                name="regionBusiness"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Select
                                                isDisabled={isPending}
                                                isRequired
                                                label="Business Region"
                                                className="mt-2"
                                                placeholder="Select Business Region"
                                                selectedKeys={[field.value]}
                                                onChange={(e) => field.onChange(e.target.value)}
                                            >
                                                <SelectItem key="NL">Netherlands (NL)</SelectItem>
                                            </Select>
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

OnboardPage.displayName = "OnboardPage";

export default OnboardPage;
