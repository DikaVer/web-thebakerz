"use client";

import React, { useState, useMemo } from 'react';
import {
    Table, 
    TableHeader, 
    TableColumn, 
    TableBody, 
    TableRow, 
    TableCell, 
    Pagination,
    getKeyValue,
    Input, 
    SortDescriptor
} from "@heroui/react";
import { OrderData } from '@/lib/actions/order';
import { formatCurrency, formatDisplayDateTime } from '@/lib/utils';
import { OrderStatusChip } from '@/components/ui/status-chip';
import { Icon } from '@iconify/react';
import { useLocale } from "@react-aria/i18n";

interface OrdersTableProps {
    orders: OrderData[];
}

const columns = [
    { key: "seq_id", label: "Order ID" },
    { key: "store_id", label: "Store ID", sortable: true },
    { key: "customer_email", label: "Customer Email", sortable: true },
    { key: "createdAt", label: "Created At", sortable: true },
    { key: "scheduled_time", label: "Scheduled For" },
    { key: "order_status", label: "Status", sortable: true },
    { key: "totalInclVat", label: "Total Amount", sortable: true },
];

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
    const locale = useLocale();
    const [page, setPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: "createdAt", direction: "descending" });
    const rowsPerPage = 10;

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredOrders = [...orders];

        if (hasSearchFilter) {
            filteredOrders = filteredOrders.filter((order) => {
                const search = filterValue.toLowerCase();
                return (
                    order.id.toLowerCase().includes(search) ||
                    order.store_id.toLowerCase().includes(search) ||
                    order.customer_email.toLowerCase().includes(search) ||
                    order.order_status.toLowerCase().includes(search)
                );
            });
        }

        return filteredOrders;
    }, [orders, filterValue]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = getSortValue(a, sortDescriptor.column);
            const second = getSortValue(b, sortDescriptor.column);
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, filteredItems]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return sortedItems.slice(start, end);
    }, [page, sortedItems]);

    const pages = Math.ceil(sortedItems.length / rowsPerPage);

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

     const onClear = React.useCallback(()=>{
        setFilterValue("")
        setPage(1)
      },[])

    const renderCell = React.useCallback((order: OrderData, columnKey: React.Key) => {
        switch (columnKey) {
            case "seq_id":
                return order.seq_id > 0 ? `#${order.seq_id}` : order.id.substring(0, 8) + '...';
            case "createdAt":
                return formatDisplayDateTime(order.createdAt, locale.locale);
            case "scheduled_time":
                return `${order.scheduled_time.date} ${order.scheduled_time.time}`;
            case "order_status":
                return <OrderStatusChip status={order.order_status} />;
            case "totalInclVat":
                return formatCurrency(order.priceData?.totalInclVat || 0);
            default:
                //@ts-ignore
                return getKeyValue(order, columnKey);
        }
    }, [locale]);

    const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search"
            startContent={<Icon icon="solar:magnifer-linear" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
      </div>
      );
    }, [
      filterValue,
      onSearchChange,
      onClear
    ]);

    return (
        <Table 
            aria-label="Orders Table"
            isHeaderSticky
            bottomContent={
                pages > 1 ? (
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                ) : null
            }
            classNames={{
                wrapper: "max-h-[500px]",
            }}
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
        >
            <TableHeader columns={columns}>
                {(column) => 
                    <TableColumn 
                        key={column.key} 
                        align={column.key === "totalInclVat" ? "end" : "start"}
                        allowsSorting={column.sortable}
                    >
                        {column.label} 
                    </TableColumn>}
            </TableHeader>
            <TableBody items={items} emptyContent="No orders found">
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

function getSortValue(order: OrderData, column: React.Key | undefined): any {
    if (!column) return null;
    switch (column) {
        case "createdAt":
            return new Date(order.createdAt).getTime();
        case "totalInclVat":
            return order.priceData?.totalInclVat || 0;
        case "store_id":
        case "customer_email":
        case "order_status":
            return getKeyValue(order, column)?.toString().toLowerCase();
        default:
            //@ts-ignore
            return getKeyValue(order, column);
    }
}

export default OrdersTable; 