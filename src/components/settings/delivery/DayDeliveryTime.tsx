'use client';

import React, { useEffect, useState } from "react";
import { Switch, TimeInput } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Time } from '@internationalized/date';
import { WorkDay } from "@/lib/actions/calendar-actions";

interface DayDeliveryTimeProps {
  day: string;
  isLoading: boolean;
  setDeliveryTime: (
    day: string,
    data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
  ) => void;
  initialEnabled?: boolean;
  initialStartTime?: Time;
  initialEndTime?: Time;
}

const DayDeliveryTime: React.FC<DayDeliveryTimeProps> = ({
  day,
  isLoading,
  setDeliveryTime,
  initialEnabled = false,
  initialStartTime = new Time(9, 0),
  initialEndTime = new Time(17, 0),
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const whT = useTranslations("Working Hours");

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (startTime.hour < endTime.hour ||
      (startTime.hour === endTime.hour && startTime.minute < endTime.minute)) {
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  }, [startTime, endTime]);

  const handleStartChange = (newTime: Time | null) => {
    if (newTime && endTime) {
      setStartTime(newTime);
      setDeliveryTime(day, { isEnabled, startTime: newTime, endTime });

      if (
        (newTime.hour < endTime.hour ||
          (newTime.hour === endTime.hour && newTime.minute < endTime.minute))
      ) {
        setIsInvalid(false);
      } else {
        setIsInvalid(true);
      }
    }
  };

  const handleEndChange = (newTime: Time | null) => {
    if (newTime && startTime) {
      setEndTime(newTime);
      setDeliveryTime(day, { isEnabled, startTime, endTime: newTime });

      if (
        (newTime.hour > startTime.hour ||
          (newTime.hour === startTime.hour && newTime.minute > startTime.minute))
      ) {
        setIsInvalid(false);
      } else {
        setIsInvalid(true);
      }
    }
  };

  return (
    <div className="mb-4">
      <p className="mt-1 text-xs font-normal text-default-400 capitalize">{whT(day)}</p>
      <div className="flex flex-row mt-2">
        <TimeInput
          isDisabled={!isEnabled || isLoading}
          // @ts-ignore
          defaultValue={startTime}
          label={t("startTime")}
          classNames={{ inputWrapper: 'rounded-r-none shadow-none' }}
          isInvalid={isInvalid}
          labelPlacement="inside"
          errorMessage={t("startTimeError")}
          // @ts-ignore
          onChange={handleStartChange}
        />
        <TimeInput
          isDisabled={!isEnabled || isLoading}
          // @ts-ignore
          defaultValue={endTime}
          isInvalid={isInvalid}
          label={t("endTime")}
          classNames={{ inputWrapper: 'rounded-none shadow-none' }}
          labelPlacement="inside"
          errorMessage={t("endTimeError")}
          // @ts-ignore
          onChange={handleEndChange}
        />
        <Switch
          classNames={{ wrapper: 'bg-danger-600' }}
          isSelected={isEnabled}
          onValueChange={(newState) => {
            setIsEnabled(newState);
            setDeliveryTime(day, { isEnabled: newState, startTime, endTime });
          }}
          className={`${
            !isInvalid ? 'bg-default-100 mb-2' : 'bg-danger-50 mb-6'
          } ${!isEnabled && 'opacity-50'} rounded-r-medium px-4`}
          color={'success'}
        />
      </div>
    </div>
  );
};

export default DayDeliveryTime; 