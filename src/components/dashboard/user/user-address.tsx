'use client';

import Image from 'next/image';
import { useState } from 'react';
import {AddressUserData, AddressDataUserField} from "@/lib/definitions";
import {formatAddress} from "@/lib/utils";


interface UserAddressProps {
    shippingAddress: AddressDataUserField | null;
    savedAddresses: AddressUserData | null;
}


const UserAddresses = ({ shippingAddress, savedAddresses } : UserAddressProps) => {
    if (shippingAddress === null || savedAddresses === null || savedAddresses === undefined || shippingAddress === undefined) {
        return null;
    }

    const [selectedAddress, setSelectedAddress] = useState(shippingAddress);

    // Function to generate static map URL
    const generateMapUrl = (latitude: number, longitude: number) => {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=400x300&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg mt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Shipping Address</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">SubPremise:</p>
                    <p>{selectedAddress.sub_premise}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Premise:</p>
                    <p>{selectedAddress.premise}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Street Number:</p>
                    <p>{selectedAddress.street_number}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Route:</p>
                    <p>{selectedAddress.route}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">City:</p>
                    <p>{selectedAddress.city}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">State:</p>
                    <p>{selectedAddress.state}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Zip Code:</p>
                    <p>{selectedAddress.zip_code}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Country:</p>
                    <p>{selectedAddress.country}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Latitude:</p>
                    <p>{selectedAddress.latitude}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Longitude:</p>
                    <p>{selectedAddress.longitude}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Delivery Notes:</p>
                    <p>{selectedAddress.delivery_notes}</p>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-6">Map</h2>
            <div className="flex justify-center mb-6">
                <Image
                    src={generateMapUrl(selectedAddress.latitude, selectedAddress.longitude)}
                    alt="Map showing the location"
                    width={400}
                    height={300}
                    className="rounded-lg"
                />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-6">Saved Addresses</h2>
            <div className="grid grid-cols-1 gap-4">
                {Object.values(savedAddresses).map((address) => (
                    <div
                        key={address.id}
                        className="p-4 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                        onClick={() => setSelectedAddress(address)}
                    >
                        <p className="font-semibold text-gray-800">{formatAddress(address)}</p>
                        <p className="text-gray-600">{address.city}, {address.zip_code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAddresses;
