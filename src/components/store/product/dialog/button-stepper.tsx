'use client';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import {IconLoadingCircle} from "@/components/ui/icons";
import {useEffect, useRef} from "react";
import {useDebouncedCallback} from "use-debounce";
import showErrorMessage from "@/components/toast/toast-error";

type Props = {
    isCart?: boolean;
    value: number;
    min?: number;
    max?: number;
    /**
     * onChange is expected to be an async function that updates the value,
     * for example, updating the cart on the server.
     */
    onChange?: (value: number) => Promise<boolean> | void;
    isLoading?: boolean;
    setIsLoading?: (value: boolean) => void;
};

export function InputStepper({
                                 isCart,
                                 value,
                                 min = -Infinity,
                                 max = Infinity,
                                 onChange,
                                 isLoading = false,
                                 setIsLoading,
                             }: Props) {
    const defaultValue = React.useRef(value);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [animated, setAnimated] = React.useState(true);
    // Hide the caret during transitions so you can't see it shifting around:
    const [showCaret, setShowCaret] = React.useState(true);
    // Local state to display the value immediately.
    const [localValue, setLocalValue] = React.useState<number>(value);

    // Refs for handling long press
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Create a debounced version of the update function.
    const debouncedUpdate = useDebouncedCallback(async (newVal: number) => {
        setIsLoading && setIsLoading(true);
        try {
            if (onChange) {
                const updateValue = await onChange(newVal);
                if (!updateValue) {
                    setLocalValue(value);
                }
            }
        } finally {
            setIsLoading && setIsLoading(false);
        }
    }, 1000);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // When the value changes via button press, update the local state immediately,
    // set loading to true, and call the debounced update.
    const handleChange = (newVal: number) => {
        setLocalValue(newVal);
        setIsLoading ? debouncedUpdate(newVal) : onChange && onChange(newVal);
    };

    const handleInput: React.ChangeEventHandler<HTMLInputElement> = ({
                                                                         currentTarget: el,
                                                                     }) => {
        setAnimated(false);
        if (el.value === '') {
            handleChange(defaultValue.current);
            return;
        }
        const num = parseInt(el.value);
        if (
            isNaN(num) ||
            (min != null && num < min) ||
            (max != null && num > max)
        ) {
            // Revert input's value:
            el.value = String(value);
        } else {
            // Manually update value in case they e.g. start with a "0" or end with a "."
            // which won't trigger a DOM update (because the number is the same):
            el.value = String(num);
            handleChange(num);
        }
    };

    const handlePointerDown =
        (diff: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
            setAnimated(true);
            if (event.pointerType === 'mouse') {
                event?.preventDefault();
                inputRef.current?.focus();
            }
            const newVal = Math.min(Math.max(value + diff, min), max);
            onChange?.(newVal);
        };

    // Long press handlers
    // Replace the startIncrementing function
    const startIncrementing = () => {
        if (isLoading || localValue >= max) return;

        // Clear any existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Set timeout for initial delay
        timeoutRef.current = setTimeout(() => {
            // Start interval for continuous incrementing
            intervalRef.current = setInterval(() => {
                setLocalValue((prevValue) => {
                    if (prevValue < max) {
                        const newVal = Math.min(prevValue + 1, max);
                        // Call onChange directly instead of through handleChange
                        setIsLoading ? debouncedUpdate(newVal) : onChange && onChange(newVal);
                        return newVal;
                    }
                    stopIncrementing();
                    return prevValue;
                });
            }, 150);
        }, 500);
    };

// Replace the startDecrementing function
    const startDecrementing = () => {
        if (isLoading || localValue <= min) return;

        // Clear any existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Set timeout for initial delay
        timeoutRef.current = setTimeout(() => {
            // Start interval for continuous decrementing
            intervalRef.current = setInterval(() => {
                setLocalValue((prevValue) => {
                    if (prevValue > min) {
                        const newVal = Math.max(prevValue - 1, min);
                        // Call onChange directly instead of through handleChange
                        setIsLoading ? debouncedUpdate(newVal) : onChange && onChange(newVal);
                        return newVal;
                    }
                    stopDecrementing();
                    return prevValue;
                });
            }, 150);
        }, 500);
    };

    const stopIncrementing = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const stopDecrementing = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Handlers for minus and plus buttons.
    const handleMinus = () => {
        const newVal = Math.max(localValue - 1, min);
        handleChange(newVal);
    };

    const handlePlus = () => {
        const newVal = Math.min(localValue + 1, max);
        handleChange(newVal);
    };

    return (
        <div className="group flex items-stretch justify-center text-2xl font-semibold w-fit mx-auto rounded-full"
        >
            <Tooltip content={isCart && localValue <= 1 ? "Delete Item" : "Remove Item"}>
                <Button
                    isIconOnly
                    variant="bordered"
                    radius="full"
                    isDisabled={localValue <= min || isLoading}
                    onPress={handleMinus}
                    onPointerDown={startDecrementing}
                    onPointerUp={stopDecrementing}
                    onPointerLeave={stopDecrementing}
                    className="flex items-center pl-[.5em] pr-[.325em]"
                >
                    {isCart && localValue <= 1 ? (
                        <Icon icon="solar:trash-bin-trash-broken" width={24} />
                    ) : (
                        <Minus className="size-4" strokeWidth={3.5} />
                    )}
                </Button>
            </Tooltip>
            <div className="relative grid items-center justify-items-center text-center [grid-template-areas:'overlap'] *:[grid-area:overlap]">
                {isLoading ? (
                    <>
                        <div
                            className={cn(
                                'spin-hide w-[2.5em] bg-transparent text-center font-[inherit] text-transparent outline-none appearance-none'
                            )}

                        />

                        <IconLoadingCircle strokeWidth={2} className="text-grayText w-10 h-10"/>

                    </>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            className={cn(
                                showCaret ? 'caret-primary' : 'caret-transparent',
                                'spin-hide w-[2.5em] bg-transparent text-center font-[inherit] text-transparent outline-none appearance-none'
                            )}
                            style={{fontKerning: 'none'}}
                            type="number"
                            min={min}
                            step={1}
                            autoComplete="off"
                            inputMode="numeric"
                            max={max}
                            value={localValue}
                            onInput={handleInput}
                        />
                        <NumberFlow
                            value={localValue}
                            format={{useGrouping: false}}
                            aria-hidden
                            animated={animated}
                            onAnimationsStart={() => setShowCaret(false)}
                            onAnimationsFinish={() => setShowCaret(true)}
                            className="pointer-events-none"
                            willChange
                        />
                    </>
                )}
            </div>
            <Tooltip content="Add Item">
                <Button
                    isIconOnly
                    variant="bordered"
                    radius="full"
                    isDisabled={localValue >= max || isLoading}
                    onPress={handlePlus}
                    onPointerDown={startIncrementing}
                    onPointerUp={stopIncrementing}
                    onPointerLeave={stopIncrementing}
                    className="flex items-center pl-[.325em] pr-[.5em]"
                >
                    <Plus className="size-4" absoluteStrokeWidth strokeWidth={3.5}/>
                </Button>
            </Tooltip>
        </div>
    );
}