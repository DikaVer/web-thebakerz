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

    const t = useTranslations('Shop')

    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };

    return (
        <div className={'flex flex-col gap-y-4 w-full'}>
            <Tooltip
                content={<p className={'max-w-sm'}>{t("Alert Hover")}</p>}
            >
                <Alert
                    key={"Pick Up Only Alert"}
                    className={'bg-default-100 items-center my-2 '}
                    classNames={{
                        title: 'text-medium '
                    }}
                    title={t("Alert")}
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
                    title={t("Opening Hours")}
                    className={'px-0'}
                    classNames={{
                        title: 'text-default-500',
                        trigger: 'py-0 cursor-default',
                    }}
                    startContent={<Icon icon={'solar:clock-circle-outline'} className={'text-default-500'} width={24}/> }
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
                    <Link key={"Phone"} isExternal className="text-default-500 justify-between"
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