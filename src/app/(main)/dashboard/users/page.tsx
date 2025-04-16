'use client';
import React from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    getKeyValue,
    Input,
    Tooltip,
    Button,
    Spacer,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useAsyncList } from "@react-stately/data";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { searchUsersByEmailPaginated } from "@/lib/dashboard/user-dash";
import {useRouter} from "next/navigation";
import GradientText from "@/components/ui/gradient-text";

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    // other properties as needed
}

// Custom hook to debounce a value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function Page() {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [hasMore, setHasMore] = React.useState<boolean>(false);
    const [searchEmail, setSearchEmail] = React.useState<string>("");
    const t = useTranslations("UsersDashboard");
    const router = useRouter();

    // Debounce the search term by 300ms
    const debouncedSearchEmail = useDebounce(searchEmail, 1000);

    const list = useAsyncList<User>({
        async load({ signal, cursor }) {
            setIsLoading(true);

            const res = await searchUsersByEmailPaginated(
                debouncedSearchEmail,
                cursor,
                10
            );

            setHasMore(res.nextCursor !== null);
            setIsLoading(false);
            return {
                items: res.users,
                cursor: res.nextCursor,
            };
        },
    });

    const [loaderRef, scrollerRef] = useInfiniteScroll({
        hasMore,
        onLoadMore: list.loadMore,
    });

    // Reload list when the debounced search term changes
    React.useEffect(() => {
        list.reload();
    }, [debouncedSearchEmail]);

    return (
        <div className="flex flex-col gap-y-4 justify-center items-center min-h-svh">
            <div className="flex flex-col sm:flex-row gap-y-4 justify-between w-full">
                <div className="flex flex-col w-full justify-start">
                    <p className="text-base font-medium text-default-700">User Manager</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        Onboard &amp; Manage users
                    </p>
                </div>
                <div className="flex justify-end items-center w-full max-w-[320px] gap-x-2">
                    <Input
                        classNames={{
                            mainWrapper: "rounded-xl border-0 shadow-small",
                            inputWrapper: "bg-content1",
                        }}
                        placeholder={t("Search User")}
                        type="text"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        startContent={
                            <Icon
                                icon="solar:magnifer-broken"
                                width={24}
                                className="text-default-400"
                            />
                        }
                    />
                    <Button
                        variant="light"
                        className={'shadow-medium'}
                        isIconOnly
                        onPress={() => list.reload()}
                    >
                        <Icon icon="solar:refresh-linear" width={24} className="text-default-400" />
                    </Button>
                </div>
            </div>
            <Table
                isHeaderSticky
                aria-label="Users table with infinite scroll"
                baseRef={scrollerRef}
                bottomContent={
                    hasMore ? (
                        <div className="flex w-full justify-center">
                            <Spinner ref={loaderRef} color="white" />
                        </div>
                    ) : null
                }
                className=""
                classNames={{
                    base: "mb-16",
                    wrapper: "shadow-medium",
                    table: "overflow-scroll",
                }}
            >
                <TableHeader>
                    <TableColumn key="id">ID</TableColumn>
                    <TableColumn key="username">Name</TableColumn>
                    <TableColumn key="email">Email</TableColumn>
                    <TableColumn key="role">Role</TableColumn>
                    <TableColumn key="actions">Actions</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    items={list.items}
                    loadingContent={<Spinner color="white" />}
                >
                    {(item: User) => (
                        <TableRow key={item.id}>
                            {(columnKey) => {
                                if (columnKey === "actions") {
                                    return (
                                        <TableCell>
                                            <div className="flex items-center justify-start gap-2">
                                                {(item.role === 'bakerz') ? (
                                                    <Tooltip content="Edit">
                                                        <button
                                                            onClick={() => {
                                                                router.push(`/dashboard/users/edit/${item.id}`);
                                                            }}
                                                        >
                                                            <Icon
                                                                icon={"solar:pen-new-round-linear"}
                                                                width={16}
                                                                className="text-default-500"
                                                            />
                                                        </button>
                                                    </Tooltip>
                                                ) : (
                                                    <Spacer x={4} />
                                                )
                                                }
                                                {(item.role !== 'bakerz' && item.role !== 'admin') &&
                                                    <Tooltip content="Onboard">
                                                        <button
                                                            onClick={() => {
                                                                router.push(`/dashboard/users/onboard/${item.id}`);
                                                            }}
                                                        >
                                                            <Icon
                                                                icon={"solar:chef-hat-heart-broken"}
                                                                width={16}
                                                                className="text-default-500"
                                                            />
                                                        </button>
                                                    </Tooltip>
                                                }
                                                {/* Additional action buttons for edit and delete can be added similarly */}
                                            </div>
                                        </TableCell>
                                    );
                                }
                                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
                            }}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <GradientText>
                <p>Search by email to find the user.</p>
            </GradientText>
        </div>
    );
}
