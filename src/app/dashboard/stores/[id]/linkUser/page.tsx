"use server";
import {Button} from "@/components/ui/button";
import * as React from "react";
import UserLinkStore from "@/components/dashboard/store/user-link-store";
import {fetchFilteredUsers, fetchUserData} from "@/lib/dashboard/user-dashboard";

interface StoreLinkPageProps {
    params: {
        id: string
    },
    searchParams?: {
        query?: string;
        page?: string;
    };
}

export default async function Page({params, searchParams}: StoreLinkPageProps) {

    const query = searchParams?.query || '';

    const users = await fetchFilteredUsers(query, 1);


    return (

        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center rounded-lg">
            <div className="bg-white p-8 w-full max-w-lg rounded-lg shadow-md">
                <h2 className="text-3xl font-semibold mb-8 text-center text-black">Link User to the store {params.id}</h2>
                    <UserLinkStore userList={users}  />

            </div>
        </div>
    );
}
