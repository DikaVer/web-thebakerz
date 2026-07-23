/**
 * @fileoverview Contact form for the support contact-us page.
 *
 * Exports ContactUsComponent, a react-hook-form form validated with the Zod
 * ContactSchema (email, subject, message with a character counter) that
 * submits through the sendEmail server action via useActionState. On success
 * it renders a SuccessRedirect back to the home page; errors are shown with
 * FormError.
 */
'use client';

import React, { startTransition } from 'react';
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ContactSchema } from "@/lib/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardBody, Input, Textarea } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormError } from "@/components/authentication/form-error";
import SuccessRedirect from "@/components/redirect-page";
import { sendEmail } from "@/lib/actions/emails/email-action";
import { useTranslations } from "next-intl";

export default function ContactUsComponent() {
    const [charCount, setCharCount] = React.useState(0);
    const t = useTranslations("app/(support)/components/contact-us");

    const form = useForm<z.infer<typeof ContactSchema>>({
        resolver: zodResolver(ContactSchema),
        defaultValues: {
            email: "",
            subject: "",
            context: ""
        }
    });

    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof ContactSchema>) => {
            const state = await sendEmail(formData);
            if (state) {
                return state;
            }
            return state;
        },
        null,
    );

    const handleSubmit = (formData: z.infer<typeof ContactSchema>) => {
        startTransition(() => {
            submitAction(formData);
        });
    };

    if (state?.success) {
        return (
            <SuccessRedirect
                redirectPage="/"
                text={t("successMessage")}
            />
        );
    }

    return (
        <>
            <Card shadow="none" className={'w-full max-w-xl bg-gradient-card'}>
                <CardBody className={'w-full max-w-xl'}>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className={'grid gap-y-4'}
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isRequired
                                                label={t("emailLabel")}
                                                placeholder={t("emailPlaceholder")}
                                                type="email"
                                                validate={() => {
                                                    return fieldState.error?.message;
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                isRequired
                                                label={t("subjectLabel")}
                                                placeholder={t("subjectPlaceholder")}
                                                type="text"
                                                validate={() => {
                                                    return fieldState.error?.message;
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="context"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                isRequired
                                                label={t("contextLabel")}
                                                placeholder={t("contextPlaceholder")}
                                                style={{resize: "none"}}
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
                                        <p className="text-right text-grayText text-small px-2">
                                            {charCount}/2000
                                        </p>
                                    </FormItem>
                                )}
                            />
                            <FormError message={state?.error || undefined}/>
                            <Button
                                aria-label="Submit"
                                type="submit"
                                className={'w-full rounded-xl bg-gradient-primary'}
                                isLoading={isPending}
                                disabled={isPending}
                            >
                                {isPending ? t("buttonSending") : t("buttonSubmit")}
                            </Button>
                        </form>
                    </Form>
                </CardBody>
            </Card>
        </>
    );
}