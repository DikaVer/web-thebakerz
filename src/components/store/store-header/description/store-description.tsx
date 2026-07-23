/**
 * @fileoverview Modal with store details, contact links, and working hours.
 *
 * Exports the StoreDescription client component, a Hero UI modal showing the
 * owner name, Instagram/Facebook links, a delivery-options alert derived from
 * the store's deliveryOption, a working-hours accordion, the address with a
 * Google Maps link, and a WhatsApp phone link. External links require a
 * signed-in session and otherwise open the sign-in modal.
 */
'use client';
import React from 'react';
import {Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Link, Divider, Spacer, Alert, AccordionItem, Accordion} from "@heroui/react";
import {Icon, IconProps} from '@iconify/react';
import {pacifico} from "@/components/fonts";
import {useStore} from "@/components/providers/store-provider";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
import {useTranslations} from "next-intl";
import { useSignInModal } from '@/components/ui/modal-signin';
import { useSession } from '@/components/providers/session-provider';
import { useDelivery } from '@/components/providers/delivery-provider';

type SocialIconProps = Omit<IconProps, "icon">;

const StoreDescription: React.FC<{ isOpen: boolean, onOpenChange: () => void }> = ({ isOpen, onOpenChange }) => {

    const { store } = useStore();
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-description");
    const { openModal, ModalSign } = useSignInModal();
    const { session } = useSession();


    const [latitude, longitude] = [store?.location?.latitude, store?.location?.longitude];

    const location = store?.location?.route ? `${store.location?.route} ${store.location?.house_number}` : "";
    const subLocation = store?.location?.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "";

    const phone = {
        name: t("phone"),
        href: `https://wa.me/${store?.phone?.replace(/\D/g, '')}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="mdi:whatsapp" strokeWidth={1.5} width={24}/>,
    };

    // Helper function to determine alert content based on delivery options
    const getAlertContent = () => {
        if (!store?.deliveryOption) {
            return {
                title: t("pickUpOnly"),
                description: t("pickUpDescription")
            };
        }

        switch(store.deliveryOption) {
            case 'pickup':
                return {
                    title: t("pickUpOnly"),
                    description: t("pickUpDescription")
                };
            case 'delivery':
                return {
                    title: t("deliveryOnly"),
                    description: t("deliveryOnlyDescription")
                };
            case 'multi':
                return {
                    title: t("pickUpAndDelivery"),
                    description: t("pickUpAndDeliveryDescription")
                };
            default:
                return {
                    title: t("pickUpOnly"),
                    description: t("pickUpDescription")
                };
        }
    };

    const alertContent = getAlertContent();

    return (
        <>
            {/* The modal component - it stays hidden until openModal is called */}
            <ModalSign 
                message="And you can access store links and contact information"
            />
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement={'center'}
                hideCloseButton
                backdrop={'blur'}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader
                                className={'pb-0 px-4'}
                            >
                                <Button aria-label="Close" isIconOnly variant={'light'} radius={'full'} onPress={onClose}>
                                    <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                                </Button>
                            </ModalHeader>
                            <ModalBody
                                className={'gap-y-4'}
                            >
                                {store?.ownerName &&
                                    <div className={'flex gap-x-4'}>
                                        <p className={`text-xl whitespace-pre-wrap font-medium text-text ${pacifico.className}`}>
                                            {store.ownerName}
                                        </p>

                                        <>
                                            {store?.instagram_url && (
                                                <Link key={"Instagram"} isExternal className="text-blue-500 h-6"
                                                    href="#"
                                                    onClick={(e) => {
                                                        if (!session?.user) {
                                                            e.preventDefault();
                                                            openModal();
                                                        } else {
                                                            window.open(store.instagram_url, '_blank', 'noopener,noreferrer');
                                                        }
                                                    }}
                                                    >
                                                    <span className="sr-only">{t("instagram")}</span>
                                                    <Icon icon="line-md:instagram" strokeWidth={1.5} width={24}
                                                        aria-hidden="true"
                                                        className="w-6"/>
                                                </Link>
                                            )}
                                            {store?.facebook_url && (
                                                <Link key={"Facebook"} isExternal className="text-blue-500 h-6"
                                                    href="#"
                                                    onClick={(e) => {
                                                        if (!session?.user) {
                                                            e.preventDefault();
                                                            openModal();
                                                        } else {
                                                            window.open(store.facebook_url, '_blank', 'noopener,noreferrer');
                                                        }
                                                    }}
                                                    >
                                                    <span className="sr-only">{t("facebook")}</span>
                                                    <Icon icon="line-md:facebook" strokeWidth={1.5} width={24}
                                                        aria-hidden="true"
                                                        className="w-6"/>
                                                </Link>
                                            )}
                                        </>
                                    </div>
                                }

                                <Divider/>

                                <Alert
                                    key={"Delivery Options Alert"}
                                    className={'bg-primary-400'}
                                    classNames={{
                                        description: 'text-white dark:text-default-500',
                                        title: 'text-md'
                                    }}
                                    title={alertContent.title}
                                    description={alertContent.description}
                                    variant={"solid"}
                                />
                                    <>
                                        <Divider/>
                                        <Accordion
                                            motionProps={{
                                                variants: {
                                                    enter: {
                                                        y: 0,
                                                        opacity: 1,
                                                        transition: {
                                                            height: "var(--radix-accordion-content-height)",
                                                            opacity: 0.3,
                                                            ease: "easeOut"
                                                        }
                                                    },
                                                    exit: {
                                                        y: -10,
                                                        opacity: 0,
                                                        transition: {
                                                            height: 0,
                                                            opacity: 0.3,
                                                            ease: "easeIn"
                                                        }
                                                    }
                                                }
                                            }}
                                            variant="light"
                                            className={'px-0'}
                                        >
                                            <AccordionItem
                                                key="Working Hours"
                                                aria-label={t("workingHours")}
                                                title={t("workingHours")}
                                                className={'px-0'}
                                                classNames={{
                                                    title: 'text-text',
                                                    trigger: 'py-0',
                                                }}
                                                startContent={<Icon icon={'solar:clock-circle-outline'} className={'text-text'} width={24}/> }
                                                indicator={<Icon icon={'material-symbols:chevron-left-rounded'} className={'text-default-500'} width={24}/> }
                                            >
                                                <>
                                                    <Spacer y={2}/>
                                                    {renderCalendarContent()}
                                                </>
                                            </AccordionItem>
                                        </Accordion>
                                    </>

                                <Divider/>
                                <Link
                                    isExternal
                                    href="#"
                                    className={'flex flex-row justify-between'}
                                    onClick={(e) => {
                                        if (!session?.user) {
                                            e.preventDefault();
                                            openModal();
                                        } else {
                                            window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                >
                                    <div className={'flex gap-x-4 items-center'}>
                                        <IconLocation size={24}
                                                    primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                    secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                        />
                                        <div className={'flex flex-col gap-y-0'}>
                                            <p className={"text-sm  text-text"}>
                                                {location || t("addressPlaceholder")}
                                            </p>
                                            <p className={"text-xs  text-default-600"}>
                                                {subLocation || t("locationPlaceholder")}
                                            </p>
                                        </div>
                                    </div>
                                    <Icon icon={'mi:arrow-right-up'} width={24} className={'text-default-500'}/>
                                </Link>
                                <Divider/>

                                {store?.phone && (
                                    <>
                                        <Link key={"WhatsApp"} isExternal className="text-default-500 justify-between"
                                            href="#"
                                            onClick={(e) => {
                                                if (!session?.user) {
                                                    e.preventDefault();
                                                    openModal();
                                                } else {
                                                    window.open(phone.href, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                        >
                                            <div className={'flex gap-x-4'}>
                                                <phone.icon aria-hidden="true"/>
                                                <p className={'text-text text-sm'}>
                                                    {store.phone}
                                                </p>
                                                <span className="sr-only">{phone.name}</span>
                                            </div>
                                            <Icon icon={'mi:arrow-right-up'} width={24}/>
                                        </Link>
                                        <Divider/>
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button aria-label="Close" color="primary" radius={'full'} onPress={onClose}>
                                    {t("close")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default StoreDescription;