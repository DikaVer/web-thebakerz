import React from 'react';
import { getOverviewData } from "@/lib/dashboard/overview-dash";
import DashboardContent from '@/components/dashboard/overview/dashboard-content';

export default async function OverviewPage() {
    const overviewData = await getOverviewData();
    
    // Pass the data to our client component
    return <DashboardContent overviewData={overviewData} />;
} 