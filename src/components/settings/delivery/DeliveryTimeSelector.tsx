/**
 * @fileoverview Controlled per-day delivery time selector with enable switch.
 *
 * Exports the DeliveryTimeSelector client component, a fully controlled row
 * that toggles delivery for a given day and selects start and end times in
 * 30-minute steps, emitting every change to the parent through the onChange
 * callback as Time values.
 */
'use client';

import React from "react";
import { Switch, Select, SelectItem } from "@heroui/react";
import { Time } from '@internationalized/date';

interface DeliveryTimeSelectorProps {
  day: string;
  label: string;
  isEnabled: boolean;
  startTime?: { hour: number; minute: number };
  endTime?: { hour: number; minute: number };
  onChange: (day: string, data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }) => void;
}

const DeliveryTimeSelector: React.FC<DeliveryTimeSelectorProps> = ({
  day,
  label,
  isEnabled,
  startTime = { hour: 9, minute: 0 },
  endTime = { hour: 17, minute: 0 },
  onChange
}) => {
  // Convert time object to Time
  const getTime = (time: { hour: number; minute: number } | undefined) => {
    if (!time) return null;
    return new Time(time.hour, time.minute);
  };

  // Generate time options for select
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        options.push({ value: `${h}:${m}`, label: `${hour}:${minute}` });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleEnabledChange = (checked: boolean) => {
    onChange(day, {
      isEnabled: checked,
      startTime: getTime(startTime),
      endTime: getTime(endTime)
    });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [hour, minute] = e.target.value.split(':').map(Number);
    onChange(day, {
      isEnabled,
      startTime: new Time(hour, minute),
      endTime: getTime(endTime)
    });
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [hour, minute] = e.target.value.split(':').map(Number);
    onChange(day, {
      isEnabled,
      startTime: getTime(startTime),
      endTime: new Time(hour, minute)
    });
  };

  return (
    <div className="p-3 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{label}</span>
        <Switch 
          isSelected={isEnabled}
          onValueChange={handleEnabledChange}
          size="sm"
        />
      </div>
      
      {isEnabled && (
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <label className="text-xs mb-1 block">From</label>
            <Select
              size="sm"
              value={`${startTime.hour}:${startTime.minute}`}
              onChange={handleStartTimeChange}
              className="w-full"
            >
              {timeOptions.map(option => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="text-xs mb-1 block">To</label>
            <Select
              size="sm"
              value={`${endTime.hour}:${endTime.minute}`}
              onChange={handleEndTimeChange}
              className="w-full"
            >
              {timeOptions.map(option => (
                <SelectItem key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTimeSelector; 