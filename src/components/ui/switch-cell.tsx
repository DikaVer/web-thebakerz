/**
 * @fileoverview Labeled switch row component built on the Hero UI Switch.
 *
 * Exports SwitchCell, a full-width toggle cell that places a label and
 * description on the left and the switch on the right, used in settings-style
 * lists such as cookie preferences. Extends the Switch color prop with a
 * "foreground" option via an internal CustomSwitch wrapper.
 */
import React, { forwardRef } from "react";
import { Switch, SwitchProps } from "@heroui/react";
import { cn } from "@heroui/react";

// Define a new type that includes the original SwitchProps and adds "foreground" to the color property
type CustomSwitchProps = Omit<SwitchProps, "color"> & {
    color?: SwitchProps["color"] | "foreground";
};

// Create a CustomSwitch component that accepts the new CustomSwitchProps
const CustomSwitch = forwardRef<HTMLInputElement, CustomSwitchProps>(
    ({ color, ...props }, ref) => (
        <Switch ref={ref} color={color === "foreground" ? undefined : color} {...props} />
    )
);

export type SwitchCellProps = CustomSwitchProps & {
    label: string;
    description: string;
    classNames?: SwitchProps["classNames"] & {
        description?: string | string[];
    };
};

const SwitchCell = forwardRef<HTMLInputElement, SwitchCellProps>(
    ({ label, description, classNames, color, ...props }, ref) => (
        <CustomSwitch
            ref={ref}
            color={color}
            classNames={{
                ...classNames,
                base: cn(
                    "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
                    "justify-between cursor-pointer rounded-medium gap-2 p-4",
                    classNames?.base
                ),
            }}
            {...props}
        >
            <div className="flex flex-col">
                <p className={cn("text-medium", classNames?.label)}>{label}</p>
                <p className={cn("text-small text-default-500", classNames?.description)}>
                    {description}
                </p>
            </div>
        </CustomSwitch>
    )
);

SwitchCell.displayName = "SwitchCell";

export default SwitchCell;
