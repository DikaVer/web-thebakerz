import React, { useState } from "react";
import {Search} from "@/components/shop/search";
import {IconEdit, IconLocation} from "@/components/ui/icons";

const commands = [
    { value: 'a', label: 'a' },
];

export const AddressSearch: React.FC = () => {
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [hoveringEdit, setHoveringEdit] = useState<{ [key: string]: boolean }>({});

    const handleAddressClick = (address: string) => {
        setSelectedAddress(address);
    };

    const handleMouseEnter = (address: string) => {
        setHoveringEdit((prev) => ({ ...prev, [address]: true }));
    };

    const handleMouseLeave = (address: string) => {
        setHoveringEdit((prev) => ({ ...prev, [address]: false }));
    };

    return (
        <>
            <div className="flex items-center justify-center">
                <Search commands={commands} placeholder="Search for bakery items..."/>
            </div>
            <div>
                <p className="text-black text-xl">Saved addresses</p>
                <ul>
                    {['Maastricht', 'Chisinau', 'Saint-Petersburg'].map((address) => (
                        <li key={address}>
                            <div
                                className={`flex flex-row justify-between items-center space-x-2 pr-2 my-1 py-1 transition duration-300 cursor-pointer rounded-lg 
                                            ${selectedAddress === address ? 'bg-grayBg' : hoveringEdit[address] ? '' : 'hover:bg-grayBg'}`}
                                onClick={() => handleAddressClick(address)}
                            >
                                <IconLocation className={"w-9 h-9"}
                                              color={selectedAddress === address ? "primary" : "secondary"}/>
                                <div className={"flex w-full"}>
                                    <p className="text-black text-lg">{address}</p>
                                </div>
                                <div
                                    className={`transition duration-500 ${hoveringEdit[address] ? 'scale-115' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(address)}
                                    onMouseLeave={() => handleMouseLeave(address)}
                                >
                                    <IconEdit className={"w-6 h-6"}/>
                                </div>
                            </div>
                            <hr></hr>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};