import { useSwitch, cn } from "@heroui/react";
import { VisuallyHidden } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useDelivery } from "@/components/providers/delivery-provider";


// Rescue Deals Switch Component
export const RescueDealsSwitch = () => {
    const { isRescueDeal, toggleRescueDealMode } = useDelivery();
    const {Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps} =
        useSwitch({
            isSelected: isRescueDeal,
            onValueChange: toggleRescueDealMode
        });

    return (
        <div className="flex items-center gap-3">
            <Component {...getBaseProps()}>
                <VisuallyHidden>
                    <input {...getInputProps()} />
                </VisuallyHidden>
                <div
                    {...getWrapperProps()}
                    className={slots.wrapper({
                        class: [
                            "w-8 h-8",
                            "flex items-center justify-center",
                            "rounded-lg bg-background-secondary hover:bg-default-200 transition-colors",
                            isSelected && "bg-primary-100 hover:bg-primary-200 text-default-100"
                        ],
                    })}
                >
                    <Icon
                        icon="material-symbols:eco-outline"
                        width={18}
                        className={cn(
                            "transition-colors",
                            isSelected ? "text-default-100" : "text-foreground"
                        )}
                    />
                </div>
            </Component>
            <span className="font-medium text-foreground whitespace-nowrap">
                Rescue Deals
            </span>
        </div>
    );
};