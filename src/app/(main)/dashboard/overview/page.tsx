/**
 * @fileoverview Admin overview page at /dashboard/overview.
 *
 * Server component that fetches aggregated platform metrics via
 * getOverviewData and passes them to the DashboardContent client component
 * for rendering.
 */
import React from 'react';
import { getOverviewData } from "@/lib/dashboard/overview-dash";
import DashboardContent from '@/components/dashboard/overview/dashboard-content';

export default async function OverviewPage() {
    const overviewData = await getOverviewData();
    
    // Pass the data to our client component
    return <DashboardContent overviewData={overviewData} />;
} 