import { Chip, ChipProps } from "@heroui/react";

type OrderStatus = "new" | "started" | "ready" | "completed" | "cancelled" | "refunded";

export const OrderStatusChip = ({
                                    status,

                                    ...chipProps
                                }: {
    status: OrderStatus;
} & Omit<ChipProps, "color" | "children">) => {

    const lowerCaseStatus = status.toLowerCase();



    // Map status to appropriate color
    const statusColorClass: Record<OrderStatus, string | undefined> = {
        "ready": "bg-blue-500 text-white",
        "refunded": "bg-purple-100 text-white",
        "new": "bg-danger-500 text-white",
        "started": "bg-warning-300 text-black",
        "completed": "bg-success-500 text-black",
        "cancelled": "bg-default-300 text-black",
    };

    // Capitalize first letter for display
    const displayText = (() => {
        switch (status) {
            case "new":
                return "New";
            case "started":
                return "Cooking";
            case "ready":
                return "Ready";
            case "completed":
                return "Picked Up";
            case "cancelled":
                return "Cancelled";
            case "refunded":
                return "Refunded";
            default:
                return "Unknown";
        }
    })();

    return (
        <Chip
            {...chipProps}
            className={statusColorClass[status]}
        >
            {displayText}
        </Chip>
    );
};