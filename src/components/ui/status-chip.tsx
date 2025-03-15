import { Chip, ChipProps } from "@heroui/react";
import {OrderStatus} from "@/lib/actions/order";


export const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase() || "") {
        case "ready": return "bg-blue-500 text-white";
        case "refunded": return "bg-purple-100 text-white";
        case "new": return "bg-danger-500 text-white";
        case "started": return "bg-warning-300 text-black";
        case "completed": return "bg-success-500 text-black";
        case "cancelled": return "bg-default-300 text-black";
        default: return "bg-default-300 text-black";
    }
};

export const getStatusDisplayName = (status: string): string => {
    switch (status?.toLowerCase() || "") {
        case "new": return "New";
        case "started": return "Cooking";
        case "ready": return "Ready";
        case "completed": return "Picked Up";
        case "cancelled": return "Cancelled";
        case "refunded": return "Refunded";
        default: return "Unknown";
    }
};

export const OrderStatusChip = ({
                                    status,

                                    ...chipProps
                                }: {
    status: OrderStatus;
} & Omit<ChipProps, "color" | "children">) => {


    return (
        <Chip
            {...chipProps}
            className={getStatusColor(status)}
        >
            {getStatusDisplayName(status)}
        </Chip>
    );
};