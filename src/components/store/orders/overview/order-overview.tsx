/**
 * @fileoverview Client component composing the full order overview page.
 *
 * Exports OrderOverview, which stacks a back button (to the store or admin
 * order dashboard, preserving date range params), OrderTopContent,
 * OrderStatusCard, OrderItems, and OrderCustomerDetails for a single order.
 * Behavior varies with the isStore prop and the session user's role.
 */
"use client";
import React from "react";
import {Icon} from "@iconify/react";
import {Button, Spacer} from "@heroui/react";
import {useRouter} from "next/navigation";
import {StoreData} from "@/lib/actions/store";
import {OrderData} from "@/lib/actions/order";
import {OrderTopContent} from "@/components/store/orders/overview/components/top-content";
import {OrderStatusCard} from "@/components/store/orders/overview/components/order-status-card";
import {OrderCustomerDetails} from "@/components/store/orders/overview/components/customer-details";
import {OrderItems} from "@/components/store/orders/overview/components/order-items";
import {useStore} from "@/components/providers/store-provider";
import {useTranslations} from "next-intl";
import {useSession} from "@/components/providers/session-provider";


interface OrderOverviewProps {
    orderData: OrderData;
    from?: string;
    to?: string;
    isStore?: boolean;
}

export const OrderOverview: React.FC<OrderOverviewProps> = ({orderData, from, to, isStore = true}) => {
    const { store } = isStore ? useStore() : { store: null };
    const { session } = useSession();
    const router = useRouter();
    const t = useTranslations("app/(store)/components/orders");
    const storeUrl = store?.storeName ? store?.storeName : store?.id;

    const dateParams = `date=${orderData.scheduled_time.date}`;
    const fromToParams = from && to ? `&from=${from}&to=${to}` : '';
    const returnUrl = session?.user?.role === "admin" ? `/dashboard/orders?${dateParams}${fromToParams}` : `/orders`;
    return (
        <div className={'flex flex-col w-full max-w-2xl container'}>
            {isStore ? (
                <Button
                    aria-label="Back to order dashboard"
                    size="md"
                    variant="light"
                    className="text-default-500 max-w-fit px-0 pr-2"
                    onPress={() => {
                        router.push(`/${storeUrl}/orders?${dateParams}${fromToParams}`);
                        router.refresh()
                    }}
                    startContent={
                        <Icon
                            className="text-default-500"
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
                    }
                >
                    {t("backToOrderDashboard")}
                </Button>
            ) : (
                <Button
                    aria-label="Back to order dashboard"
                    size="md"
                    variant="light"
                    className="text-default-500 max-w-fit px-0 pr-2"
                    onPress={() => {
                        router.push(returnUrl);
                        router.refresh()
                    }}
                    startContent={
                        <Icon
                            className="text-default-500"
                            height={24}
                            icon="solar:alt-arrow-left-linear"
                            width={24}
                        />
                    }
                >
                    {t("backToOrderDashboard")}
                </Button>
            )}
            <Spacer y={4}/>
            <OrderTopContent
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderStatusCard
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderItems
                orderData={orderData}
            />
            <Spacer y={8}/>
            <OrderCustomerDetails
                customer={orderData.customer}
                address={orderData.deliveryAddress || undefined}
                orderNote={orderData.orderNote}
            />
            <Spacer y={8}/>
        </div>
    );
};