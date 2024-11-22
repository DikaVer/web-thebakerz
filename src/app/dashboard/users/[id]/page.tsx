import {notFound} from "next/navigation";
import React from "react";
import {fetchUserData} from "@/lib/actions-server-only/user-actions";
import UserViewDashboard from "@/components/dashboard/user/user-view";

interface UserPageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: UserPageProps) {

    const userData = await fetchUserData(params.id);

    if (!userData) {

        return notFound();

    } else {
        // @ts-ignore
        return (
                <>
                    <UserViewDashboard userDataProps={userData}/>
                </>
        );
    }
}