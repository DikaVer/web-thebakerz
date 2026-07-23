/**
 * @fileoverview Order status selector with confirmation modal for the order dashboard.
 *
 * Exports StatusSelect, which renders the current order status as a chip
 * inside a dropdown of statuses (new, started, ready, completed). Choosing a
 * different status opens a confirmation modal, then persists the change via
 * the updateOrderStatus action, updates the session's new-order count, shows
 * a toast, and notifies the parent through the onStatusChange callback.
 */
import { Select, SelectItem, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer } from "@heroui/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import {OrderData, OrderStatus, updateOrderStatus} from "@/lib/actions/order";
import { OrderStatusChip } from "@/components/ui/status-chip";
import React from "react";
import { IconClose } from "@/components/ui/icons";
import GradientText from "@/components/ui/gradient-text";
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";
import { useSession } from "@/components/providers/session-provider";

interface StatusSelectProps {
    order: OrderData;
    currentStatus: OrderStatus;
    onStatusChange?: (oldStatus: OrderStatus, newStatus: OrderStatus) => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ order, currentStatus, onStatusChange }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const router = useRouter();
    const c_T = useTranslations();
    const t = useTranslations("app/(store)/components/status-select");
    const { updateNewOrderCount } = useSession();
    const [targetStatus, setTargetStatus] = React.useState<OrderStatus>(currentStatus);
    const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus>(currentStatus);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const statusOptions = ["new", "started", "ready", "completed"];

    const handleStatusClick = (newStatus: OrderStatus) => {
        if (newStatus !== selectedStatus) {
            setTargetStatus(newStatus);
            onOpen();
        }
    };

    const handleConfirmStatusChange = async () => {
        setIsLoading(true);

        const { ok: isUpdated, error } = await updateOrderStatus(
            order.store_id,
            order.id,
            order.seq_id.toString(),
            order.customer.email_customer,
            targetStatus
        );

        if (!isUpdated) {
            showErrorMessage({error: error || t("failedToUpdateStatus")});
            setSelectedStatus(currentStatus)
        } else {
            updateNewOrderCount(order.store_id, targetStatus === "new" ? 1 : -1);
            showSuccessMessage({success: t("statusUpdatedSuccess")});
            onStatusChange?.(selectedStatus, targetStatus);
            setSelectedStatus(targetStatus);
            router.refresh();
        }

        setIsLoading(false);
        onOpenChange();
    };

    return (
        <>
            <Select
                variant="flat"
                size="sm"
                aria-label={t("orderStatus")}
                selectedKeys={[selectedStatus]}
                disallowEmptySelection={true}
                classNames={{
                    base: 'w-fit',
                    trigger: "min-h-0 h-auto py-0 px-0 border-none bg-transparent static rounded-full",
                    selectorIcon: 'hidden',
                    innerWrapper: 'w-fit',
                    value: "p-0",
                    popoverContent: "w-[150px] -translate-x-24",
                }}
                renderValue={() => <OrderStatusChip status={selectedStatus} />}
            >
                {statusOptions.map((status) => (
                    <SelectItem
                        key={status}
                        textValue={c_T(`OrderStatus.${status}`)}
                        onPress={() => handleStatusClick(status as OrderStatus)}
                    >
                        <OrderStatusChip status={status as OrderStatus} />
                        {/*<span className="ml-2">{statusT(status)}</span>*/}
                    </SelectItem>
                ))}
            </Select>

            <Modal
                isOpen={isOpen}
                size="sm"
                onOpenChange={onOpenChange}
                backdrop="blur"
                placement="center"
                classNames={{
                    closeButton: 'p-1'
                }}
                isDismissable={!isLoading}
                hideCloseButton={isLoading}
                closeButton={
                    <div className="absolute w-full right-0">
                        <IconClose
                            size={32}
                            primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                            secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />
                    </div>
                }
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex">
                                    <p className="text-xl">{t("order")}</p>
                                    <Spacer x={1}/>
                                    <GradientText>#{order.store_order_id}</GradientText>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p>{t("changeStatusAction")}</p>
                                <div className="flex items-center gap-x-2">
                                    <OrderStatusChip status={selectedStatus} />
                                    <Icon icon="solar:arrow-right-linear" width={24}/>
                                    <OrderStatusChip status={targetStatus} />
                                </div>
                                {/*<p className="font-medium">{t("selectOneOption")}</p>*/}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    aria-label="Change status"
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                    color="primary"
                                    variant="light"
                                    onPress={handleConfirmStatusChange}
                                >
                                    {!isLoading && t("changeStatus")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};