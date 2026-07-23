/**
 * @fileoverview Admin page at /dashboard/users/onboard/[userId] for onboarding a user as a baker.
 *
 * Server component that loads the user by id and renders the OnboardPage
 * form; users that do not exist or already have the "bakerz" role get the
 * NotFound page instead.
 */
import React from "react";
import OnboardPage from "@/components/dashboard/onboard/onboard-page";
import {getUserFromId} from "@/lib/dashboard/user-dash";
import NotFound from "@/app/(error_layout)/not-found";

interface UserOnboardProps {
    params: Promise<{
        userId: string
    }>
}


export default async function Page(props: UserOnboardProps) {
    const params = await props.params;

    const { userId } = params

    const user = await getUserFromId(userId);

    if (!user || user.role === "bakerz") {
        return NotFound();
    }

    return (
            <div className="flex flex-col min-h-screen relative z-10 items-center w-full">
                <OnboardPage user={user} className={'w-full max-w-md mb-16'} />
            </div>
    );
}