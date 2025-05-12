"use client";

import React from 'react';
import { OrderData } from '@/lib/actions/order';
import { OrderStatusChip } from '@/components/ui/status-chip';
import { formatCurrency, formatDisplayDate, formatDisplayTime, formatScheduledDate, formatScheduledTime } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardBody, Chip, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface OrderCardProps {
    order: OrderData;
    onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
    const locale = useLocale();
    const t = useTranslations('app/components/order-user');
    
    // Animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div variants={itemVariants} layout>
            <Card 
                isPressable 
                onPress={onClick}
                className="w-full cursor-pointer transform transition-transform hover:scale-[1.01] active:scale-[0.99] border border-default-200"
                shadow="sm"
            >
                <CardBody className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">
                                    {/* Use store_id as fallback if store_name doesn't exist */}
                                    {order.store_name || "Bakery"}
                                </h3>
                                <Chip size="sm" color="primary" variant="flat">
                                    #{order.seq_id}
                                </Chip>
                            </div>
                            
                            <div className="flex items-center gap-1 text-default-500 text-sm">
                                <Icon icon="solar:calendar-linear" className="w-4 h-4" />
                                {formatScheduledDate(order.scheduled_time, locale)}
                                <span className="mx-1">•</span>
                                <Icon icon="solar:clock-linear" className="w-4 h-4" />
                                {formatScheduledTime(order.scheduled_time, locale)}
                            </div>
                            
                            <div className="flex items-center gap-1 text-default-500 text-sm mt-1">
                                <Icon icon="solar:tag-price-linear" className="w-4 h-4" />
                                {formatCurrency(order.priceData?.totalInclVat || 0)}
                                
                                {order.isDelivery && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <Icon icon="solar:delivery-linear" className="w-4 h-4" />
                                        {order.isPostDelivery ? 'Post Delivery' : 'Delivery'}
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <OrderStatusChip status={order.order_status} />
                            
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-default-400">
                                    {order.productsData.length} {order.productsData.length === 1 ? t('item') : t('items')}
                                </span>
                                
                                {/* <Link href={`/orders/${order.id}?storeId=${order.store_id}`}>
                                    <Button 
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        className="min-w-0 px-2"
                                        endContent={<Icon icon="solar:arrow-right-linear" className="w-4 h-4" />}
                                        onPress={() => {}} // Prevent triggering the card click
                                    >
                                        {t('view')}
                                    </Button>
                                </Link> */}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </motion.div>
    );
}; 