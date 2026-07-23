/**
 * @fileoverview Colored chip displaying an order's status.
 *
 * Exports OrderStatusChip, a Hero UI Chip showing a translated order status
 * label, and the getStatusColor helper that maps statuses (new, started,
 * ready, completed, cancelled, refunded) to background and text color classes.
 */
import { Chip, ChipProps } from "@heroui/react";
import { OrderStatus } from "@/lib/actions/order";
import { useTranslations } from "next-intl";

export const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase() || "") {
        case "ready": return "bg-blue-500 text-white";
        case "refunded": return "bg-purple-100 text-black";
        case "new": return "bg-danger-500 text-white";
        case "started": return "bg-warning-300 text-black";
        case "completed": return "bg-success-500 text-black";
        case "cancelled": return "bg-default-300 text-black";
        default: return "bg-default-300 text-black";
    }
};

export const OrderStatusChip = ({
                                    status,
                                    ...chipProps
                                }: {
    status: OrderStatus;
} & Omit<ChipProps, "color" | "children">) => {
    const t = useTranslations("OrderStatus");
    return (
        <Chip
            {...chipProps}
            className={getStatusColor(status)}
        >
            {t(status?.toLowerCase() || "unknown")}
        </Chip>
    );
};