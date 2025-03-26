"use client";
import React, {useState} from "react";
import { Icon } from "@iconify/react";
import { Button, Spacer } from "@heroui/react";
import GradientText from "@/components/ui/gradient-text";
import { formatScheduledDateTime } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { OrderData } from "@/lib/actions/order";
import {onDownloadInvoice} from "@/components/store/orders/overview/components/on-download";

/**
 * Props interface for the OrderTopContent component
 * @interface OrderTopContentProps
 * @property {OrderData} orderData - Data for the current order
 */
interface OrderTopContentProps {
    orderData: OrderData;
}

/**
 * OrderTopContent Component
 *
 * Displays the top section of the order overview page, including:
 * - Order ID with gradient styling
 * - Scheduled time of the order
 * - Print invoice button that downloads the invoice when clicked
 *
 * @param {OrderTopContentProps} props - Component props
 * @param {OrderData} props.orderData - Data for the current order
 * @returns {JSX.Element} Rendered component
 */
export const OrderTopContent: React.FC<OrderTopContentProps> = ({ orderData }) => {
    const locale = useLocale();
    const t = useTranslations("app/(store)/components/orders/overview");
    const [isLoading, setIsLoading] = useState(false);
    // console.log(orderData);
    return (
        <section id="Order Top Content" className="flex justify-between">
            <div className="flex flex-col w-full max-w-2xl">
                <div className="flex">
                    <p>{t("Order")}</p>
                    <Spacer x={1} />
                    <GradientText>#{orderData.store_order_id}</GradientText>
                </div>
                <p className="text-sm font-light text-default-600">
                    {formatScheduledDateTime(orderData.scheduled_time, locale)}
                </p>
            </div>
            <Button
                startContent={
                    <div className="w-[24px]">
                        <Icon icon="solar:printer-minimalistic-bold" width={24} height={24}/>
                    </div>
                }
                color="primary"
                isLoading={isLoading}
                className="bg-gradient-primary px-8"
                onPress={async () => {
                    setIsLoading(true);
                    await onDownloadInvoice(orderData.store_id, orderData.id, orderData.store_order_id, orderData.customer_email);
                    setIsLoading(false);
                }}
            >
                {t("Print Invoice")}
            </Button>
        </section>
    );
};
