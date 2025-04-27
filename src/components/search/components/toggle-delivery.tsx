'use client';

import React from 'react';
import { Button, ButtonGroup, cn } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

interface ToggleDeliveryProps {
    currentMode: 'pickup' | 'delivery';
    onModeChange: (newMode: 'pickup' | 'delivery') => void;
    isLoading?: boolean; // Optional loading state
    isDisabled?: boolean; // Allow disabling the toggle
}

export function ToggleDelivery({ 
    currentMode, 
    onModeChange,
    isLoading = false,
    isDisabled = false
}: ToggleDeliveryProps) {
    const t = useTranslations("search.components"); // Assuming a namespace for search components
    const isDelivery = currentMode === 'delivery';

    return (
        <div className="flex items-start justify-end w-full">
            <div className="relative p-1 rounded-xl bg-default-100 shadow-sm">
                <ButtonGroup 
                    className="relative z-10 overflow-hidden" 
                    isDisabled={isDisabled || isLoading}
                >
                    <Button
                        disableRipple
                        onPress={() => !isDisabled && !isLoading && onModeChange('pickup')}
                        className={cn(
                            "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                            !isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                            isDisabled || isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
                        )}
                        variant="light"
                        isDisabled={isDisabled || isLoading}
                    >
                        <div className="flex items-center gap-2">
                            <Icon
                                icon="solar:shop-2-bold"
                                width={20}
                                height={20}
                                className={cn(
                                    "transition-all duration-300",
                                    !isDelivery ? "text-primary" : "text-default-500"
                                )}
                            />
                            <span className="text-sm">{t('toggleDelivery.pickup')}</span>
                        </div>
                    </Button>
                    <Button
                        disableRipple
                        onPress={() => !isDisabled && !isLoading && onModeChange('delivery')}
                        className={cn(
                            "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                            isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                            isDisabled || isLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
                        )}
                        variant="light"
                        isDisabled={isDisabled || isLoading}
                    >
                        <div className="flex items-center gap-2">
                            <Icon
                                icon="solar:scooter-bold"
                                width={20}
                                height={20}
                                className={cn(
                                    "transition-all duration-300",
                                    isDelivery ? "text-primary" : "text-default-500"
                                )}
                            />
                            <span className="text-sm">{t('toggleDelivery.delivery')}</span>
                        </div>
                    </Button>
                </ButtonGroup>
                {/* Animated background pill */}
                <div
                    className={cn(
                        "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-default-50 dark:bg-default-700 shadow-md transition-transform duration-300 ease-in-out", // Use bg-background for better theme compatibility
                        isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[8px]" // Adjusted translation slightly
                    )}
                    style={{
                        left: 0, // Align the pill with the buttons
                        // Using translate avoids potential layout shifts compared to `left`
                    }}
                />
            </div>
        </div>
    );
}
