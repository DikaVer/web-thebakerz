'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import {CaretSortIcon} from "@radix-ui/react-icons";
import {UsersTable} from "@/lib/dashboard/user-dashboard";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDebouncedCallback} from "use-debounce";
import Search from "@/components/dashboard/search";

interface UserPopoverProps {
    userList: UsersTable[];
}

export default function UserLinkStore({ userList}: UserPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const handleUserSelect = (userId: string) => {
        setSelectedUser(userId);
        setOpen(false);
    };

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

    return (
        <div className="flex flex-col gap-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedUser
                            ? userList.find((user) => user.id === selectedUser)?.id
                            : "Select user..."}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <Search placeholder={"Search for user..."}/>
                        <CommandList>
                            <CommandEmpty>No user found.</CommandEmpty>
                            <CommandGroup>
                                {userList.map((user) => (
                                    <CommandItem
                                        key={user.id}
                                        value={user.id}
                                        onSelect={() => handleUserSelect(user.id)}
                                    >
                                        Name: {user.name} || email: {user.email} || id: {user.id} || role: {user.role}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedUser === user.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <div>
                <Button
                    type="submit"
                    className=" w-full"
                >
                    Link User
                </Button>
            </div>
        </div>
    );
}