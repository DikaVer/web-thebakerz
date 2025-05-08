"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Spacer, Select, SelectItem, Button } from "@heroui/react";
import { updateMinOrderTime } from "@/lib/actions/store";
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
}

export const MinTimeOrder: React.FC<MinTimeOrderProps> = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/min-time-order");
    const { session, registerSaveHandler, setSaveOpen } = useSession();
    const { store } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [minOrderTime, setMinOrderTime] = useState<string>("30");
    const [initialMinOrderTime, setInitialMinOrderTime] = useState<string>("30");
    const [timeChanged, setTimeChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (store?.minTimeOrder) {
            const timeValue = store.minTimeOrder.toString();
            setMinOrderTime(timeValue);
            setInitialMinOrderTime(timeValue);
            setIsVisible(true);
        }
    }, [store?.minTimeOrder]);

    const timeOptions = useMemo(() => {
        const options = [];
        const minutesInDay = 24 * 60;
        const maxMinutes = 7 * minutesInDay; // 7 days

        for (let minutes = 30; minutes <= maxMinutes; minutes += 30) {
            let label;
            if (minutes < 60) {
                label = `${minutes} ${t("minutes")}`;
            } else if (minutes < minutesInDay) {
                const hours = minutes / 60;
                label = `${hours} ${hours === 1 ? t("hour") : t("hours")}`;
            } else {
                const days = Math.floor(minutes / minutesInDay);
                const remainingHours = (minutes % minutesInDay) / 60;
                if (remainingHours === 0) {
                    label = `${days} ${days === 1 ? t("day") : t("days")}`;
                } else {
                    label = `${days} ${days === 1 ? t("day") : t("days")} ${remainingHours} ${remainingHours === 1 ? t("hour") : t("hours")}`;
                }
            }
            options.push({ key: minutes.toString(), label });
        }
        return options;
    }, [t]);

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

    // Register save handler
    useEffect(() => {
        const handleSaveMinTime = async () => {
            logger.debug('minTimeOrder', 'save handler called', { timeChanged });
            
            if (!timeChanged) {
                logger.debug('minTimeOrder', 'no changes to save');
                return false;
            }
            
            setIsLoading(true);
            try {
                logger.debug('minTimeOrder', 'saving min order time', { minOrderTime });
                await updateMinOrderTime(store?.id, parseInt(minOrderTime));
                
                // Update the initial value to the new value
                setInitialMinOrderTime(minOrderTime);
                setTimeChanged(false);
                setIsLoading(false);
                logger.debug('minTimeOrder', 'saved successfully');
                return true;
            } catch (error) {
                logger.error('minTimeOrder', 'failed to update minimum order time', { error });
                showErrorMessage({ error: t("errorMessage") });
                setIsLoading(false);
                return false;
            }
        };
        
        logger.debug('minTimeOrder', 'registering save handler');
        registerSaveHandler('min-order-time', handleSaveMinTime);
        
        return () => {
            logger.debug('minTimeOrder', 'cleanup - component unmounting');
        };
    }, [registerSaveHandler, timeChanged, minOrderTime, store?.id, t]);

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
            </div>
        </div>
    );
};