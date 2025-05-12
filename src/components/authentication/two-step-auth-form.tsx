"use client";

import React, {useState, startTransition, useRef, useEffect, useActionState} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { Divider, InputOtp, Spacer, Tooltip, Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { IconMail } from "@/components/ui/icons";
import Link from "next/link";
import { loginAction, resendEmailVerificationCodeAction, verifyEmailAction } from "@/app/(auth)/auth/actions";
import { EmailSchema, OTPSchema } from "@/lib/schemas";
import showErrorMessage from "@/components/toast/toast-error";
import { useSession } from "@/components/providers/session-provider";
import type { SessionValidationResult } from "@/lib/actions/session";
import { useTranslations } from "next-intl";

export default function TwoStepAuthForm({ setIsLogin, handleNext, storeId }: { setIsLogin?: (value: boolean) => void, handleNext?: () => void, storeId?: string }) {
    const t = useTranslations("app/(auth)/components/two-step-auth-form");
    const nextParams = useSearchParams();
    const next = nextParams.get("next") as string;
    const sendVerification = nextParams.get("sendVerification") === "true";
    const { setSession } = useSession();
    const inputRef = useRef(null);

    useEffect(() => {
        // @ts-ignore
        inputRef.current.focus(); // Focus the input on component mount
    }, []);

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
            const state = await loginAction(previousState, formData, sendVerification);
            if (state === null) {
                setEmail(formData.email);
                setPage(1);
                setDirection(1);
                formOTP.setValue("email", formData.email);
            } else {
                showErrorMessage({ error: state?.message });
            }
        },
        null,
    );

    const [stateOTP, submitActionOTP, isPendingOTP] = useActionState(
        async (previousState: any, formData: z.infer<typeof OTPSchema>) => {
            const state = await verifyEmailAction(previousState, formData, storeId);
            if (state.session) {
                if (!setIsLogin) {
                    router.refresh();
                    router.push(`/transit-login?next=${next ? next : "/"}`);
                } else {
                    router.refresh();
                    setIsLogin(true);
                }
                setSession(() => state.session as SessionValidationResult);
            } else if (state.message) {
                showErrorMessage({ error: state.message });
            } else {
                showErrorMessage({ error: t("An unexpected error occurred") });
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
        setResendMessage(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const result = await resendEmailVerificationCodeAction(email);
            if (result === null) {
                setResendMessage(t("A new code was sent to your email"));
            } else {
                setResendMessage(result.message);
            }
        } catch (error) {
            setResendMessage(t("An unexpected error occurred"));
        }
        setIsResending(false);
        setResendCooldown(60);
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
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-y-8"
                    >
                        {page === 0 && (
                            <Form {...formEmail}>
                                <form onSubmit={formEmail.handleSubmit(handleSubmitEmail)} className="flex flex-col gap-y-4">
                                    <FormField
                                        control={formEmail.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        ref={inputRef}
                                                        isRequired
                                                        endContent={
                                                            <IconMail className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                        }
                                                        label={t("email")}
                                                        placeholder={t("emailPlaceholder")}
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
                                        endContent={<Icon icon="solar:arrow-right-broken" height={24} />}
                                        isLoading={isPendingEmail}
                                        className={"bg-gradient-primary"}
                                    >
                                        {t("continueWithEmail")}
                                    </Button>
                                </form>
                            </Form>
                        )}
                        {page === 1 && (
                            <>
                                <Form {...formOTP}>
                                    <form onSubmit={formOTP.handleSubmit(handleSubmitOTP)} className="flex flex-col gap-y-4">
                                        <FormField
                                            control={formOTP.control}
                                            name="otp"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div>
                                                            <InputOtp
                                                                {...field}
                                                                isRequired
                                                                label={t("otp")}
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
                                                                placeholder={t("enterOtp")}
                                                                validate={() => {
                                                                    return fieldState.error?.message;
                                                                }}
                                                                description={t("enterOtpDescription") + " " + email}
                                                                length={6}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-between">
                                            <Tooltip content={t("goBack")} delay={300}>
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
                                                    <Icon icon="solar:alt-arrow-left-linear" width={16} />
                                                </Button>
                                            </Tooltip>
                                            <Button
                                                endContent={<Icon icon="solar:arrow-right-broken" height={24} />}
                                                type="submit"
                                                isLoading={isPendingOTP}
                                            >
                                                {!isPendingOTP && t("verify")}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </>
                        )}
                    </m.div>
                </AnimatePresence>
            </LazyMotion>
            {page === 0 && (
                <>
                    <div className="flex items-center gap-4">
                        <Divider className="flex-1 bg-grayText" />
                        <span className="text-grayText">{t("orContinueWith")}</span>
                        <Divider className="flex-1 bg-grayText" />
                    </div>
                    <div className="flex flex-row w-full justify-between items-center -my-1">
                        <form
                            action={async () => {
                                const nextPath = next ? encodeURIComponent(next) : encodeURIComponent(pathname);
                                router.push(`/api/auth/google?next=${nextPath}&store_id=${storeId}`);
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
                                        style={{ display: "block" }}
                                        src="/brandIcons/google.svg"
                                        height="30"
                                        width="30"
                                        alt="Google"
                                    />
                                )}
                            </Button>
                        </form>
                    </div>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        {t("byClickingContinue")}{" "}
                        <Link href="/policies/terms-of-use" className="underline underline-offset-4 hover:text-primary">
                            {t("termsOfService")}
                        </Link>{" "}
                        {t("and")}{" "}
                        <Link href="/policies/privacy-policy" className="underline underline-offset-4 hover:text-primary">
                            {t("privacyPolicy")}
                        </Link>
                        .
                    </p>
                    {handleNext && (
                        <>
                            <Spacer y={1} />
                            <Button
                                variant={"outline"}
                                className={"w-full py-5"}
                                disabled={isPendingEmail}
                                isLoading={isPendingEmail}
                                onPress={handleNext}
                            >
                                {t("continueAsGuest")}
                            </Button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}