"use client";

import React from 'react';
import { Card, CardBody, CardHeader } from "@heroui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';

interface CompletionBarChartProps {
    completed: number;
    notCompleted: number;
}

const CompletionBarChart: React.FC<CompletionBarChartProps> = ({ completed, notCompleted }) => {

    const data = [
        {
            name: 'Completed',
            count: completed,
        },
        {
            name: 'Not Completed',
            count: notCompleted,
        },
    ];

    return (
        <Card shadow="none" className="h-full">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                 <p className="text-tiny uppercase font-bold">Completion</p>
                 <small className="text-default-500">Completed and not completed orders</small>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
                 <ResponsiveContainer width="100%" height={250}> 
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false}/>
                        <Tooltip 
                             contentStyle={{ backgroundColor: 'hsl(var(--heroui-background))', border: '1px solid hsl(var(--heroui-default-200))', borderRadius: '0.5rem' }}
                             itemStyle={{ color: 'hsl(var(--heroui-foreground))' }}
                        />
                        {/* <Legend /> */}
                        <Bar dataKey="count" fill="hsl(var(--heroui-primary-500))" radius={[4, 4, 0, 0]} barSize={40}/>
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};

export default CompletionBarChart; 