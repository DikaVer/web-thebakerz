// StoresTableSkeleton.tsx

import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function StoreSkeleton() {
    return (
        <div>
            <div className="h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
                {/* Background Skeleton */}
                <div className="absolute inset-0">
                    <Skeleton height="100%"/>
                </div>
            </div>
            <div>
                <Skeleton height={40} width={200} />
            </div>
        </div>
    );
}