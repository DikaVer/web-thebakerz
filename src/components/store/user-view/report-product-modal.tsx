'use client';

import React, { startTransition } from 'react';
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormError } from "@/components/authentication/form-error";
import { useTranslations } from "next-intl";
import { useSession } from "@/components/providers/session-provider";
import { sendEmail } from "@/lib/actions/auth/email-action";
import clarity from '@microsoft/clarity';
const ReportProductSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    description: z.string().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
});

interface ReportProductModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    productName: string;
    storeName: string;
    productId: string;
}

export function ReportProductModal({ isOpen, onOpenChange, productName, storeName, productId }: ReportProductModalProps) {
    const [charCount, setCharCount] = React.useState(0);
    const t = useTranslations("app/(store)/components/report-product");
    const { session } = useSession();

    const form = useForm<z.infer<typeof ReportProductSchema>>({
        resolver: zodResolver(ReportProductSchema),
        defaultValues: {
            subject: "",
            description: ""
        }
    });

    const [state, submitAction, isPending] = useActionState(
        async (previousState: any, formData: z.infer<typeof ReportProductSchema>) => {
            const emailData = {
                email: session?.user?.email || "",
                subject: `Product Report: ${formData.subject}`,
                context: `Store: ${storeName}\nProduct: ${productName} (ID: ${productId})\n\nReport Details:\n${formData.description}`
            };
            const state = await sendEmail(emailData);
            if (state) {
                return state;
            }
            return state;
        },
        null,
    );

    const handleSubmit = (formData: z.infer<typeof ReportProductSchema>) => {
        clarity.event("product_report")
        startTransition(() => {
            submitAction(formData);
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            backdrop="blur"
            placement="center"
        >
            <ModalContent>
                <ModalHeader>{t("reportProduct")}</ModalHeader>
                <ModalBody>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className={'grid gap-y-4'}
                        >
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
                                name="description"
                                render={({field, fieldState}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                isRequired
                                                label={t("descriptionLabel")}
                                                placeholder={t("descriptionPlaceholder")}
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
                        </form>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={onOpenChange}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        color="primary"
                        className="bg-gradient-primary"
                        onPress={() => {
                            form.handleSubmit(handleSubmit)();
                        }}
                        isLoading={isPending}
                        disabled={isPending}
                    >
                        {isPending ? t("sending") : t("submit")}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 