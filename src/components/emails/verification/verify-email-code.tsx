"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup, InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {pacifico} from "@/components/fonts";

interface VerifyCodeProps {
    setOTPcode: (code: string) => void;
    setOTPWindow: (state: boolean) => void;
    error?: string;
}

const FormSchema = z.object({
    pin: z
        .string()
        .min(6, {
            message: "Your one-time password must be 6 digits.",
        })
        .max(6, {
            message: "Your one-time password must be 6 digits.",
        }),
});

export default function VerifyCode({
                                       setOTPcode,
                                       setOTPWindow,
                                       error,
                                   }: VerifyCodeProps) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setOTPcode(data.pin);
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center p-8 bg-white shadow-lg rounded-md w-full max-w-md scale-125">
                <div className={`flex flex-col text-2xl font-bold text-center w-full ${pacifico.className} mb-6`}>
                    <p>
                        Sweet creations are almost here!
                    </p>
                    <p className={`text-sm`}>
                        Just Verify Your Email
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>One-Time Code</FormLabel>
                                    <FormControl>
                                        <InputOTP
                                            maxLength={6}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >

                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormDescription>
                                        Please enter the one-time code sent to your e-mail.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between items-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOTPWindow(false)}
                                className="px-4 py-2"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="px-4 py-2"
                            >
                                Proceed Payment
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
