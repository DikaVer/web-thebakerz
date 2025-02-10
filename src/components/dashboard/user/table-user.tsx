"use client";

import type {Selection} from "@heroui/react";
import type {ColumnsKey} from "./user-data";


import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    User,
    Pagination,
    Tooltip,
    useButton,
} from "@heroui/react";
import {SearchIcon} from "@heroui/shared-icons";
import React, {useMemo, useRef, useCallback, useState} from "react";
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import {CopyText} from "@/components/table/copy-text";
import {
    EyeFilledIcon,
    EditLinearIcon,
    DeleteFilledIcon,
    ArrowDownIcon,
    ArrowUpIcon
} from "@/components/ui/icons";

import {useMemoizedCallback} from "@/lib/hooks/use-memoized-callback";

import {columns, INITIAL_VISIBLE_COLUMNS} from "./user-data";
import {UsersData} from "@/lib/definitions";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDebouncedCallback} from "use-debounce";

export default function UserTable(
    {
        currentPage,
        totalPage,
        users
    }: {
        currentPage: number;
        totalPage: number;
        users: UsersData[];
    }
) {
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));

    const [userRoleFilter, setUserRoleFilter] = React.useState("all");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [startDateFilter, setStartDateFilter] = React.useState("all");

    const headerColumns = useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns
            .map((item) => {

                return item;
            })
            .filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const itemFilter = useCallback(
        (col: UsersData) => {
            let allUserRole = userRoleFilter === "all";
            let allStartDate = startDateFilter === "all";

            return (
                (allUserRole || userRoleFilter === col.role.toLowerCase()) &&
                (allStartDate ||
                    new Date(
                        new Date().getTime() -
                        +(startDateFilter.match(/(\d+)(?=Days)/)?.[0] ?? 0) * 24 * 60 * 60 * 1000,
                    ) <= new Date(col.date))
            );
        },
        [startDateFilter, statusFilter, userRoleFilter],
    );

    const filteredItems = useMemo(() => {
        let filteredUsers = [...users];

        filteredUsers = filteredUsers.filter(itemFilter);

        return filteredUsers;
    }, [itemFilter]);


    const eyesRef = useRef<HTMLButtonElement | null>(null);
    const editRef = useRef<HTMLButtonElement | null>(null);
    const deleteRef = useRef<HTMLButtonElement | null>(null);
    const {getButtonProps: getEyesProps} = useButton({ref: eyesRef});
    const {getButtonProps: getEditProps} = useButton({ref: editRef});
    const {getButtonProps: getDeleteProps} = useButton({ref: deleteRef});

    const renderCell = useMemoizedCallback((user: UsersData, columnKey: React.Key) => {
        const userKey = columnKey as ColumnsKey;


        switch (userKey) {
            case "userID":
                return <>
                    {user.id}
                    </>;
            case "userInfo":
                return (
                    <User
                        avatarProps={{radius: "lg", src: user.image ? user.image : undefined}}
                        classNames={{
                            name: "text-default-foreground",
                            description: "text-default-500",
                        }}
                        description={user.email}


                        name={user.name}
                    >
                        {user.email}
                    </User>
                );
            case "startDate":
                return (
                    <div className="flex items-center gap-1">
                        <Icon
                            className="h-[16px] w-[16px] text-default-300"
                            icon="solar:calendar-minimalistic-linear"
                        />
                        <p className="text-nowrap text-small capitalize text-default-foreground">
                            {new Intl.DateTimeFormat("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            }).format(user.date as unknown as Date)}
                        </p>
                    </div>
                );
            case "userRole":
                return <div className="text-default-foreground">{user.role}</div>;
            case "actions":
                return (
                    <div className="flex items-center justify-end gap-2">
                        <EyeFilledIcon
                            {...getEyesProps()}
                            className="cursor-pointer text-default-400"
                            height={18}
                            width={18}
                        />
                        <EditLinearIcon
                            {...getEditProps()}
                            className="cursor-pointer text-default-400"
                            height={18}
                            width={18}
                        />
                        <DeleteFilledIcon
                            {...getDeleteProps()}
                            className="cursor-pointer text-default-400"
                            height={18}
                            width={18}
                        />
                    </div>
                );
        }
    });

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);


    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const onNextPage = useMemoizedCallback(() => {
        if (currentPage < totalPage) {
            createPageURL(currentPage + 1);
        }
    });

    const onPreviousPage = useMemoizedCallback(() => {
        if (currentPage > 1) {
            createPageURL(currentPage - 1);
        }
    });

    const topContent = useMemo(() => {
        return (
            <div className="flex items-center gap-4 overflow-auto px-[6px] py-[4px]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4">
                        <Input
                            className="min-w-[200px]"
                            endContent={<SearchIcon className="text-default-400" width={16} />}
                            placeholder="Search"
                            size="sm"
                            onChange={(e) => {
                                handleSearch(e.target.value);
                            }}
                            defaultValue={searchParams.get('query')?.toString()}
                        />
                    </div>
                </div>
            </div>
        );
    }, [
        visibleColumns,
        headerColumns,
        statusFilter,
        userRoleFilter,
        startDateFilter,
        setUserRoleFilter,
        setStatusFilter,
        setStartDateFilter,
        setVisibleColumns,
    ]);

    const topBar = useMemo(() => {
        return (
            <div className="mb-[18px] flex items-center justify-between">
                <div className="flex w-[226px] items-center gap-2">
                    <h1 className="text-2xl font-[700] leading-[32px]">Users</h1>
                </div>
                {/*<Button color="primary" endContent={<Icon icon="solar:add-circle-bold" width={20} />}>*/}
                {/*    Add Member*/}
                {/*</Button>*/}
            </div>
        );
    }, []);


    const bottomContent = useMemo(() => {
        return (
            <div className="flex flex-col items-center justify-between gap-2 px-2 py-2 sm:flex-row">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={currentPage}
                    total={totalPage}
                    onChange={createPageURL}
                />
                <div className="flex items-center justify-end gap-6">
          {/*<span className="text-small text-default-400">*/}
          {/*  {filterSelectedKeys === "all"*/}
          {/*      ? "All items selected"*/}
          {/*      : `${filterSelectedKeys.size} of ${filteredItems.length} selected`}*/}
          {/*</span>*/}
                    <div className="flex items-center gap-3">
                        <Button isDisabled={currentPage === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                            Previous
                        </Button>
                        <Button isDisabled={currentPage === totalPage} size="sm" variant="flat" onPress={onNextPage}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [ currentPage, totalPage, filteredItems.length, onPreviousPage, onNextPage]);


    return (
        <div className="h-full w-full p-6">
            {topBar}
            <Table
                isHeaderSticky
                aria-label="Example table with custom cells, pagination and sorting"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                classNames={{
                    td: "before:bg-transparent",
                }}
                selectionMode="none"
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "end" : "start"}
                            className={cn([
                                column.uid === "actions" ? "flex items-center justify-end px-[20px]" : "",
                            ])}
                        >
                            {column.uid === "memberInfo" ? (
                                <div
                                    className="flex w-full cursor-pointer items-center justify-between"
                                >
                                    {column.name}
                                    {column.sortDirection === "ascending" ? (
                                        <ArrowUpIcon className="text-default-400" />
                                    ) : (
                                        <ArrowDownIcon className="text-default-400" />
                                    )}
                                </div>
                            ) : column.info ? (
                                <div className="flex min-w-[108px] items-center justify-between">
                                    {column.name}
                                    <Tooltip content={column.info}>
                                        <Icon
                                            className="text-default-300"
                                            height={16}
                                            icon="solar:info-circle-linear"
                                            width={16}
                                        />
                                    </Tooltip>
                                </div>
                            ) : (
                                column.name
                            )}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"No users found"} items={users}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
