'use client';
import React from 'react';
import {Link, Divider, Spacer, Alert, AccordionItem, Accordion, Tooltip} from "@heroui/react";
import {Icon, IconProps} from '@iconify/react';
import {useStore} from "@/components/providers/store-provider";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";
import {useTranslations} from "next-intl";

type SocialIconProps = Omit<IconProps, "icon">;

const StoreTopNext: React.FC = () => {
    const { store } = useStore();
    const t = useTranslations('app/(store)/components/store-top-next');

    const phone = {
        name: t("phone"),
        href: `https://wa.me/${store?.phone?.replace(/\D/g, '')}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="mdi:whatsapp" strokeWidth={1.5} width={24}/>,
    };

    // Helper function to determine alert content based on delivery options
    const getAlertContent = () => {
        if (!store?.deliveryOption) {
            return {
                title: t("alertPickupOnly"),
                tooltipContent: t("alertHoverPickupOnly")
            };
        }

        switch(store.deliveryOption) {
            case 'pickup':
                return {
                    title: t("alertPickupOnly"),
                    tooltipContent: t("alertHoverPickupOnly")
                };
            case 'delivery':
                return {
                    title: t("alertDeliveryOnly"),
                    tooltipContent: t("alertHoverDeliveryOnly")
                };
            case 'multi':
                return {
                    title: t("alertDeliveryAndPickup"),
                    tooltipContent: t("alertHoverDeliveryAndPickup")
                };
            default:
                return {
                    title: t("alertPickupOnly"),
                    tooltipContent: t("alertHoverPickupOnly")
                };
        }
    };

    const alertContent = getAlertContent();

    return (
        <div className={'flex flex-col gap-y-4 w-full'}>
            <Tooltip
                content={<p className={'max-w-sm'}>{alertContent.tooltipContent}</p>}
            >
                <Alert
                    key={"Delivery Options Alert"}
                    className={'bg-default-200 items-center my-2 '}
                    classNames={{
                        title: 'text-medium '
                    }}
                    title={alertContent.title}
                    variant={"solid"}
                />
            </Tooltip>

            <Divider/>

            <Accordion
                selectedKeys={["Working Hours"]}
                variant="light"
                className={'px-0'}
            >
                <AccordionItem
                    key="Working Hours"
                    aria-label="Working Hours"
                    title={t("openingHours")}
                    className={'px-0'}
                    classNames={{
                        title: 'text-warning-600',
                        trigger: 'py-0 cursor-default',
                    }}
                    startContent={<Icon icon={'solar:clock-circle-outline'} className={'text-warning-600'} width={24}/> }
                    indicator={<></>}
                >
                    <>
                        <Spacer y={2}/>
                        {renderCalendarContent()}
                    </>
                </AccordionItem>
            </Accordion>
            {store?.phone &&
                <>
                    <Divider />
                    <Link key={"WhatsApp"} isExternal className="text-default-500 justify-between"
                          href={phone.href}>
                        <div className={'flex gap-x-4'}>
                            <phone.icon aria-hidden="true"/>
                            <p className={'text-md'}>
                                {store.phone}
                            </p>
                            <span className="sr-only">{phone.name}</span>
                        </div>
                        <Icon icon={'mi:arrow-right-up'} width={24}/>
                    </Link>
                </>
            }
        </div>
    );
};

export default StoreTopNext;