import {Calendar} from "@/components/ui/calendar";
import {AvailabilitySelection} from "@/components/store/availability-selection";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {timeMap} from "@/lib/local-variables";
import {StoreData} from "@/lib/definitions";
import {Button} from "@/components/ui/button";
import {ClipLoader} from "react-spinners";
import {availabilitySchema} from "@/lib/schemas";
import {toast} from "sonner";
import {IconError, IconSuccess} from "@/components/ui/icons";


interface AvailabilityEditProps {
    id: string;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
    setStoreData: (data: StoreData) => void;
}

export default function AvailabilityEdit({ id, availability, setStoreData }: AvailabilityEditProps) {

    const [isPending, setPending] = useState(false);

    const [isChanged, setIsChanged] = useState(false);

    const [availabilityData, setAvailabilityData] = useState<
        Record<string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }>>
    (availability || {});

    const initialAvailability = useMemo(() => availabilityData, []);

    useEffect(() => {
        // @ts-ignore
        setStoreData(prevState => ({
            ...prevState,
            ["availability"]: availabilityData,
        }));
        setIsChanged(JSON.stringify(initialAvailability) !== JSON.stringify(availabilityData));
    }, [availabilityData]);


    const onSubmit = async (formAvailabilityData : Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    >) => {
        setPending(true);

        const validateField = availabilitySchema.safeParse(formAvailabilityData);

        const today = new Date();

        const filteredAvailabilityData = Object.keys(availabilityData).reduce((acc:{ [key: string]: typeof availabilityData[keyof typeof availabilityData] }, dateKey) => {
            const date = new Date(dateKey);
            if (date > today) {
                const { from, to } = availabilityData[dateKey];
                if (timeMap[from].from < timeMap[to].from) {
                    acc[dateKey] = availabilityData[dateKey];
                }
            }
            return acc;
        }, {});

        if (!validateField.success) {
            toast.error((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconError color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {validateField.error.errors[0].message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
            setPending(false);
            return;
        }

        const response = await fetch(`/api/store/actions/updateAvailability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: id,
                availabilityData: formAvailabilityData
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            toast.error((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconError color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
        } else {
            toast.success((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconSuccess color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
        }

        setPending(false);

    }

    return (
    <div>
        {isPending ? (
            <div className={"flex flex-col justify-center items-center"}>
                <ClipLoader
                    color={"#730C6F"}
                    loading={isPending}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    speedMultiplier={0.3}
                />
                <p className={"text-2xl"}>Your availability is updating...</p>
            </div>
        ) : (
            <>
                <div className={"flex justify-center"}>
                    <Calendar
                        setAvailabilityData={setAvailabilityData}
                        availabilityData={availabilityData}
                        mode="single"
                        className={"border-1 rounded-lg m-7"}
                        initialFocus
                    />
                </div>
                <div
                    className="block text-sm font-medium text-gray-700 mb-4">
                    Advance option to set up availability
                </div>
                <AvailabilitySelection
                    setAvailabilityData={setAvailabilityData}
                    availabilityData={availabilityData}
                />
                <div className={"flex flex-row space-x-4"}>
                    <Button
                        type={"submit"}
                        className={"w-full mt-4"}
                        variant={"outline"}
                        disabled={!isChanged}
                        onClick={() => {
                            setAvailabilityData(initialAvailability);
                            // @ts-ignore
                            setStoreData(prevState => ({
                                ...prevState,
                                ["availability"]: initialAvailability,
                            }));
                        }}
                    >
                        Revert
                    </Button>
                    <Button
                        type={"submit"}
                        className={"w-full mt-4"}
                        disabled={!isChanged}
                        onClick={() => onSubmit(availabilityData)}
                    >
                        Apply
                    </Button>
                </div>
            </>
        )}
    </div>
    );
}