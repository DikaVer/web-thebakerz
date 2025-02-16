'use client';
import { cn } from '@/lib/utils';
import NumberFlow from '@number-flow/react';
import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import {IconLoadingCircle} from "@/components/ui/icons";
import {useEffect} from "react";
import {useDebouncedCallback} from "use-debounce";

type Props = {
    isCart?: boolean;
    value: number;
    min?: number;
    max?: number;
    /**
     * onChange is expected to be an async function that updates the value,
     * for example, updating the cart on the server.
     */
    onChange?: (value: number) => Promise<void> | void;
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
    // Loading state during debounce/waiting for the async action to finish.

    // Create a debounced version of the update function.
    const debouncedUpdate = useDebouncedCallback(async (newVal: number) => {
        setIsLoading && setIsLoading(true);
        try {
            if (onChange) {
                await onChange(newVal);
            }
        } finally {
            setIsLoading && setIsLoading(false);
        }
    }, 500);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

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

    // Handlers for minus and plus buttons.
    const handleMinus = () => {
        const newVal = Math.max(localValue - 1, min);
        handlePointerDown(-1)
        handleChange(newVal);
    };

    const handlePlus = () => {
        const newVal = Math.min(localValue + 1, max);
        handlePointerDown(1)
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
                    disabled={localValue <= min || isLoading}
                    onPress={handleMinus}
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
                    disabled={localValue >= max || isLoading}
                    onPress={handlePlus}
                    className="flex items-center pl-[.325em] pr-[.5em]"
                >
                    <Plus className="size-4" absoluteStrokeWidth strokeWidth={3.5}/>
                </Button>
            </Tooltip>
        </div>
    );
}
