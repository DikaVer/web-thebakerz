'use client';

import React from "react";
import {Divider, Spacer} from "@heroui/react";
import {WorkingHoursComp} from "@/components/settings/calendar/schedule-picker";
import {DayHoursComp} from "@/components/settings/calendar/day-picker";
import {useTranslations} from "next-intl";


const WorkingHoursManager = () => {
    const t = useTranslations("TheBakerz");

    return (
        <div>
            <p className="text-base font-medium text-default-700">{t("WorkingSchedule")}</p>
            <p className="mt-1 text-sm font-normal text-default-400">
                {t("WorkingScheduleDescription")}
            </p>
            <Spacer y={4}/>
            <WorkingHoursComp />
            <Spacer y={16}/>
            {/*<Divider/>*/}
            {/*<Spacer y={16}/>*/}
            {/*    <DayHoursComp/>*/}
            {/*<Spacer y={8}/>*/}
        </div>
    );
};

export default WorkingHoursManager;