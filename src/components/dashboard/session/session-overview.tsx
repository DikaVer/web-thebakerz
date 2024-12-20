"use client";
import React from 'react';
import {Session} from "@/lib/definitions";
import {Button} from "@/components/ui/button";
import { format } from 'date-fns';
import {toast} from "sonner";

const SessionDetails: React.FC<{ session: Session | null}> = ({ session }) => {
    if (!session)
        return <div>Session is not found</div>;

    const {
        user: { id: userId, name, email, emailVerified, image, role },
        id: sessionId,
        userId: sessionUserId,
        expires,
        sessionToken,
    } = session;

    return (
        <div className="mx-auto mt-8 p-6 ">
            <h1 className="text-2xl font-bold mb-6">Session Overview</h1>

            <div className="space-y-4 mb-4">
                {/* User Information */}
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">User Information</h2>
                    <div className="flex justify-between">
                        <p className="">User ID:</p>
                        <p className="text-grayText">{userId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Name:</p>
                        <p className="text-grayText">{name}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Email:</p>
                        <p className="text-grayText">{email}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Email Verified:</p>
                        <p className="text-grayText">{format(new Date(emailVerified), 'Pp')}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Role:</p>
                        <p className="text-grayText capitalize">{role}</p>
                    </div>
                </div>

                {/* Session Information */}
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">Session Information</h2>
                    <div className="flex justify-between">
                        <p className="">Session ID:</p>
                        <p className="text-grayText">{sessionId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">User ID (from session):</p>
                        <p className="text-grayText">{sessionUserId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Expires:</p>
                        <p className="text-grayText">{format(new Date(expires), 'Pp')}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="">Session Token:</p>
                        <p className="text-grayText break-words">{sessionToken}</p>
                    </div>
                </div>
            </div>
            <Button
                onClick={() => {
                    localStorage.clear();
                    toast.success('Local Storage Cleared');
                }}
            >
                Clear Local Storage
            </Button>
        </div>
    );
};

export default SessionDetails;