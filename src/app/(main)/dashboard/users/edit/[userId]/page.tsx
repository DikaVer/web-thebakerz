import React from "react";

interface UserOnboardProps {
    params: Promise<{
        userId: string
    }>
}


export default async function Page(props: UserOnboardProps) {
    const params = await props.params;

    const { userId } = params

    return (
            <div className="flex flex-col min-h-screen relative z-10 items-center">
                Хуй
            </div>
    );
}