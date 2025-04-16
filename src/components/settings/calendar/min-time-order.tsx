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

interface MinTimeOrderProps {
    storeId?: string;
    initialValue?: number;
}

export const MinTimeOrder: React.FC<MinTimeOrderProps> = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar/min-time-order");
    const { session } = useSession();
    const { store } = useStore();
    const [isVisible, setIsVisible] = useState(false);
    const [minOrderTime, setMinOrderTime] = useState<string>("30");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (store?.minTimeOrder) {
            setMinOrderTime(store.minTimeOrder.toString());
            setIsVisible(true);
        }
    }, [store?.minTimeOrder]);

    const timeOptions = useMemo(() => {
        const options = [];
        const minutesInDay = 24 * 60;
        const maxMinutes = 2 * minutesInDay; // 2 days

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

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateMinOrderTime(store?.id, parseInt(minOrderTime));
            showSuccessMessage({ success: t("successMessage") });
        } catch (error) {
            showErrorMessage({ error: t("errorMessage") });
            console.error("Failed to update minimum order time:", error);
        } finally {
            setIsLoading(false);
        }
    };

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
                        onChange={(e) => setMinOrderTime(e.target.value)}
                    >
                        {timeOptions.map((option) => (
                            <SelectItem key={option.key}>{option.label}</SelectItem>
                        ))}
                    </Select>
                    <Button
                        color="secondary"
                        isIconOnly
                        className={"h-14 px-0 w-14 shadow-small text-black"}
                        onPress={handleSave}
                        isLoading={isLoading}
                    >
                        <Icon icon="solar:clipboard-add-linear" width={24} />
                    </Button>
                </div>
            </div>
        </div>
    );
};