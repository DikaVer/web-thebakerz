import React from "react";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { IconLocation } from "../icons";

interface DeliveryAddressButtonProps {
    showDeliveryInfo: boolean;
    validationResult: any;
    isSubheaderLoaded: boolean;
    onOpen: () => void;
    t: (key: string) => string;
}

export const DeliveryAddressButton: React.FC<DeliveryAddressButtonProps> = ({
    showDeliveryInfo,
    validationResult,
    isSubheaderLoaded,
    onOpen,
    t
}) => {
    const { theme } = useTheme();
    
    const getIconColors = () => {
        const isActive = showDeliveryInfo && validationResult.isInRange;
        
        if (theme === 'light') {
            return {
                primary: isActive ? '#000' : '#fff',
                secondary: isActive ? '#000' : '#fff'
            };
        } else {
            return {
                primary: isActive ? '#ffffff' : '#ffffff',
                secondary: isActive ? '#ffffff' : '#ffffff'
            };
        }
    };

    return (
        <Button
            className={`w-full justify-between ${showDeliveryInfo && validationResult.isInRange ? "bg-transparent text-text" : "bg-gradient-primary text-white"}`}
            variant="solid"
            startContent={
                !isSubheaderLoaded ? (
                    <Spinner size="sm" color="current" />
                ) : (
                    <IconLocation
                        size={24}
                        primaryColor={getIconColors().primary}
                        secondaryColor={getIconColors().secondary}
                        className="flex-shrink-0"
                    />
                )
            }
            endContent={
                <Icon 
                    icon={showDeliveryInfo ? "solar:pen-linear" : "solar:add-square-linear"} 
                    width={24} 
                    className={showDeliveryInfo && validationResult.isInRange ? "text-text" : "text-white"}
                />
            }
            onPress={onOpen}
        >
            <div className="flex flex-col items-start min-w-0 flex-1">
                {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress ? (
                    <>
                        <p className="text-sm truncate w-full text-left">
                            {`${validationResult?.validatedAddress?.street}, ${validationResult?.validatedAddress?.houseNumber}, ${validationResult?.validatedAddress?.zipCode}`}
                        </p>
                        {validationResult?.validatedAddress?.additionalInfo && (
                            <p className="text-xs truncate w-full text-left">
                                {validationResult?.validatedAddress?.additionalInfo}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-sm truncate w-full text-left">
                        {!isSubheaderLoaded ? t("loadingAddress") : t("enterDeliveryAddressPrompt")}
                    </p>
                )}
            </div>
        </Button>
    );
}; 