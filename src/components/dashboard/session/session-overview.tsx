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
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Session Overview</h1>

            <div className="space-y-4 mb-4">
                {/* User Information */}
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">User Information</h2>
                    <div className="flex justify-between">
                        <p className="text-gray-600">User ID:</p>
                        <p className="text-gray-900">{userId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Name:</p>
                        <p className="text-gray-900">{name}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Email:</p>
                        <p className="text-gray-900">{email}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Email Verified:</p>
                        <p className="text-gray-900">{format(new Date(emailVerified), 'Pp')}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Role:</p>
                        <p className="text-gray-900 capitalize">{role}</p>
                    </div>
                </div>

                {/* Session Information */}
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-2">Session Information</h2>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Session ID:</p>
                        <p className="text-gray-900">{sessionId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">User ID (from session):</p>
                        <p className="text-gray-900">{sessionUserId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Expires:</p>
                        <p className="text-gray-900">{format(new Date(expires), 'Pp')}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-600">Session Token:</p>
                        <p className="text-gray-900 break-words">{sessionToken}</p>
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