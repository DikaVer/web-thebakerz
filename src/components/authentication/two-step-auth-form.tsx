"use client";

import React, {useState, startTransition, useActionState, useRef, useEffect} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem} from "@/components/ui/form";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import {Divider, InputOtp, Spacer, Tooltip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";
import {IconMail} from "@/components/ui/icons";
import Link from "next/link";
import {loginAction, resendEmailVerificationCodeAction, verifyEmailAction} from "@/app/(auth)/auth/actions";
import {EmailSchema, OTPSchema} from "@/lib/schemas";
import showErrorMessage from "@/components/toast/toast-error";
import {useSession} from "@/components/providers/session-provider";
import type {SessionValidationResult} from "@/lib/actions/session";



export default function TwoStepAuthForm({ setIsLogin, handleNext }: { setIsLogin?: (value: boolean) => void, handleNext?: () => void }) {

    const nextParams = useSearchParams();
    const next = nextParams.get('next') as string;
    const { setSession } = useSession();

    const inputRef = useRef(null);

    useEffect(() => {
        // @ts-ignore
        inputRef.current.focus(); // Focus the input on component mount
    }, [])

    // States for "Resend Code" button
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const pathname = usePathname();

    // Start a countdown timer whenever resendCooldown > 0.
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [resendCooldown]);


    const router = useRouter();

    // Page and animation state
    const [page, setPage] = useState(0);
    const [direction, setDirection] = useState(0);
    const [email, setEmail] = useState(""); // Store email from step 1

    // Form instance for email submission
    const formEmail = useForm<z.infer<typeof EmailSchema>>({
        resolver: zodResolver(EmailSchema),
        defaultValues: { email: "" },
    });

    // Form instance for OTP verification
    const formOTP = useForm<z.infer<typeof OTPSchema>>({
        resolver: zodResolver(OTPSchema),
        defaultValues: { otp: "" },
    });

    const [stateEmail, submitActionEmail, isPendingEmail] = useActionState(
        async (previousState: any, formData: z.infer<typeof EmailSchema>) => {
            const state = await loginAction(previousState, formData);

            if (state === null) {
                setEmail(formData.email);
                setPage(1);
                setDirection(1);
                formOTP.setValue("email", formData.email);
            } else {
                showErrorMessage({error: state?.message})

            }
        },
        null,
    );

    const [stateOTP, submitActionOTP, isPendingOTP] = useActionState(
        async (previousState: any, formData: z.infer<typeof OTPSchema>) => {
            const state = await verifyEmailAction(previousState, formData);

            if ((state as SessionValidationResult) !== undefined) {
                if (!setIsLogin) {
                    router.refresh();
                    router.push(`/transit-login?next=${next ? next : "/"}`);
                } else {
                    router.refresh();
                    setIsLogin(true);
                }
                console.log(state);
                setSession(() => state as SessionValidationResult);
            } else {
                //@ts-ignore
                showErrorMessage({error: state?.message})
            }

        },
        null,
    );

    const handleSubmitEmail = (formData: z.infer<typeof EmailSchema>) => {
        startTransition(() => {
            submitActionEmail(formData);
        });
    };

    const handleSubmitOTP = (formData: z.infer<typeof OTPSchema>) => {
        startTransition(() => {
            submitActionOTP(formData);
        });
    };

    // Updated Handler for resending the OTP code with error handling.
    const handleResend = async () => {
        setIsResending(true);
        setResendMessage(null); // Clear previous message
        try {
            // Optionally simulate a 2-second delay:
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const result = await resendEmailVerificationCodeAction(email);
            // Check the returned message and update state accordingly.
            if (result === null) {
                setResendMessage("A new code was sent to your email.");
            } else {
                setResendMessage(result.message);
            }
        } catch (error) {
            setResendMessage("An unexpected error occurred.");
        }
        setIsResending(false);
        setResendCooldown(60); // Reset the cooldown timer to 60 seconds.
    };


    // Variants for page transition animations
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
            zIndex: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
            zIndex: 0,
        }),
    };

    return (
        <div className={`grid gap-6 w-full justify-center`}>

            <LazyMotion features={domAnimation}>
                <AnimatePresence custom={direction} initial={false} mode="wait">
                    <m.div
                        key={page}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        custom={direction}
                        variants={variants}
                        transition={{duration: 0.2}}
                        className="flex flex-col gap-y-8"
                    >
                        {page === 0 && (
                            <Form {...formEmail}>
                                <form onSubmit={formEmail.handleSubmit(handleSubmitEmail)}
                                      className="flex flex-col gap-y-4">
                                    <FormField
                                        control={formEmail.control}
                                        name="email"
                                        render={({field, fieldState}) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        ref={inputRef}
                                                        isRequired
                                                        endContent={
                                                            <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                        label="Email"
                                                        placeholder="you@thebakerz.com"
                                                        type="email"
                                                        disabled={isPendingEmail}
                                                        validate={() => {
                                                            return fieldState.error?.message;
                                                        }}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        fullWidth
                                        type="submit"
                                        endContent={<Icon icon="solar:arrow-right-broken" height={24}/>}
                                        isLoading={isPendingEmail}
                                    >
                                        Continue with Email
                                    </Button>
                                </form>
                            </Form>
                        )}
                        {page === 1 && (

                            <>
                                <Form {...formOTP}>
                                    <form onSubmit={formOTP.handleSubmit(handleSubmitOTP)}
                                          className="flex flex-col gap-y-4">
                                        <FormField
                                            control={formOTP.control}
                                            name="otp"
                                            render={({field, fieldState}) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div>
                                                            <InputOtp
                                                                {...field}
                                                                isRequired
                                                                label="OTP"
                                                                type={"number"}
                                                                classNames={{
                                                                    segmentWrapper: "gap-x-0",
                                                                    segment: [
                                                                        "relative",
                                                                        "h-14",
                                                                        "w-14",
                                                                        "border-y",
                                                                        "border-r",
                                                                        "first:rounded-l-md",
                                                                        "first:border-l",
                                                                        "last:rounded-r-md",
                                                                        "border-default-200",
                                                                        "data-[active=true]:border",
                                                                        "data-[active=true]:z-20",
                                                                        "data-[active=true]:ring-2",
                                                                        "data-[active=true]:ring-offset-2",
                                                                        "data-[active=true]:ring-offset-background",
                                                                        "data-[active=true]:ring-foreground",
                                                                    ],
                                                                    description: "text-default-600 font-medium",
                                                                }}
                                                                validationBehavior="native"
                                                                radius="none"
                                                                placeholder="Enter OTP"
                                                                validate={() => {

                                                                    return fieldState.error?.message;
                                                                }}
                                                                description={`Enter the 6 digit code sent to ${email}`}
                                                                length={6}
                                                            />
                                                        </div>

                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-between">
                                            {/* Back button to return to the email page */}

                                            <Tooltip content="Go back" delay={300}>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"

                                                    isDisabled={isPendingOTP}

                                                    onPress={() => {
                                                        formOTP.reset();
                                                        setPage(0);
                                                        setDirection(-1);
                                                    }}
                                                >
                                                    <Icon icon="solar:alt-arrow-left-linear" width={16}/>
                                                </Button>
                                            </Tooltip>
                                            <Button
                                                endContent={<Icon icon="solar:arrow-right-broken" height={24}/>}
                                                type="submit"
                                                isLoading={isPendingOTP}
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </>
                        )}
                    </m.div>
                </AnimatePresence>
            </LazyMotion>
            {
                page === 0 && (
                    <>
                        <div className="flex items-center gap-4">
                            <Divider className="flex-1 bg-grayText"/>
                            <span className="text-grayText">or continue with</span>
                            <Divider className="flex-1 bg-grayText"/>
                        </div>
                        <div className="flex flex-row w-full justify-between items-center -my-1">
                            <form
                                action={async () => {
                                    router.push(`/api/auth/google?${next ? `next=${next}` : `next=${pathname}`}`);
                                }}
                                className={"w-full"}
                            >
                                <Button
                                    type="submit"
                                    variant={"outline"}
                                    className={"w-full py-5"}
                                    disabled={isPendingEmail}
                                    isLoading={isPendingEmail}
                                >
                                    {!isPendingEmail && (
                                        <Image
                                            style={{display: "block"}}
                                            src="/brandIcons/google.svg"
                                            height="30"
                                            width="30"
                                            alt={"Google"}
                                        />
                                    )}
                                </Button>
                            </form>
                            {/*<form*/}

                            {/*>*/}
                            {/*    <button*/}
                            {/*        type="submit"*/}
                            {/*        className={""}*/}
                            {/*        disabled={isPending}*/}
                            {/*    >*/}
                            {/*        <Image*/}
                            {/*            style={{display: "block"}}*/}
                            {/*            src="https://authjs.dev/img/providers/instagram.svg"*/}
                            {/*            height="32"*/}
                            {/*            width="32"*/}
                            {/*            alt={"Instagram"}/>*/}
                            {/*    </button>*/}
                            {/*</form>*/}
                            {/*<form*/}
                            {/*    // action={async () => {*/}
                            {/*    //     "use server"*/}
                            {/*    //     await signIn("facebook")*/}
                            {/*    // }}*/}
                            {/*>*/}
                            {/*    <button*/}
                            {/*        type="submit"*/}
                            {/*        className={""}*/}
                            {/*        disabled={isPending}*/}
                            {/*    >*/}
                            {/*        <Image*/}
                            {/*            style={{display: "block"}}*/}
                            {/*            src="https://authjs.dev/img/providers/facebook.svg"*/}
                            {/*            height="32"*/}
                            {/*            width="32"*/}
                            {/*            alt={"Instagram"}/>*/}
                            {/*    </button>*/}
                            {/*</form>*/}
                        </div>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <Link
                                href="/terms"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                        {handleNext && (
                            <>
                                <Spacer y={1}/>
                                <Button
                                    variant={"outline"}
                                    className={"w-full py-5"}
                                    disabled={isPendingEmail}
                                    isLoading={isPendingEmail}
                                    onPress={handleNext}
                                >
                                    {!isPendingEmail && "Continue as a Guest"}
                                </Button>
                            </>
                        )}
                    </>
                )
            }
        </div>
    );
}
