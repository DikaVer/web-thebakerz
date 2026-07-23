/**
 * @fileoverview Two-step application form used in the landing page partner signup flow.
 *
 * Exports the ApplyForm component, which first validates a phone number and
 * terms acceptance (GetStartedSchema via validatePhone), then collects name
 * and email (ApplySchema) and submits the application through the
 * sendApplication server action. Uses react-hook-form with Zod resolvers,
 * useActionState for submission state, and Framer Motion for step transitions.
 */
import React, { startTransition } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ApplySchema, GetStartedSchema } from "@/lib/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Checkbox, Link, Tooltip } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormError } from "@/components/authentication/form-error";
import { sendApplication, validatePhone } from "@/lib/actions/emails/email-action";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import BlurText from "../ui/blur-text";

export type ApplyFormProps = React.HTMLAttributes<HTMLDivElement> & {
    onNext: () => void;
};

const ApplyForm = React.forwardRef<HTMLFormElement, ApplyFormProps>(
    ({ className, onNext, ...props }, ref) => {
        const t = useTranslations("app/(landing)/components/apply-form");
        const [[page, direction], setPage] = React.useState([0, 0]);

        const paginate = (newDirection: number) => {
            setPage([page + newDirection, newDirection]);
        };

        const formStart = useForm<z.infer<typeof GetStartedSchema>>({
            resolver: zodResolver(GetStartedSchema),
            defaultValues: {
                phone: "",
                terms: false
            }
        });

        const formApply = useForm<z.infer<typeof ApplySchema>>({
            resolver: zodResolver(ApplySchema),
            defaultValues: {
                email: "",
                name: "",
                phone: "",
                terms: false
            }
        });

        const [stateStarted, submitActionStarted, isPendingStarted] = useActionState(
            async (previousState: any, formData: z.infer<typeof GetStartedSchema>) => {
                const state = await validatePhone(formData);
                if (state.error) {
                    return state;
                }
                formApply.setValue("phone", formData.phone);
                formApply.setValue("terms", formData.terms);
                paginate(1);
                return state;
            },
            null
        );

        const [state, submitAction, isPending] = useActionState(
            async (previousState: any, formData: z.infer<typeof ApplySchema>) => {
                const state = await sendApplication(formData);
                if (state.error) {
                    return state;
                }
                onNext();
                return state;
            },
            null
        );

        const handleSubmitStarted = (formData: z.infer<typeof GetStartedSchema>) => {
            startTransition(() => {
                submitActionStarted(formData);
            });
        };

        const handleSubmit = (formData: z.infer<typeof ApplySchema>) => {
            startTransition(() => {
                submitAction(formData);
            });
        };

        const variants = {
            enter: (direction: number) => ({
                x: direction > 0 ? 50 : -50,
                opacity: 0
            }),
            center: {
                zIndex: 1,
                x: 0,
                opacity: 1
            },
            exit: (direction: number) => ({
                zIndex: 0,
                x: direction < 0 ? 50 : -50,
                opacity: 0
            })
        };

        return (
            <>
                <div className="flex flex-col text-left gap-2 mb-4">
                    <h2 className="sr-only text-3xl lg:text-5xl font-bold bg-gradient-text pb-4">
                        {t("startAndGrowBusiness")}
                    </h2>
                    <BlurText
                        once={true}
                        text={t("startAndGrowBusiness")}
                        delay={200}
                        animateBy="words"
                        direction="bottom"
                        className="text-3xl lg:text-5xl font-bold pb-4"
                    />
                    <p className="text-lg lg:text-xl font-bold text-grayText">
                        {t("cookingAndRest")}
                    </p>
                </div>
                <LazyMotion features={domAnimation}>
                    <AnimatePresence custom={direction} initial={false} mode="wait">
                        <m.div
                            key={page}
                            animate="center"
                            className="flex flex-col gap-y-8 justify-start items-start"
                            custom={direction}
                            exit="exit"
                            initial="enter"
                            transition={{ duration: 0.2 }}
                            variants={variants}
                        >
                            {page === 0 && (
                                <Form {...formStart}>
                                    <form
                                        onSubmit={formStart.handleSubmit(handleSubmitStarted)}
                                        className="flex flex-col justify-start gap-y-2"
                                    >
                                        <FormField
                                            control={formStart.control}
                                            name="phone"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            isRequired
                                                            label={t("phone")}
                                                            placeholder={t("phonePlaceholder")}
                                                            type="text"
                                                            validate={() => fieldState.error?.message}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formStart.control}
                                            name="terms"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="flex items-center justify-center">
                                                            {/*@ts-ignore */}
                                                            <Checkbox
                                                                {...field}
                                                                isSelected={field.value}
                                                                className="m-0 text-left mb-2"
                                                                color="primary"
                                                                name="terms"
                                                                size="md"
                                                            />
                                                            <p className="mb-2 text-start">
                                                                {t("termsAgreement")}{" "}
                                                                <Link
                                                                    className="mx-1 text-grayText underline"
                                                                    href="/policies/terms-of-use"
                                                                    size="md"
                                                                >
                                                                    {t("terms")}
                                                                </Link>
                                                                <span>{t("and")}</span>{" "}
                                                                <Link
                                                                    className="text-grayText underline"
                                                                    href="/policies/privacy-policy"
                                                                    size="md"
                                                                >
                                                                    {t("privacyPolicy")}
                                                                </Link>
                                                                .
                                                            </p>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormError message={stateStarted?.error || undefined} />
                                        <div className="w-full flex justify-end">
                                            <Button
                                                aria-label="Get started"
                                                fullWidth
                                                className="bg-gradient-primary w-fit"
                                                type="submit"
                                                endContent={<Icon icon="solar:arrow-right-broken" height={24} />}
                                            >
                                                {t("getStarted")}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                            {page === 1 && (
                                <Form {...formApply}>
                                    <form
                                        onSubmit={formApply.handleSubmit(handleSubmit)}
                                        className="flex flex-col justify-start gap-y-4 w-full max-w-sm"
                                    >
                                        <FormField
                                            control={formApply.control}
                                            name="name"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            isRequired
                                                            label={t("name")}
                                                            placeholder={t("namePlaceholder")}
                                                            type="text"
                                                            validate={() => fieldState.error?.message}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={formApply.control}
                                            name="email"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            isRequired
                                                            endContent={
                                                                <Icon
                                                                    className="text-2xl text-default-400 pointer-events-none flex-shrink-0"
                                                                    icon="solar:mail"
                                                                />
                                                            }
                                                            label={t("email")}
                                                            placeholder={t("emailPlaceholder")}
                                                            type="email"
                                                            validate={() => fieldState.error?.message}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormError message={state?.error || undefined} />
                                        <div className="flex w-full justify-between">
                                            <m.div className="flex min-h-[40px] items-center gap-2 pb-8">
                                                <AnimatePresence initial={false} mode="popLayout">
                                                    {page >= 1 && (
                                                        <m.div
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -10 }}
                                                            initial={{ opacity: 0, x: -10 }}
                                                        >
                                                            <Tooltip content={t("goBack")} delay={3000}>
                                                                <Button
                                                                    aria-label="Go back"
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onPress={() => paginate(-1)}
                                                                >
                                                                    <Icon
                                                                        className="text-default-500"
                                                                        icon="solar:alt-arrow-left-linear"
                                                                        width={16}
                                                                    />
                                                                </Button>
                                                            </Tooltip>
                                                        </m.div>
                                                    )}
                                                </AnimatePresence>
                                            </m.div>
                                            <Button
                                                aria-label="Submit application"
                                                fullWidth
                                                className="bg-gradient-primary w-fit"
                                                type="submit"
                                                endContent={<Icon icon="solar:arrow-right-broken" height={24} />}
                                                isLoading={isPending}
                                            >
                                                {isPending ? t("submitting") : t("submit")}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </m.div>
                    </AnimatePresence>
                </LazyMotion>
            </>
        );
    }
);

ApplyForm.displayName = "ApplyForm";
export default ApplyForm;