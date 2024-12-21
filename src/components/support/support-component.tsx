"use client";

import React from "react";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

import {faqsBakerz, faqsCustomer} from "./faqs";
import {useRouter} from "next/navigation";

const SupportComponent: React.FC = () => {

    const router = useRouter();

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:py-32 md:px-6 lg:px-8 lg:py-40">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8">
                <h2 className="w-full max-w-3xl bg-gradient-to-br from-text to-foreground-600 bg-clip-text px-2 text-center text-3xl font-bold leading-7 tracking-tight text-transparent md:text-5xl">
                    <span className="inline-block md:hidden">TheBakerz&apos;s FAQs</span>
                    <span className="hidden md:inline-block">TheBakerz&apos;s Frequently Asked Questions</span>
                </h2>
                <div>
                    <Button
                        disableAnimation
                        className="bg-gradient-to-br from-text to-foreground-600 font-medium text-background"
                        endContent={<Icon icon="lucide:chevron-right" width={24}/>}
                        size="lg"
                        variant="shadow"
                        onPress={() => {
                            router.push("/support/contact-us");
                            router.refresh();
                        }}
                    >
                        Contact Us
                    </Button>
                </div>
                <h2 className="w-full max-w-3xl bg-gradient-to-br from-text to-foreground-600 bg-clip-text px-2 text-center text-2xl font-bold leading-7 tracking-tight text-transparent md:text-4xl">
                    <span>Baker's Questions</span>
                </h2>
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
                            indicator={<Icon className="text-text" icon="lucide:plus" width={24}/>}
                            title={faq.title}
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeSanitize]}
                                className="prose text-grayText prose-strong:text-text prose-a:text-grayText"
                            >
                                {faq.content}
                            </ReactMarkdown>
                        </AccordionItem>
                    ))}
                </Accordion>
                <h2 className="w-full max-w-3xl bg-gradient-to-br from-text to-foreground-600 bg-clip-text px-2 text-center text-2xl font-bold leading-7 tracking-tight text-transparent md:text-4xl">
                    <span>Customer's Questions</span>
                </h2>
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
                    {faqsCustomer.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            indicator={<Icon className="text-text" icon="lucide:plus" width={24}/>}
                            title={faq.title}
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeSanitize]}
                                className="prose text-grayText prose-strong:text-text prose-a:text-grayText"
                            >
                                {faq.content}
                            </ReactMarkdown>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default SupportComponent;

