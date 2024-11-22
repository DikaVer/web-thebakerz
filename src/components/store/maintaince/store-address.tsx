'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AddressDataStoreField} from "@/lib/definitions";


interface StoreAddressProps {
    address: AddressDataStoreField;
}


const StoreAddresses = ({ address} : StoreAddressProps) => {

    const [selectedAddress, setSelectedAddress] = useState(address);

    // Function to generate static map URL
    const generateMapUrl = (latitude: number, longitude: number) => {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=400x300&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg mt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Location</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800">Sub-Premise:</p>
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
        </div>
    );
};

export default StoreAddresses;
