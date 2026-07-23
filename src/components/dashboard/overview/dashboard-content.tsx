/**
 * @fileoverview Layout component for the dashboard overview page.
 *
 * Arranges the total amount card, the order completion bar chart, and the
 * orders table into a responsive grid using the fetched OverviewData, and
 * renders an error card when the data contains an error.
 */
'use client';

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/react";
import TotalAmountCard from '@/components/dashboard/overview/total-amount-card';
import CompletionBarChart from '@/components/dashboard/overview/completion-bar-chart';
import OrdersTable from '@/components/dashboard/overview/orders-table';
import { OverviewData } from '@/lib/dashboard/overview-dash';

interface DashboardContentProps {
    overviewData: OverviewData;
}

export default function DashboardContent({ overviewData }: DashboardContentProps) {
    if (overviewData.error) {
        return (
            <div className="p-4">
                <Card shadow="none">
                    <CardHeader>Error</CardHeader>
                    <CardBody>
                        <p className="text-danger">{overviewData.error}</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Total Amount Card */}
                <div className="md:col-span-1">
                    <TotalAmountCard totalAmount={overviewData.totalAmountProcessed} />
                </div>

                {/* Completion Chart */}
                <div className="md:col-span-2">
                    <CompletionBarChart 
                        completed={overviewData.completedOrdersCount} 
                        notCompleted={overviewData.nonCompletedOrdersCount} 
                    />
                </div>
            </div>

            {/* Orders Table */}
            <Card shadow="none">
                <CardHeader>All Orders</CardHeader>
                <CardBody>
                    <OrdersTable orders={overviewData.allOrders} />
                </CardBody>
            </Card>
        </div>
    );
} 