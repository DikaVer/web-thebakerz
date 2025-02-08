"use server";
import * as React from "react";
import UserLinkStore from "@/components/dashboard/store/user-link-store";
import {fetchFilteredUsersDefault} from "@/lib/actions-server-only/user-actions";

interface StoreLinkPageProps {
    params: Promise<{
        id: string
    }>,
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}

export default async function Page(props: StoreLinkPageProps) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const query = searchParams?.query || '';

    const users = await fetchFilteredUsersDefault(query, 1);


    return (

        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-lg">
            <div className="bg-white p-8 w-full max-w-lg rounded-lg shadow-md">
                <h2 className="text-3xl font-semibold mb-8 text-center">Link User to the store {params.id}</h2>
                    <UserLinkStore userList={users}  storeId={params.id}/>

            </div>
        </div>
    );
}
