'use client';

import { usePathname, useRouter } from 'next/navigation';

import {Button} from "@/components/ui/button";


export default function CreateStore() {
    const pathname = usePathname();
    const { refresh, push } = useRouter();
    const handleStoreCreation = () => {
        push(`${pathname}/createStore`);
        refresh();
    };
    return (
        <div className="">
            <Button
                onClick={() => handleStoreCreation()}
                className={""}>
                Create Store
            </Button>
        </div>
    );
}
