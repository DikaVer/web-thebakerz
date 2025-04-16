'use client';

import React from 'react';
import { Card, CardBody, CardFooter } from '@heroui/react';

export function StorePanelSkeleton() {
    return (
        <Card shadow="sm" className="w-full h-full animate-pulse">
            <CardBody className="overflow-visible p-0 relative h-48 bg-default-300 rounded-t-xl">
                {/* Placeholder for Image */}
            </CardBody>
            <CardFooter className="text-sm flex-col !items-start p-4 gap-2 bg-white rounded-b-xl">
                {/* Placeholder for Title */}
                <div className="h-5 w-3/4 bg-default-300 rounded"></div>
                {/* Placeholder for Description */}
                <div className="h-3 w-1/2 bg-default-200 rounded"></div>
                {/* Placeholder for Info line */}
                <div className="h-3 w-full bg-default-200 rounded mt-1"></div>
            </CardFooter>
        </Card>
    );
} 