"use client";

import React from 'react';
import { OrderData } from '@/lib/actions/order';
import { 
    Modal, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    Button,
    Spacer
} from '@heroui/react';
import { useTranslations } from 'next-intl';

import { OrderCustomerDetails } from '@/components/store/orders/overview/components/customer-details';
import { OrderTopContent } from '@/components/store/orders/overview/components/top-content';
import { Icon } from '@iconify/react';
import { OrderUserStatus } from './components/order-user-status';   
import { OrderUserItems } from './components/order-user-items';

interface OrderDetailsModalProps {
    order: OrderData | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ 
    order, 
    isOpen, 
    onClose 
}) => {
    const t = useTranslations('app/components/order-user');

    if (!order) return null;

    // Define steps based on order status
    const steps = [
        { title: "Received", description: "Order placed" },
        { title: "In Progress", description: "Preparing" },
        { title: "Ready", description: "Ready for pickup/delivery" },
        { title: "Completed", description: "Order completed" }
    ];

    // Map order status to step index
    const getStatusIndex = (status: string): number => {
        switch (status) {
            case 'new': return 0;
            case 'started': return 1;
            case 'ready': return 2;
            case 'completed': return 3;
            case 'cancelled': return 0; // Show cancelled at the beginning
            case 'refunded': return 0; // Show refunded at the beginning
            default: return 0;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="3xl"
            scrollBehavior="inside"
            placement='center'
            backdrop='blur'
            classNames={{
                base: "max-h-[90vh]"
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 px-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xl">{t('orderDetails')}</span>
                                <Button
                                    aria-label="Close order details"
                                    isIconOnly
                                    variant="light"
                                    onPress={onClose}
                                >
                                    <Icon icon="solar:close-line-duotone" className="w-5 h-5" />
                                </Button>
                            </div>
                        </ModalHeader>

                        <ModalBody
                            className='px-2'
                        >

                            {/* Order Top Content */}
                            <div className="px-4">
                                <OrderTopContent 
                                    orderData={order} 
                                    isUser={true}
                                />
                            </div>
                            <Spacer y={4} />

                            {/* Order Status */}
                            <OrderUserStatus orderData={order} />
                            {/* Order Items */} 
                            <OrderUserItems orderData={order} />
                            <Spacer y={4} />

                            {/* Customer Details */}
                            <OrderCustomerDetails
                                customer={order.customer}
                                address={order.deliveryAddress || undefined}
                                orderNote={order.orderNote}
                            />
                        </ModalBody>

                        <ModalFooter>
                            <Button aria-label="Close order details" variant="light" onPress={onClose}>
                                {t('close')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}; 