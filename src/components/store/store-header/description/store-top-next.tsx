'use client';
import React from 'react';
import {Link, Divider, Spacer, Alert, AccordionItem, Accordion} from "@heroui/react";
import {Icon, IconProps} from '@iconify/react';
import {useStore} from "@/components/providers/store-provider";
import {renderCalendarContent} from "@/components/store/store-header/subheader/working-hours";

type SocialIconProps = Omit<IconProps, "icon">;

const StoreTopNext: React.FC = () => {

    const { store } = useStore();

    const phone = {
        name: "Phone",
        href: `tel:${store?.phone}`,
        icon: (props: SocialIconProps) => <Icon {...props} icon="line-md:phone-call" strokeWidth={1.5} width={24}/>,
    };

    return (
        <div className={'flex flex-col gap-y-4 w-full'}>
            <Alert
                key={"Pick Up Only Alert"}
                className={'bg-default-100'}
                classNames={{
                    title: 'text-md'
                }}
                title={`Shop offers only pickup orders`}
                variant={"solid"}
            />

            <Divider/>

            <Accordion
                selectedKeys={["Working Hours"]}
                variant="light"
                className={'px-0'}
            >
                <AccordionItem
                    key="Working Hours"
                    aria-label="Working Hours"
                    title="Opening Hours"
                    className={'px-0 cursor-default'}
                    classNames={{
                        title: 'text-text',
                        trigger: 'py-0 cursor-default',
                    }}
                    startContent={<Icon icon={'solar:clock-circle-outline'} className={'text-text'} width={24}/> }
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
                    <Divider/>
                    <Link key={"Phone"} isExternal className="text-default-500 justify-between"
                          href={phone.href}>
                        <div className={'flex gap-x-4'}>
                            <phone.icon aria-hidden="true"/>
                            <p className={'text-text text-md'}>
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