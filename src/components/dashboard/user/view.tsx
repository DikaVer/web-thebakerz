'use client';

import { usePathname, useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";


export default function View({ user_id }: { user_id: string }) {
    const pathname = usePathname();
    const { refresh, push } = useRouter();
    const handleView = (user_id: string) => {
        push(`${pathname}/${user_id}`);
        refresh();
    };
    return (
        <div className="">
            <Button
                onClick={() => handleView(user_id)}
                className={""}>
                View
            </Button>
        </div>
    );
}
