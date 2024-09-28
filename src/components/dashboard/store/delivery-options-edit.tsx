import DeliveryOptions from "@/components/store/delivery-options-selection";
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";
import {StoreData} from "@/lib/definitions";
import {availabilitySchema, deliveryOptionsSchema} from "@/lib/schemas";
import {toast} from "sonner";
import {IconError, IconSuccess} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import {ClipLoader} from "react-spinners";

interface DeliveryOptionsEditProps {
    id: string;
    deliveryOptions: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    > | null;
    setStoreData: (data: StoreData) => void;
}

export default function DeliveryOptionsEdit({ id, deliveryOptions, setStoreData }: DeliveryOptionsEditProps) {

    const [isPending, setPending] = useState(false);

    const [isChanged, setIsChanged] = useState(false);

    const [deliveryLocations, setDeliveryLocations] = useState<Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >>(deliveryOptions || {});

    const initialDeliveryOptions = useMemo(() => deliveryLocations, []);

    useEffect(() => {
        // @ts-ignore
        setStoreData(prevState => ({
            ...prevState,
            ["deliveryOptions"]: deliveryLocations,
        }));
        console.log(deliveryLocations);
        setIsChanged(JSON.stringify(initialDeliveryOptions) !== JSON.stringify(deliveryLocations));
    }, [deliveryLocations]);

    const onSubmit = async (formDeliveryOptionsData : Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >) => {
        setPending(true);

        const validateField = deliveryOptionsSchema.safeParse(formDeliveryOptionsData);

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

        const response = await fetch(`/api/store/actions/updateDeliveryOptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: id,
                deliveryOptionsData: formDeliveryOptionsData
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
        <div className={"mt-4"}>
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
                    <p className={"text-2xl"}>Your delivery options are updating...</p>
                </div>
            ) : (
                <>
                    <DeliveryOptions
                        deliveryLocations={deliveryLocations}
                        setDeliveryLocations={setDeliveryLocations}
                    />
                    <div className={"flex flex-row space-x-4"}>
                        <Button
                            type={"submit"}
                            className={"w-full mt-4"}
                            variant={"outline"}
                            disabled={!isChanged}
                            onClick={() => {
                                setDeliveryLocations(initialDeliveryOptions);
                                // @ts-ignore
                                setStoreData(prevState => ({
                                    ...prevState,
                                    ["deliveryOptions"]: initialDeliveryOptions,
                                }));
                            }}
                        >
                            Revert
                        </Button>
                        <Button
                            type={"submit"}
                            className={"w-full mt-4"}
                            disabled={!isChanged}
                            onClick={() => onSubmit(deliveryLocations)}
                        >
                            Apply
                        </Button>
                    </div>
                </>
        )}
        </div>
    );
}