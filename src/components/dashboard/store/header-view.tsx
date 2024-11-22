'use client';

import { useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";
import {IconArrow, IconThreeDots} from "@/components/ui/icons";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


export default function ViewHeaderStore({ store_id }: { store_id: string }) {
    const { refresh, push } = useRouter();
    const handleBack = () => {
        push(`/dashboard/stores`);
        refresh();
    };
    return (
        <div className={"flex flex-row justify-between my-4"}>
            <Button className={"w-18 px-0"} variant={"secondary"} onClick={handleBack}>
                <IconArrow className={"w-4"} color={"black"}/>
                Back
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-secondary w-10 px-1 cm:px-1.5 opacity-80" variant="outline">
                        <IconThreeDots className={"w-7-5 h-7-5"}/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

