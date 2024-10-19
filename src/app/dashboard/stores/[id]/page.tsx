
import React, {Suspense} from "react";
import StoreSkeleton from "@/components/skeletons";
import StoreTransit from "@/components/store-transit";
import { auth } from "@/auth";

export const revalidate = 0;

interface StorePageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: StorePageProps) {

    const session = await auth();

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
            <Suspense fallback={<StoreSkeleton/>}>
                <StoreTransit
                    id={params.id}
                    // @ts-ignore
                    role={session?.user?.role}
                    isDashboard={true}
                />
            </Suspense>
        </div>
    );

}