
import {notFound} from "next/navigation";
import React from "react";
import {fetchUserData} from "@/lib/dashboard/user";
import Image from "next/image";
import {IconArrow, IconAvatar, IconThreeDots} from "@/components/ui/icons";
import {fetchAddressData} from "@/lib/actions/session-store";
import UserAddresses from "@/components/dashboard/user/user-address";
import {AddressDataStorageField} from "@/lib/definitions";
import {kv} from "@vercel/kv";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import ViewHeader from "@/components/dashboard/user/header-view";

interface UserPageProps {
    params: {
        id: string
    }
}

export default async function Page({params}: UserPageProps) {

    const userData = await fetchUserData(params.id);

    const addressData = await fetchAddressData(userData.addressToken);

    if (!userData) {

        return notFound();

    } else {
        // @ts-ignore
        return (
                <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
                    <ViewHeader user_id={userData.id} />
                    <div className="flex items-center justify-center">
                        {userData.image ? (
                            <Image
                                src={userData.image}
                                className="rounded-full"
                                width={28}
                                height={28}
                                alt={`${userData.name}'s profile picture`}
                            />
                        ) : (
                            <IconAvatar className="w-32"/>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <h1 className="text-xl font-semibold text-gray-800">{userData.name}</h1>
                        <p className="text-gray-600">{userData.email}</p>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800">Name:</p>
                                <p>{userData.name}</p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800">Email:</p>
                                <p>{userData.email}</p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800">Role:</p>
                                <p>{userData.role}</p>
                            </div>
                        </div>
                    </div>
                    {addressData && (
                        <UserAddresses
                            // @ts-ignore
                            shippingAddress={addressData.shippingAddress}
                            // @ts-ignore
                            savedAddresses={addressData.savedAddresses}
                        />
                        )}
                </div>
        );
    }
}