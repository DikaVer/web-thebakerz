'use client';
import React from 'react';
import {Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Link, Divider, Spacer, Alert, AccordionItem, Accordion} from "@heroui/react";
import {Icon, IconProps} from '@iconify/react';
import {pacifico} from "@/components/fonts";
import {useStore} from "@/components/providers/store-provider";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";

type SocialIconProps = Omit<IconProps, "icon">;

const StoreDescription: React.FC<{ isOpen: boolean, onOpenChange: () => void }> = ({ isOpen, onOpenChange }) => {

    const { store } = useStore();
    const { theme } = useTheme();

    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            placement={'center'}
            hideCloseButton
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader
                            className={'pb-0 px-4'}
                        >
                            <Button isIconOnly variant={'light'} radius={'full'} onPress={onClose}>
                                <Icon icon="iconamoon:close-bold" width={32} className="text-default-400" strokeWidth={2} stroke={"2"}/>
                            </Button>
                        </ModalHeader>
                        <ModalBody
                            className={'gap-y-4'}
                        >
                            <div className={'flex  flex-col justify-center'}>
                                {store?.ownerName &&
                                    <div className={'flex gap-x-4'}>
                                        <p className={`text-xl whitespace-pre-wrap font-medium text-text ${pacifico.className}`}>
                                            {store.ownerName}
                                        </p>

                                        <>
                                            {store?.instagram_url && (
                                                <Link key={"Instagram"} isExternal className="text-blue-500 h-6"
                                                      href={store.instagram_url}>
                                                    <span className="sr-only">{store.instagram_url}</span>
                                                    <Icon icon="line-md:instagram" strokeWidth={1.5} width={24}
                                                          aria-hidden="true"
                                                          className="w-6"/>
                                                </Link>
                                            )}
                                            {store?.facebook_url && (
                                                <Link key={"Facebook"} isExternal className="text-blue-500 h-6"
                                                      href={store.facebook_url}>
                                                    <span className="sr-only">{store.facebook_url}</span>
                                                    <Icon icon="line-md:facebook" strokeWidth={1.5} width={24}
                                                          aria-hidden="true"
                                                          className="w-6"/>
                                                </Link>
                                            )}
                                        </>

                                    </div>
                                }
                            </div>

                            <Divider/>

                            <Alert
                                key={"Pick Up Only Alert"}
                                className={'bg-primary-400'}
                                classNames={{
                                    description: 'text-white dark:text-default-500',
                                    title: 'text-md'
                                }}
                                title={`Shop offers only pickup orders`}
                                description={`Working hours and pickup address are presented below. You can select pickup time and day during checkout.`}
                                variant={"solid"}
                            />

                            <Divider/>

                                <Accordion
                                    motionProps={{
                                        variants: {
                                            enter: {
                                                y: 0,
                                                opacity: 1,
                                                height: "auto",
                                                overflowY: "unset",
                                                transition: {
                                                    height: {
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 30,
                                                        duration: 1,
                                                    },
                                                    opacity: {
                                                        easings: "ease",
                                                        duration: 1,
                                                    },
                                                },
                                            },
                                            exit: {
                                                y: -10,
                                                opacity: 0,
                                                height: 0,
                                                overflowY: "hidden",
                                                transition: {
                                                    height: {
                                                        easings: "ease",
                                                        duration: 0.25,
                                                    },
                                                    opacity: {
                                                        easings: "ease",
                                                        duration: 0.3,
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    variant="light"
                                    className={'px-0'}
                                >
                                    <AccordionItem
                                        key="Working Hours"
                                        aria-label="Working Hours"
                                        title="Opening Hours"
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

                            <Divider/>
                                <Link
                                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                    className={'flex flex-row justify-between'}
                                >
                                    <div className={'flex gap-x-4 items-center'}>
                                        <IconLocation size={24}
                                                      primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                      secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                                        />
                                        <div className={'flex flex-col gap-y-0'}>
                                            <p className={"text-sm  text-text"}>
                                                {location}
                                            </p>
                                            <p className={"text-xs  text-default-600"}>
                                                {subLocation}
                                            </p>
                                        </div>
                                    </div>
                                    <Icon icon={'mi:arrow-right-up'} width={24} className={'text-default-500'}/>
                                </Link>
                            <Divider/>

                            {store?.phone &&
                                <>
                                    <Link key={"Phone"} isExternal className="text-default-500 justify-between"
                                          href={phone.href}>
                                        <div className={'flex gap-x-4'}>
                                            <phone.icon aria-hidden="true"/>
                                            <p className={'text-text text-sm'}>
                                                {store.phone}
                                            </p>
                                            <span className="sr-only">{phone.name}</span>
                                        </div>
                                        <Icon icon={'mi:arrow-right-up'} width={24}/>
                                    </Link>
                                </>
                            }
                            <Divider/>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" radius={'full'} onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default StoreDescription;