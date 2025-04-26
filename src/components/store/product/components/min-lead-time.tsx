import React, { useMemo } from "react";
import { Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { UseFormReturn } from "react-hook-form";
import { ProductSchema } from "@/lib/schemas/index";
import * as z from "zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

interface MinLeadTimeProps {
    form: UseFormReturn<z.infer<typeof ProductSchema>>;
    isPending?: boolean;
}

export const MinLeadTime: React.FC<MinLeadTimeProps> = ({ form, isPending }) => {
    const t = useTranslations("app/(store)/components/product-page");

    const timeOptions = useMemo(() => {
        const options = [];
        const minutesInDay = 24 * 60;
        const maxMinutes = 7 * minutesInDay; // 7 days

        for (let minutes = 30; minutes <= maxMinutes; minutes += 30) {
            let label;
            if (minutes < 60) {
                label = `${minutes} minutes`;
            } else if (minutes < minutesInDay) {
                const hours = minutes / 60;
                label = `${hours} ${hours === 1 ? "hour" : "hours"}`;
            } else {
                const days = Math.floor(minutes / minutesInDay);
                const remainingHours = (minutes % minutesInDay) / 60;
                if (remainingHours === 0) {
                    label = `${days} ${days === 1 ? "day" : "days"}`;
                } else {
                    label = `${days} ${days === 1 ? "day" : "days"} ${remainingHours} ${remainingHours === 1 ? "hour" : "hours"}`;
                }
            }
            options.push({ key: minutes.toString(), label });
        }
        return options;
    }, []);

    return (
        <div className="flex w-full justify-between">
            <div className="flex flex-col w-full">
                <div className="flex w-full justify-between">
                    <h3 className="text-lg font-medium">{t("MinimalLeadTime")}</h3>
                    <FormField
                        control={form.control}
                        name="min_lead_time"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormControl>
                                    <Select
                                        isDisabled={isPending}
                                        selectedKeys={field.value ? [field.value.toString()] : []}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        variant="underlined"
                                        classNames={{
                                            value: "text-lg cm:text-xl font-light",
                                            trigger: "h-8",
                                        }}
                                    >
                                        {timeOptions.map((option) => (
                                            <SelectItem key={option.key}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <h4 className="text-base text-default-400 font-medium mb-2">{t("MinimalLeadTimeDescription")}</h4>
            </div>
        </div>
    );
}; 