'use client';

import React from "react";
import {Spacer} from "@heroui/react";
import {WorkingHoursComp} from "@/components/settings/calendar/schedule-picker";
import {useTranslations} from "next-intl";
import {MinTimeOrder} from "@/components/settings/calendar/min-time-order";


const WorkingHoursManager = () => {
    const t = useTranslations("app/(return_page)/settings/components/calendar-settings");

    return (
        <div>
            <Spacer y={4}/>
            <MinTimeOrder />
            <Spacer y={8}/>
            <p className="text-base font-medium text-default-700">{t("workingSchedule")}</p>
            <p className="mt-1 text-sm font-normal text-default-400">
                {t("workingScheduleDescription")}
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