'use client';

import { usePathname, useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";


export default function ViewStore({ store_id }: { store_id: string }) {
    const pathname = usePathname();
    const { refresh, push } = useRouter();
    const handleView = (store_id: string) => {
        push(`${pathname}/${store_id}`);
        refresh();
    };
    return (
        <div className="">
            <Button
                onClick={() => handleView(store_id)}
                className={""}>
                View
            </Button>
        </div>
    );
}
