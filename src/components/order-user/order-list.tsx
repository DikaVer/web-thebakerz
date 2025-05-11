"use client";

import React, { useState } from 'react';
import { OrderData } from '@/lib/actions/order';
import { useTranslations } from 'next-intl';
import { Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';
import { OrderCard } from '@/components/order-user/order-card';
import { OrderDetailsModal } from '@/components/order-user/order-details-modal';

interface OrdersListProps {
    orders: OrderData[];
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
    const t = useTranslations('app/components/order-user');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

    // Filter orders based on search term
    const filteredOrders = orders.filter(order => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            order.store_order_id?.toString().includes(searchTermLower) ||
            order.store_id.toLowerCase().includes(searchTermLower) ||
            order.scheduled_time.date.includes(searchTermLower)
        );
    });

    // Sort orders by date (newest first)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dateA = new Date(`${a.scheduled_time.date}T${a.scheduled_time.time}`);
        const dateB = new Date(`${b.scheduled_time.date}T${b.scheduled_time.time}`);
        return dateB.getTime() - dateA.getTime();
    });

    const openOrderDetails = (order: OrderData) => {
        setSelectedOrder(order);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="flex flex-col space-y-4 md:space-y-6">
                <h1 className="text-2xl font-semibold">{t('myOrders')}</h1>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <Input
                        placeholder={t('searchOrders')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
                        isClearable
                        onClear={() => setSearchTerm('')}
                        className="max-w-md"
                    />
                    
                    <div className="text-sm text-default-500">
                        {sortedOrders.length} {sortedOrders.length === 1 ? t('order') : t('orders')}
                    </div>
                </div>

                {sortedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon icon="solar:checklist-minimalistic-linear" className="text-default-300 w-16 h-16 mb-4" />
                        <h3 className="text-xl font-medium mb-2">{t('noOrdersFound')}</h3>
                        <p className="text-default-500 max-w-md">
                            {searchTerm ? t('noOrdersMatchSearch') : t('noOrdersYet')}
                        </p>
                    </div>
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        <AnimatePresence>
                            {sortedOrders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={() => openOrderDetails(order)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={closeOrderDetails}
            />
        </div>
    );
}; 