import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconClock, IconCross } from "@/components/ui/icons";
import { SwitchDelivery } from "@/components/scheduler/switch-delivery";
import { AddressSearch } from "@/components/scheduler/address-search";
import { TimeSelection } from "@/components/scheduler/time-selection";
import {AddressDataUserField, CheckoutData} from "@/lib/definitions";
import { AddressSelection } from "@/components/scheduler/address-selection";
import {ScrollArea} from "@/components/ui/scroll-area";
import {timeMap} from "@/lib/local-variables";
import {formatDateTime} from "@/lib/utils";

interface SchedulerContentProps {
    isDialogOpen: boolean;
    handleDialogClose: () => void;
    checkoutData: CheckoutData;
    updateCheckoutData: () => void;
    isSchedulerView: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing";
    setIsSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => void;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
}

export function SchedulerContent({availability, checkoutData, isDialogOpen, handleDialogClose, isSchedulerView, updateCheckoutData, setIsSchedulerView }: SchedulerContentProps) {

    const toggleSchedulerView = (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => {
        setIsSchedulerView(view);
    };

    const [input, setInputAddress] = useState(null as AddressDataUserField | null);

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);

    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        toggleSchedulerView("scheduler");
        setTimeout(() => {
            handleDialogClose();
        }, 400);
    }

    return (

        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={(e) => {
                    toggleClose();
                }}/>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
            >
                <ScrollArea className={"max-h-[75vh]"}>
                    {isSchedulerView === "scheduler" && (
                            <SchedulerContentView
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                handleDialogClose={toggleClose}
                                handleSchedulerView={toggleSchedulerView}
                                setInputAddress={setInputAddress}
                            />
                    )}
                    {isSchedulerView === "timeSelection" && (
                        availability && <TimeSelection
                            checkoutData={checkoutData}
                            updateCheckoutData={updateCheckoutData}
                            handleSchedulerView={toggleSchedulerView}
                            availability={availability}
                        />
                    )}
                    {isSchedulerView === "addressSelection" && (
                            <AddressSelection
                                checkoutData={checkoutData}
                                updateCheckoutData={updateCheckoutData}
                                initialInput={input}
                                setInputAddress={setInputAddress}
                                handleSchedulerView={toggleSchedulerView}
                                isEditing={false}
                            />
                    )}
                    {isSchedulerView === "addressEditing" && (
                        <AddressSelection
                            checkoutData={checkoutData}
                            updateCheckoutData={updateCheckoutData}
                            initialInput={input}
                            setInputAddress={setInputAddress}
                            handleSchedulerView={toggleSchedulerView}
                            isEditing={true}
                        />
                    )}
                </ScrollArea>
            </div>
        </>
    );
}

const SchedulerContentView: React.FC<{
    checkoutData: CheckoutData,
    updateCheckoutData: () => void;
    handleDialogClose: () => void,
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection" | "addressEditing") => void,
    setInputAddress: (input: AddressDataUserField | null) => void;
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
        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-3 cm:p-6"}>
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
                    <IconClock className={"w-10 h-10 tm:w-12 tm:h-12"} />
                    <div className={"flex flex-col w-full"}>
                        {
                            checkoutData.selectedTime ? (
                                <>
                                    <p className="text-black font-medium text-left text-sm tm:text-base">
                                        {new Date(checkoutData.selectedTime?.date as string).toDateString()}
                                    </p>
                                    <p className="text-black font-medium text-left text-sm tm:text-base">
                                        {formatDateTime(timeMap[checkoutData.selectedTime.time as string].from)} - {formatDateTime(timeMap[checkoutData.selectedTime.time as string].to)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-black text-left text-lg tm:text-xl">Schedule {checkoutData.deliveryMode === "PICKUP" ? "Pickup" : "Delivery"}</p>
                            )
                        }
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