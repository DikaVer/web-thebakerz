'use client';

import { usePathname, useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";
import {IconArrow, IconThreeDots} from "@/components/ui/icons";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


export default function ViewHeaderUser({ user_id }: { user_id: string }) {
    const { refresh, push } = useRouter();
    const handleBack = () => {
        push(`/dashboard/users`);
        refresh();
    };
    return (
        <div className={"flex flex-row justify-between"}>
            <Button className={"w-18 px-0"} variant={"secondary"} onClick={handleBack}>
                <IconArrow className={"w-4 text-text"} />
                Back
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-secondary w-10 px-1 cm:px-1.5 opacity-80" variant="outline">
                        <IconThreeDots className={"w-7-5 h-7-5 text-background"}/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    <DropdownMenuItem>Ban</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

