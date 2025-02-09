'use client';

import React, { startTransition} from 'react';

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ContactSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {Card, CardBody, Input, Textarea} from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import { FormError } from "@/components/authentication/form-error";
import { sendEmail } from "@/lib/actions/email-action";
import SuccessRedirect from "@/components/redirect-page";

export default function ContactUsComponent() {

    const [charCount, setCharCount] = React.useState(0);

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

                return state; // result should contain something like { successful: boolean, error?: string }
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
                text="Your ticket was submitted successfully. We will redirect you to main page automatically in:"
            />
        );
    }

    return (
        <Card className={'w-full max-w-xl bg-gradient-card'}>
            <CardBody className={'w-full max-w-xl'}>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className={'grid gap-y-4'}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field, fieldState}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            isRequired
                                            label="Email"
                                            placeholder="Enter your email"
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
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            isRequired
                                            label="Subject"
                                            placeholder="Enter your subject"
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
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            isRequired
                                            label="What problem are you facing?"
                                            placeholder="Help me with..."
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
                                    <p className="text-right text-grayText text-small px-2">{charCount}/2000</p>
                                </FormItem>
                            )}
                        />
                        <FormError message={state?.error || undefined} />
                        <Button
                            type="submit"
                            className={'w-full rounded-xl bg-gradient-primary'}
                            isLoading={isPending}
                            disabled={isPending}
                        >
                            {
                                isPending ? "Sending..." : "Submit ticket"
                            }
                        </Button>
                    </form>
                </Form>
            </CardBody>
        </Card>
    );
}
