// components/ProductTableSkeleton.tsx

import React from 'react';

interface ProductTableSkeletonProps {
    rowCount?: number;
    columnCount?: number;
}

const ProductTableSkeleton: React.FC<ProductTableSkeletonProps> = ({
                                                                       rowCount = 10,
                                                                       columnCount = 4,
                                                                   }) => {
    // Create an array for header placeholders
    const headerPlaceholders = Array.from({ length: columnCount });
    // Create an array for row placeholders
    const rowPlaceholders = Array.from({ length: rowCount });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                <tr>
                    {headerPlaceholders.map((_, idx) => (
                        <th key={idx} className="px-6 py-3 border-b bg-gray-50">
                            <div className="h-12 bg-gray-300 rounded animate-pulse" />
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rowPlaceholders.map((_, rowIdx) => (
                    <tr key={rowIdx} className="border-b">
                        {headerPlaceholders.map((_, colIdx) => (
                            <td key={colIdx} className="px-6 py-4">
                                <div className="h-12 bg-gray-300 rounded animate-pulse" />
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTableSkeleton;
