'use client';

import React, { useState, useMemo, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Select, SelectItem, Spacer } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Time } from '@internationalized/date';
import DayDeliveryTime from "./DayDeliveryTime";
import {WorkHours} from "@/lib/actions/calendar-actions";

interface DeliveryScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  deliverySchedule: WorkHours;
  minOrderTimeParam: number;
  setDeliveryTime: (
    day: string,
    data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
  ) => void;
  saving: boolean;
  onMinOrderTimeChange?: (minutes: number) => void;
  isPostDelivery?: boolean;
}

const DeliveryScheduleModal: React.FC<DeliveryScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  name,
  minOrderTimeParam,
  deliverySchedule,
  setDeliveryTime,
  saving,
  onMinOrderTimeChange,
  isPostDelivery = false
}) => {
  const minTimeT = useTranslations("app/(return_page)/settings/components/calendar/min-time-order");
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [minOrderTime, setMinOrderTime] = useState<string>(minOrderTimeParam.toString());

  // Update minOrderTime when the prop changes
  useEffect(() => {
    setMinOrderTime(minOrderTimeParam.toString());
  }, [minOrderTimeParam]);

  const timeOptions = useMemo(() => {
    const options = [];
    const minutesInDay = 24 * 60;
    
    // Add options from 30 minutes to 23.5 hours in 30-minute increments
    for (let minutes = 30; minutes <= 1410; minutes += 30) {
      let label;
      if (minutes < 60) {
        label = `${minutes} ${minTimeT("minutes")}`;
      } else {
        const hours = minutes / 60;
        label = `${hours} ${hours === 1 ? minTimeT("hour") : minTimeT("hours")}`;
      }
      options.push({ key: minutes.toString(), label });
    }
    
    // Add 1 to 30 days options
    for (let days = 1; days <= 30; days++) {
      const minutes = days * minutesInDay;
      const label = `${days} ${days === 1 ? minTimeT("day") : minTimeT("days")}`;
      options.push({ key: minutes.toString(), label });
    }
    
    return options;
  }, [minTimeT]);

  const handleMinOrderTimeChange = (value: string) => {
    setMinOrderTime(value);
    if (onMinOrderTimeChange) {
      onMinOrderTimeChange(parseInt(value));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>{t("manageDeliverySchedule")} - {name}</ModalHeader>
        <ModalBody>
          <ScrollShadow 
            className="max-h-[60vh] overflow-y-auto" 
            size={100}
            hideScrollBar
          >
            <div className="space-y-6">
              {/* Minimum Order Time Section */}
              <div>
                <p className="text-base font-medium text-default-700">{minTimeT("title")}</p>
                <p className="mt-1 text-sm font-normal text-default-400">
                  {minTimeT("description")}
                </p>
                <Spacer y={4} />
                <div className="flex flex-row gap-4">
                  <Select
                    className="max-w-xs"
                    label={minTimeT("selectLabel")}
                    placeholder={minTimeT("selectPlaceholder")}
                    selectedKeys={[minOrderTime]}
                    onChange={(e) => handleMinOrderTimeChange(e.target.value)}
                  >
                    {timeOptions.map((option) => (
                      <SelectItem key={option.key}>{option.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Delivery Schedule Section - Only show for store delivery */}
              {!isPostDelivery && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{t("deliveryScheduleDescription")}</p>
                  
                  <div className="mt-4 space-y-4">
                    {daysOfWeek.map((day) => (
                      <div key={day}>
                        <DayDeliveryTime
                          day={day}
                          isLoading={saving}
                          // @ts-ignore
                          initialEnabled={deliverySchedule[day]?.isEnabled ?? false}
                          initialStartTime={
                            // @ts-ignore
                            deliverySchedule[day]?.start
                              // @ts-ignore
                              ? new Time(deliverySchedule[day].start.hour, deliverySchedule[day].start.minute)
                              : new Time(9, 0)
                          }
                          initialEndTime={
                            // @ts-ignore
                            deliverySchedule[day]?.end
                              // @ts-ignore
                              ? new Time(deliverySchedule[day].end.hour, deliverySchedule[day].end.minute)
                              : new Time(17, 0)
                          }
                          setDeliveryTime={setDeliveryTime}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <Button
            aria-label="Cancel"
            color="danger"
            variant="light"
            onPress={onClose}
          >
            {t("cancel")}
          </Button>
          <Button
            aria-label="Save"
            color="primary"
            onPress={onSave}
          >
            {t("save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeliveryScheduleModal; 