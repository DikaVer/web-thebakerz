'use client';

import React from "react";
import {Spacer} from "@heroui/react";
import {WorkingHoursComp} from "@/components/settings/calendar/schedule-picker";


const WorkingHoursManager = () => {

    return (
        <div>
            <p className="text-base font-medium text-default-700">Working Schedule</p>
            <p className="mt-1 text-sm font-normal text-default-400">
                Set your working hours for each day of the week
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
