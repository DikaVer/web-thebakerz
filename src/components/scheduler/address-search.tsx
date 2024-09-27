import React, {useState} from "react";
import {IconEdit, IconLocation} from "@/components/ui/icons";
import {AddressSelection} from "@/components/scheduler/address-selection";
import {AddressData, AddressDataStoreField, AddressDataStorageField} from "@/lib/definitions";

interface AddressSearchProps {
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => void;
    setInputAddress: (input: AddressDataStoreField | null) => void;
    checkoutData: AddressDataStorageField;
    updateCheckoutData: () => void;
}


export const AddressSearch: React.FC<AddressSearchProps> = ({handleSchedulerView, setInputAddress, checkoutData, updateCheckoutData}) => {
    const [hoveringEdit, setHoveringEdit] = useState<{ [key: string]: boolean }>({});

    const handleAddressClick = (address: string) => {
        const selectedAddress = checkoutData.savedAddresses;
        if (selectedAddress) {
            localStorage.setItem('shippingAddress', JSON.stringify(selectedAddress[address]));
            updateCheckoutData();
        }
    };

    const handleEditAddress = (address: string) => {
        const selectedAddress = checkoutData.savedAddresses;
        if (selectedAddress) {
            setInputAddress(selectedAddress[address]);
            handleSchedulerView("addressEditing");
        }
    }

    const handleMouseEnter = (address: string) => {
        setHoveringEdit((prev) => ({ ...prev, [address]: true }));
    };

    const handleMouseLeave = (address: string) => {
        setHoveringEdit((prev) => ({ ...prev, [address]: false }));
    };


    return (
        <div className={"animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%]"}>
            <AddressSelection
                initialInput={null}
                checkoutData={checkoutData}
                updateCheckoutData={updateCheckoutData}
                setInputAddress={setInputAddress}
                handleSchedulerView={handleSchedulerView}
                isEditing={false}
            />
            <div className={"mt-4"}>
                <p className="text-black text-xl">Saved addresses</p>
                <ul>
                    {checkoutData.savedAddresses ? Object.values(checkoutData.savedAddresses).map((address) => (
                        <li key={address.id}>
                            <div
                                className={`flex flex-row justify-between items-center space-x-2 pr-2 my-1 py-1 transition duration-300 cursor-pointer rounded-lg 
                                            ${checkoutData.shippingAddress?.id === address.id ? 'bg-grayBg' : hoveringEdit[address.id] ? '' : 'hover:bg-grayBg'}`}
                                onClick={() => handleAddressClick(address.id)}
                            >
                                <IconLocation className={"w-9 h-9"}
                                              color={checkoutData.shippingAddress?.id === address.id ? "primary" : "secondary"}/>
                                <div className={"flex w-full"}>
                                    <p className="text-black text-lg">{address.streetAddress}</p>
                                </div>
                                <div
                                    className={`transition duration-500 ${hoveringEdit[address.id] ? 'scale-115' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(address.id)}
                                    onMouseLeave={() => handleMouseLeave(address.id)}
                                    onClick={() => handleEditAddress(address.id)}
                                >
                                    <IconEdit className={"w-6 h-6"}/>
                                </div>
                            </div>
                            <hr></hr>
                        </li>
                    )) : (
                        <li>
                            <p className={"mt-3 text-center"}>No saved addresses</p>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
