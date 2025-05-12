"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Spacer, Select, SelectItem, Button, Divider } from "@heroui/react";
import { updateMinOrderTime, updatePickupWindow } from "@/lib/actions/store";
import showErrorMessage from "@/components/toast/toast-error";
import { Icon } from "@iconify/react";
import showSuccessMessage from "@/components/toast/toast-succes";
import {useTranslations} from "next-intl";
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";
import { logger } from "@/lib/logger";

interface MinTimeOrderProps {
    storeId?: string;
    initialValue?: number;
    initialPickupWindow?: number;
}

export const MinTimeOrder: React.FC<MinTimeOrderProps> = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/min-time-order");
    const { session, registerSaveHandler, setSaveOpen } = useSession();
    const { store } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [minOrderTime, setMinOrderTime] = useState<string>("30");
    const [initialMinOrderTime, setInitialMinOrderTime] = useState<string>("30");
    const [pickupWindow, setPickupWindow] = useState<string>("15");
    const [initialPickupWindow, setInitialPickupWindow] = useState<string>("15");
    const [timeChanged, setTimeChanged] = useState(false);
    const [pickupWindowChanged, setPickupWindowChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (store) {
            if (store.minTimeOrder) {
                const timeValue = store.minTimeOrder.toString();
                setMinOrderTime(timeValue);
                setInitialMinOrderTime(timeValue);
            }
            
            if (store.pickupWindow) {
                const windowValue = store.pickupWindow.toString();
                setPickupWindow(windowValue);
                setInitialPickupWindow(windowValue);
            }
            
            setIsVisible(true);
        }
    }, [store]);

    const timeOptions = useMemo(() => {
        const options = [];
        const minutesInDay = 24 * 60;
        
        // Add options from 30 minutes to 23.5 hours in 30-minute increments
        for (let minutes = 30; minutes <= 1410; minutes += 30) {
            let label;
            if (minutes < 60) {
                label = `${minutes} ${t("minutes")}`;
            } else {
                const hours = minutes / 60;
                label = `${hours} ${hours === 1 ? t("hour") : t("hours")}`;
            }
            options.push({ key: minutes.toString(), label });
        }
        
        // Add 1 to 30 days options
        for (let days = 1; days <= 30; days++) {
            const minutes = days * minutesInDay;
            const label = `${days} ${days === 1 ? t("day") : t("days")}`;
            options.push({ key: minutes.toString(), label });
        }
        
        return options;
    }, [t]);

    const pickupWindowOptions = useMemo(() => [
        { key: "15", label: `15 ${t("minutes")}` },
        { key: "30", label: `30 ${t("minutes")}` }
    ], [t]);

    // Handle changes to min order time
    const handleTimeChange = (newTime: string) => {
        setMinOrderTime(newTime);
        
        // Check if the value has changed from the initial value
        if (newTime !== initialMinOrderTime && !timeChanged) {
            setTimeChanged(true);
            setSaveOpen(true);
            logger.debug('minTimeOrder', 'value changed, showing save button');
        } else if (newTime === initialMinOrderTime && timeChanged) {
            setTimeChanged(false);
            logger.debug('minTimeOrder', 'value reverted to original');
        }
    };

    // Handle changes to pickup window
    const handlePickupWindowChange = (newWindow: string) => {
        setPickupWindow(newWindow);
        
        // Check if the value has changed from the initial value
        if (newWindow !== initialPickupWindow && !pickupWindowChanged) {
            setPickupWindowChanged(true);
            setSaveOpen(true);
            logger.debug('pickupWindow', 'value changed, showing save button');
        } else if (newWindow === initialPickupWindow && pickupWindowChanged) {
            setPickupWindowChanged(false);
            logger.debug('pickupWindow', 'value reverted to original');
        }
    };

    // Register save handler
    useEffect(() => {
        const handleSave = async () => {
            logger.debug('timeSettings', 'save handler called', { timeChanged, pickupWindowChanged });
            
            if (!timeChanged && !pickupWindowChanged) {
                logger.debug('timeSettings', 'no changes to save');
                return false;
            }
            
            setIsLoading(true);
            let success = true;
            
            try {
                if (timeChanged) {
                    logger.debug('minTimeOrder', 'saving min order time', { minOrderTime });
                    await updateMinOrderTime(store?.id, parseInt(minOrderTime));
                    setInitialMinOrderTime(minOrderTime);
                    setTimeChanged(false);
                }
                
                if (pickupWindowChanged) {
                    logger.debug('pickupWindow', 'saving pickup window', { pickupWindow });
                    await updatePickupWindow(store?.id, parseInt(pickupWindow));
                    setInitialPickupWindow(pickupWindow);
                    setPickupWindowChanged(false);
                }
                
                logger.debug('timeSettings', 'saved successfully');
            } catch (error) {
                logger.error('timeSettings', 'failed to update settings', { error });
                showErrorMessage({ error: t("errorMessage") });
                success = false;
            } finally {
                setIsLoading(false);
            }
            
            return success;
        };
        
        logger.debug('timeSettings', 'registering save handler');
        registerSaveHandler('time-settings', handleSave);
        
        return () => {
            logger.debug('timeSettings', 'cleanup - component unmounting');
        };
    }, [registerSaveHandler, timeChanged, pickupWindowChanged, minOrderTime, pickupWindow, store?.id, t]);

    if (!isVisible) {
        return null;
    }

    return (
        <div>
            <div className="w-full flex flex-col justify-between">
                <div>
                    <p className="text-base font-medium text-default-700">{t("title")}</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        {t("description")}
                    </p>
                </div>
                <Spacer y={4} />
                <div className="flex flex-row gap-4">
                    <Select
                        className="max-w-xs"
                        label={t("selectLabel")}
                        placeholder={t("selectPlaceholder")}
                        selectedKeys={[minOrderTime]}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        isDisabled={isLoading}
                    >
                        {timeOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>
                </div>
                
                <Spacer y={8} />
                <Divider />
                <Spacer y={4} />
                
                <div>
                    <p className="text-base font-medium text-default-700">{t("pickupWindowTitle") || "Pickup Window"}</p>
                    <p className="mt-1 text-sm font-normal text-default-400">
                        {t("pickupWindowDescription") || "Define how long the customer has to pick up their order."}
                    </p>
                </div>
                <Spacer y={4} />
                <div className="flex flex-row gap-4">
                    <Select
                        className="max-w-xs"
                        label={t("pickupWindowLabel") || "Pickup Window"}
                        placeholder={t("pickupWindowPlaceholder") || "Select pickup window"}
                        selectedKeys={[pickupWindow]}
                        onChange={(e) => handlePickupWindowChange(e.target.value)}
                        isDisabled={isLoading}
                    >
                        {pickupWindowOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
        </div>
    );
};