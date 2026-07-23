/**
 * @fileoverview Per-day delivery time row for delivery schedule editing.
 *
 * Exports the DayDeliveryTime client component, which renders start and end
 * time selects (in 30-minute steps) and an enable switch for one weekday,
 * validates that the start time precedes the end time, and reports changes to
 * the parent through the setDeliveryTime callback.
 */
'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Switch, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Time } from '@internationalized/date';

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
  const t_c = useTranslations();
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [isInvalid, setIsInvalid] = useState(false);
  
  // Create time options for select dropdowns
  const timeOptions = useMemo(() => {
    const options = [];
    
    // Add options for every 30 minutes from 00:30 to 23:30
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const time = new Time(hour, minute);
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const label = `${formattedHour}:${formattedMinute}`;
        const value = `${hour}:${minute}`;
        
        options.push({ label, value, time });
      }
    }
    
    return options;
  }, []);

  // Format time to string (HH:MM)
  const formatTimeKey = (time: Time) => {
    return `${time.hour}:${time.minute}`;
  };

  useEffect(() => {
    if (startTime.hour < endTime.hour ||
      (startTime.hour === endTime.hour && startTime.minute < endTime.minute)) {
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  }, [startTime, endTime]);

  const handleStartChange = (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    const newTime = new Time(hour, minute);
    
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
  };

  const handleEndChange = (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    const newTime = new Time(hour, minute);
    
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
  };

  return (
    <div className="mb-4">
      <p className="mt-1 text-xs font-normal text-default-400 capitalize">{t_c(`Working Hours.${day}`)}</p>
      <div className="flex flex-row mt-2">
        <Select
          isDisabled={!isEnabled || isLoading}
          selectedKeys={[formatTimeKey(startTime)]}
          onChange={(e) => handleStartChange(e.target.value)}
          label={t("startTime")}
          className="w-1/3"
          classNames={{ 
            trigger: 'rounded-r-none shadow-none',
            base: isInvalid ? 'border-danger' : '' 
          }}
          labelPlacement="inside"
          isInvalid={isInvalid}
          errorMessage={isInvalid ? t("startTimeError") : ""}
        >
          {timeOptions.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
        <Select
          isDisabled={!isEnabled || isLoading}
          selectedKeys={[formatTimeKey(endTime)]}
          onChange={(e) => handleEndChange(e.target.value)}
          label={t("endTime")}
          className="w-1/3"
          classNames={{ 
            trigger: 'rounded-none shadow-none',
            base: isInvalid ? 'border-danger' : '' 
          }}
          labelPlacement="inside"
          isInvalid={isInvalid}
          errorMessage={isInvalid ? t("endTimeError") : ""}
        >
          {timeOptions.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
        <Switch
          classNames={{ wrapper: 'bg-danger-600' }}
          isSelected={isEnabled}
          onValueChange={(newState) => {
            setIsEnabled(newState);
            setDeliveryTime(day, { isEnabled: newState, startTime, endTime });
          }}
          className={`flex items-center justify-center h-[56px] 
            ${!isInvalid ? 'bg-default-100' : 'bg-danger-50'} 
            ${!isEnabled && 'opacity-50'} rounded-r-medium px-4`}
          color={'success'}
        />
      </div>
    </div>
  );
};

export default DayDeliveryTime; 