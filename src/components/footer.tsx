// import * as React from "react";
//
// export function Footer() {
//   return (
//       <footer className=" border-t bg-grayBg rounded-xl">
//           <div className="mx-4 desktop:mx-10 flex flex-col">
//               <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-24">
//                   <a
//                       className={"text-2xl font-bold text-ui-fg-subtle hover:text-ui-fg-base"}
//                       href={"/"}
//                   >
//                       TheBakerz
//                   </a>
//                   <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
//                       <div className="flex flex-col gap-y-2">
//                           <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
//                               <li>
//                                   <a
//                                       href="/join-thebakerz"
//                                       className="hover:text-ui-fg-base"
//                                   >
//                                       Work with Bakerz
//                                   </a>
//                               </li>
//                               <li>
//                                   <a
//                                       href="/support"
//                                       className="hover:text-ui-fg-base"
//                                   >
//                                       Get Help
//                                   </a>
//                               </li>
//                           </ul>
//                       </div>
//                       <div className="flex flex-col gap-y-2">
//                           <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
//                               <li>
//                                   <a
//                                       href="/policies/privacy-policy"
//                                   >
//                                       Privacy Policy
//                                   </a>
//                               </li>
//                               <li>
//                                   <a
//                                       href="/policies/terms-of-use"
//                                   >
//                                       Terms of Use
//                                   </a>
//                               </li>
//                           </ul>
//                       </div>
//                   </div>
//               </div>
//               <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
//                   <p className="font-normal font-sans txt-medium txt-compact-small">
//                       © {new Date().getFullYear()} TheBakerz. All rights reserved.
//                   </p>
//               </div>
//           </div>
//       </footer>
//   )
// }

"use client";

import type {IconProps} from "@iconify/react";

import React, {useState} from "react";
import {Button, Image, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {pacifico} from "@/components/fonts";
import {backdropEffect} from "@/lib/local-variables";
import confetti from "canvas-confetti";

type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
    overview: [
        {name: "Home", href: "/"},
        {name: "Search", href: "/search"},
        {name: "About Us", href: "/about-us"},
        // {name: "Market Research", href: "#"},
    ],
    supportOptions: [
        {name: "Get Help", href: "/support"},
        // {name: "User Guides", href: "#"},
        // {name: "Tutorials", href: "#"},
        // {name: "Service Status", href: "#"},
    ],
    services: [
        {name: "Services", href: "/join-thebakerz"},
        // {name: "Latest News", href: "/about-us"},
        // {name: "Career Opportunities", href: "#"},
        // {name: "Media Enquiries", href: "#"},
        // {name: "Collaborations", href: "#"},
    ],
    legal: [
        {name: "Privacy Policy", href: "/policies/privacy-policy"},
        {name: "Terms of use", href: "/policies/terms-of-use"},
        {name: "Refund Policy", href: "/policies/refund-policy"},
        // {name: "User Agreement", href: "#"},
    ],
    social: [
        {
            name: "LinkedIn",
            href: "https://www.linkedin.com/company/thebakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
        },
        {
            name: "Instagram",
            href: "https://www.instagram.com/thebakerz.official",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:instagram" />,
        },
        {
            name: "Twitter",
            href: "https://x.com/the_bakerz",
            icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
        }
    ],
};

export function Footer() {
    const renderList = React.useCallback(
        ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
            <div>
                <h3 className="text-small font-semibold text-default-600">{title}</h3>
                <ul className="mt-6 space-y-4">
                    {items.map((item) => (
                        <li key={item.name}>
                            <Link className="text-grayText" href={item.href} size="sm">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        ),
        [],
    );

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIsModalOpen(true);
        confetti({
            particleCount: 150,
            spread: 300,
            origin: { y: 0.6 }
        });
    };

    return (
        <footer className="flex w-full flex-col bg-gradient-to-br from-grayBg to-grayBgComp rounded-xl">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 md:pr-8">
                        <a
                            className="flex items-end justify-start"
                            href="/"
                        >
                            <Image
                                src={`/images/TheBakerzLogo.svg`}
                                width={64}
                                height={64}
                            />
                            <span className={`text-3xl ml-2 ${pacifico.className}`}>TheBakerz</span>
                        </a>
                        <p className="text-small text-grayText">
                            © {new Date().getFullYear()} TheBakerz. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            {footerNavigation.social.map((item) => (
                                <Link key={item.name} isExternal className="text-default-400 h-6" href={item.href}>
                                    <span className="sr-only">{item.name}</span>
                                    <item.icon aria-hidden="true" className="w-6" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>{renderList({title: "Overview", items: footerNavigation.overview})}</div>
                            <div className="mt-10 md:mt-0">
                                {renderList({title: "Support", items: footerNavigation.supportOptions})}
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>{renderList({title: "Services", items: footerNavigation.services})}</div>
                            <div className="mt-10 md:mt-0">
                                {renderList({title: "Legal", items: footerNavigation.legal})}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-10 rounded-medium bg-grayBgComp p-4 sm:my-14 sm:p-8 lg:my-16 lg:flex lg:items-center lg:justify-between lg:gap-2 shadow">
                    <div>
                        <h3 className="text-small font-semibold text-default-600">
                            Subscribe to our newsletter
                        </h3>
                        <p className="mt-2 text-small text-grayText">
                            Receive weekly updates with the newest insights, trends, and tools, straight to your
                            email.
                        </p>
                    </div>
                    <form className="mt-6 sm:flex sm:max-w-md lg:mt-0" onSubmit={handleSubmit}>
                        <Input
                            isRequired
                            aria-label="Email"
                            autoComplete="email"
                            id="email-address"
                            labelPlacement="outside"
                            name="email-address"
                            placeholder="you@thebakerz.com"
                            startContent={<Icon className="text-default-500" icon="solar:letter-linear" />}
                            type="email"
                        />
                        <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                            <Button color="primary" type="submit">
                                Subscribe
                            </Button>
                        </div>
                    </form>

                    <Modal
                       backdrop={backdropEffect}
                       isOpen={isModalOpen}
                       onClose={() => setIsModalOpen(false)}
                       size={'xl'}
                       shadow={"lg"}
                       placement={"center"}
                       className={"bg-background"}
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>
                                        <p id="modal-title">
                                            Subscription Successful
                                        </p>
                                    </ModalHeader>
                                    <ModalBody>
                                        <p>
                                            Thank you for subscribing to our newsletter!
                                        </p>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="primary" onPress={() => setIsModalOpen(false)}>
                                            Close
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>
            </div>
        </footer>
    );
}
