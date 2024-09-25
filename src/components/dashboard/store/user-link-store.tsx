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
import Search from "@/components/dashboard/search";
import {FormError} from "@/components/authentication/form-error";
import {FormSuccess} from "@/components/authentication/form-success";

interface UserPopoverProps {
    userList: UsersTable[];
    storeId: string;
}

export default function UserLinkStore({ userList, storeId}: UserPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsersTable | null>(null);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [isLoading, setLoading] = useState<boolean>(false);

    const handleUserSelect = (user: UsersTable) => {
        setSelectedUser(user);
        setOpen(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!selectedUser) {
                setSuccess(undefined);
                setError("Please select a user");
                throw new Error("Please select a user");
            }

            const response = await fetch(`/api/store/link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    storeId: storeId,
                    userId: selectedUser.id
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message);
                setSuccess(undefined);
            } else {
                setError(undefined);
                setSuccess("User linked successfully");
            }
        } catch (error) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

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
                            ? `email: ${selectedUser.email} || id: ${selectedUser.id}`
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
                                        onSelect={() => handleUserSelect(user)}
                                    >
                                        Name: {user.name} || email: {user.email} || id: {user.id} || role: {user.role}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedUser && selectedUser.id === user.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <FormError message={error}/>
            <FormSuccess message={success}/>
            <div>
                <Button
                    type="submit"
                    className=" w-full"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    Link User
                </Button>
            </div>
        </div>
    );
}