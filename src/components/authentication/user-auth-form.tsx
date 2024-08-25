'use client';

import * as React from "react"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image";

import { useForm} from "react-hook-form";
import { zodResolver} from "@hookform/resolvers/zod";

import {LoginSchema} from "@/lib/schemas";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {FormError} from "@/components/authentication/form-error";
import {login} from "@/lib/actions/login";
import {useState, useTransition} from "react";
import {FormSuccess} from "@/components/authentication/form-success";




interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const getNextParam = (url: URL): string | undefined => {
    const nextParam = url.searchParams.get('next');
    return nextParam ? nextParam : "/";
};


export function UserAuthForm({
                                 searchParams,
                             }: {
                                searchParams?: {
                                    query?: string;
                                    page?: string;
                                };
}){

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>()
    const [isPending, startTransition] = useTransition();

    let nextParam: string | undefined = '/';
    if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        nextParam = getNextParam(url)
    }

    const form = useForm<z.infer<typeof  LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            prev_link: nextParam
        }
    });

    const onSubmit = (formData: z.infer<typeof LoginSchema>) => {
        console.log(formData);

        startTransition(() => {
            login(formData)
                .then((data) => {
                    setError(data.error);
                    setSuccess(data.success);
                })
        });
    }

  return (
    <div className={"grid gap-6"}>
        <Form {...form}>
            <form
                // action={async (formData) => {
                //   "use server"
                //   await signIn("sendgrid", formData)
                // }}
                onSubmit={form.handleSubmit(onSubmit)}
                className={"grid gap-2"}
            >
                <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className={"sr-only"}>
                            Email
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                disabled={isPending}
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <FormSuccess message={success}/>
                <FormError message={error}/>
                <Button
                    type="submit"
                    disabled={isPending}
                >
                    Continue with Email
                </Button>
            </form>
        </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"/>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
        <div className="flex flex-row justify-between items-center mx-10 -my-1">
            <form
                // action={async () => {
                //     "use server"
                //     await signIn("google")
                // }}
            >
                <button
                    type="submit"
                    className={""}
                    disabled={isPending}
                >
                    <Image
                        style={{display: "block"}}
                        src="https://authjs.dev/img/providers/google.svg"
                        height="32"
                        width="32"
                        alt={"Google"}/>
                </button>
            </form>
            <form
                // action={async () => {
                //     "use server"
                //     await signIn("instagram")
                // }}
            >
                <button
                    type="submit"
                    className={""}
                    disabled={isPending}
                >
                    <Image
                        style={{display: "block"}}
                        src="https://authjs.dev/img/providers/instagram.svg"
                        height="32"
                        width="32"
                        alt={"Instagram"}/>
                </button>
            </form>
            <form
                // action={async () => {
                //     "use server"
                //     await signIn("facebook")
                // }}
            >
                <button
                    type="submit"
                    className={""}
                    disabled={isPending}
                >
                    <Image
                        style={{display: "block"}}
                        src="https://authjs.dev/img/providers/facebook.svg"
                        height="32"
                        width="32"
                        alt={"Instagram"}/>
                </button>
            </form>
        </div>
    </div>
  )
}
