import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconClock, IconCross } from "@/components/ui/icons";
import { SwitchDelivery } from "@/components/scheduler/switch-delivery";
import { AddressSearch } from "@/components/scheduler/address-search";
import { TimeSelection } from "@/components/scheduler/time-selection";
import {AddressDataField, CheckoutDataAuthField, CheckoutLocalDataField} from "@/lib/definitions";
import { AddressSelection } from "@/components/scheduler/address-selection";
import {ScrollArea} from "@/components/ui/scroll-area";

interface SchedulerContentProps {
    handleDialogClose: () => void;
    checkoutData: CheckoutLocalDataField;
    updateCheckoutData: () => void;
    isSchedulerView: "scheduler" | "timeSelection" | "addressSelection";
    setIsSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void;
}

export function SchedulerContent({ checkoutData, handleDialogClose, isSchedulerView, updateCheckoutData, setIsSchedulerView }: SchedulerContentProps) {

    const toggleSchedulerView = (view: "scheduler" | "timeSelection" | "addressSelection") => {
        setIsSchedulerView(view);
    };

    const [input, setInputAddress] = useState(null as AddressDataField | null);

    return (

        <>
            <div className="fixed z-30 bg-black opacity-50 inset-0" onClick={(e) => {
                e.stopPropagation();
                handleDialogClose();
            }}/>
            <div
                className={"fixed left-[50%] top-[60%] z-40 grid w-full max-w-lg sm:max-w-[425px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg rounded-lg"}
            >
                <ScrollArea className={"max-h-[75vh]"}>
                    {isSchedulerView === "scheduler" && (
                            <SchedulerContentView
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                handleDialogClose={handleDialogClose}
                                handleSchedulerView={toggleSchedulerView}
                                setInputAddress={setInputAddress}
                            />
                    )}
                    {isSchedulerView === "timeSelection" && (
                        <TimeSelection
                            checkoutData={checkoutData}
                            updateCheckoutData={updateCheckoutData}
                            handleSchedulerView={toggleSchedulerView}
                        />
                    )}
                    {isSchedulerView === "addressSelection" && (
                            <AddressSelection
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                initialInput={input}
                                setInputAddress={setInputAddress}
                                handleSchedulerView={toggleSchedulerView}
                            />
                    )}
                </ScrollArea>
            </div>
        </>
    );
}

const SchedulerContentView: React.FC<{
    checkoutData: CheckoutLocalDataField,
    updateCheckoutData: () => void;
    handleDialogClose: () => void,
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void,
    setInputAddress: (input: AddressDataField | null) => void;
}> = ({
          handleDialogClose,
          handleSchedulerView,
          checkoutData,
          updateCheckoutData,
          setInputAddress,
      }) => {


    const toggleIsPickUp = () => {
        // Update the pickUp status in checkoutData
        localStorage.setItem('deliveryMode', checkoutData.deliveryMode === "PICKUP" ? 'DELIVERY' : 'PICKUP');
        updateCheckoutData();
    };

    return (
        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
            <div className={`flex flex-row justify-between items-center`}>
                <Button
                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDialogClose();
                    }}>
                    <IconCross className={"w-8 h-8 cursor-pointer"} />
                </Button>
                <p className={"text-xl"}>Schedule Delivery</p>
                <div className="w-8 h-8 flex"></div>
            </div>
            <hr className={"my-1"}></hr>
            <div className={"flex flex-col justify-between items-center"}>
                <SwitchDelivery
                    toggleIsPickUp={toggleIsPickUp}
                    isPickup={checkoutData.deliveryMode === "PICKUP"}
                />
            </div>
            {checkoutData.deliveryMode === "PICKUP" ? (
                <>
                </>
            ) : (
                <AddressSearch
                    handleSchedulerView={handleSchedulerView}
                    setInputAddress={setInputAddress}
                    checkoutData={checkoutData}
                    updateCheckoutData={updateCheckoutData}
                />
            )}
            <div>
                <p className="text-black text-xl">Time Preferences</p>
                <div
                    className="flex flex-row justify-between items-center space-x-2 my-1 py-1 transition duration-500 cursor-pointer rounded-lg">
                    <IconClock className={"w-16 h-16"} />
                    <div className={"flex w-full"}>
                        <p className="text-black text-left text-lg">Schedule delivery</p>
                    </div>
                    <Button className={"text-lg h-9"}
                            onClick={() => handleSchedulerView("timeSelection")}
                    >
                        Schedule
                    </Button>
                </div>
            </div>
        </div>
    );
};