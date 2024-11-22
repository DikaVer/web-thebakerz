'use client';

import { usePathname, useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";


export default function LinkStore({ store_id }: { store_id: string }) {
    const pathname = usePathname();
    const { refresh, push } = useRouter();
    const handleLink = (store_id: string) => {
        push(`${pathname}/${store_id}/linkUser`);
        refresh();
    };
    return (
        <div className="">
            <Button
                onClick={() => handleLink(store_id)}
                className={""}>
                Link
            </Button>
        </div>
    );
}
