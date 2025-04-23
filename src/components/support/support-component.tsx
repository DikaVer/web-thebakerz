"use client";

import React from "react";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { faqsBakerz, faqsCustomer } from "./faqs";

const SupportComponent: React.FC = () => {
    const router = useRouter();
    const tBaker = useTranslations("app/(support)/components/faq-baker");
    // const tCustomer = useTranslations("app/(support)/components/faq-customer");
    const t = useTranslations("app/(support)/components/support");

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-32 md:px-6 lg:px-8 lg:py-40">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
                <h2 className="w-full max-w-3xl bg-gradient-text to-foreground-600 bg-clip-text px-2 text-center text-3xl font-bold leading-7 md:text-5xl">
                    <span className="inline-block md:hidden">
                        {t("faqsTitleShort")}
                    </span>
                    <span className="hidden md:inline-block">
                        {t("faqsTitleLong")}
                    </span>
                </h2>
                <div>
                    <Button
                        disableAnimation
                        className="bg-gradient-item font-medium text-background"
                        endContent={<Icon icon="lucide:chevron-right" width={24} />}
                        size="lg"
                        variant="shadow"
                        onPress={() => {
                            router.push("/support/contact-us");
                            router.refresh();
                        }}
                    >
                        {t("contactUs")}
                    </Button>
                </div>
                <Accordion
                    fullWidth
                    keepContentMounted
                    itemClasses={{
                        base: "px-0 md:px-2 lg:px-6",
                        title: "font-medium text-text",
                        trigger: "py-6 flex-row-reverse",
                        content: "pt-0 pb-6 text-base text-grayText",
                        indicator: "rotate-0 data-[open=true]:-rotate-45",
                    }}
                    selectionMode="single"
                >
                    {faqsBakerz.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            indicator={<Icon className="text-text" icon="lucide:plus" width={24} />}
                            title={tBaker(faq.questionKey)}
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeSanitize]}
                                className="prose text-grayText prose-strong:text-text prose-a:text-grayText dark:text-white dark:prose-strong:text-white dark:prose-a:text-white"
                            >
                                {tBaker(faq.answerKey)}
                            </ReactMarkdown>
                        </AccordionItem>
                    ))}
                </Accordion>
                {/*<h2 className="w-full max-w-3xl bg-gradient-to-br from-text to-foreground-600 bg-clip-text px-2 text-center text-2xl font-bold leading-7 tracking-tight text-transparent md:text-4xl">*/}
                {/*    <span>{t("sectionCustomer")}</span>*/}
                {/*</h2>*/}
                {/*<Accordion*/}
                {/*    fullWidth*/}
                {/*    keepContentMounted*/}
                {/*    itemClasses={{*/}
                {/*        base: "px-0 md:px-2 lg:px-6",*/}
                {/*        title: "font-medium text-text",*/}
                {/*        trigger: "py-6 flex-row-reverse",*/}
                {/*        content: "pt-0 pb-6 text-base text-grayText",*/}
                {/*        indicator: "rotate-0 data-[open=true]:-rotate-45",*/}
                {/*    }}*/}
                {/*    selectionMode="single"*/}
                {/*>*/}
                {/*    {faqsCustomer.map((faq, index) => (*/}
                {/*        <AccordionItem*/}
                {/*            key={index}*/}
                {/*            indicator={<Icon className="text-text" icon="lucide:plus" width={24} />}*/}
                {/*            title={tCustomer(faq.questionKey)}*/}
                {/*        >*/}
                {/*            <ReactMarkdown*/}
                {/*                rehypePlugins={[rehypeSanitize]}*/}
                {/*                className="prose text-grayText prose-strong:text-text prose-a:text-grayText"*/}
                {/*            >*/}
                {/*                {tCustomer(faq.answerKey)}*/}
                {/*            </ReactMarkdown>*/}
                {/*        </AccordionItem>*/}
                {/*    ))}*/}
                {/*</Accordion>*/}
            </div>
        </section>
    );
};

export default SupportComponent;