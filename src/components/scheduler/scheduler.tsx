import React, {useState} from "react";
import {DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconArrow, IconClock, IconCross } from "@/components/ui/icons";
import { SwitchDelivery } from "@/components/scheduler/switch-delivery";
import { AddressSearch } from "@/components/scheduler/address-search";
import { ScheduleSelection } from "@/components/scheduler/schedule-selection";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

interface SchedulerContentProps {
    setIsDialogOpen: (isOpen: boolean) => void;
}

export function SchedulerContent({ setIsDialogOpen }: SchedulerContentProps) {

    const [isContentVisible, setIsContentVisible] = useState(true);

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        const timer = setTimeout(() => {
            setIsContentVisible(true);
            clearTimeout(timer);
        }, 300);
    };

    const handleScheduler = () => {
        setIsContentVisible(!isContentVisible);
    };

    return isContentVisible ? (
        <DialogContent
            className={`sm:max-w-[425px]` }
            handleClose={handleDialogClose}
        >
            <VisuallyHidden>
                <DialogTitle>
                    Schedule Delivery
                </DialogTitle>
                <DialogDescription>
                    Schedule your delivery
                </DialogDescription>
            </VisuallyHidden>
            <SchedulerContentView
                handleDialogClose={handleDialogClose}
                handleScheduler={handleScheduler}
            />
        </DialogContent>
    ) : (
        <DialogContent
            className={`sm:max-w-[425px]`}
            handleClose={handleDialogClose}
        >
            <VisuallyHidden>
                <DialogTitle>
                    Schedule Selection
                </DialogTitle>
                <DialogDescription>
                    Select the time preference
                </DialogDescription>
            </VisuallyHidden>
            <ScheduleSelection
                handleScheduler={handleScheduler}
            />
        </DialogContent>
    );
}

const SchedulerContentView: React.FC<{
    handleDialogClose: () => void,
    handleScheduler: () => void
}> = ({
          handleDialogClose,
          handleScheduler
      }) => (
    <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%]"}>
        <div className={`flex flex-row justify-between items-center`}>
            <Button
                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                onClick={handleDialogClose}>
                <IconCross className={"w-8 h-8 cursor-pointer"} />
            </Button>
            <p className={"text-xl"}>Schedule Delivery</p>
            <div className="w-8 h-8 flex"></div>
        </div>
        <hr className={"my-1"}></hr>
        <div className={"flex flex-col justify-between items-center"}>
            <SwitchDelivery />
        </div>
        <AddressSearch />
        <div>
            <p className="text-black text-xl">Time Preferences</p>
            <div
                className="flex flex-row justify-between items-center space-x-2 my-1 py-1 transition duration-500 cursor-pointer rounded-lg">
                <IconClock className={"w-16 h-16"} />
                <div className={"flex w-full"}>
                    <p className="text-black text-left text-lg">Schedule delivery</p>
                </div>
                <Button className={"text-lg h-9"}
                        onClick={handleScheduler}
                >
                    Schedule
                </Button>
            </div>
        </div>
    </div>
);