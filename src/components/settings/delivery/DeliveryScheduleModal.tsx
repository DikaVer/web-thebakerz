'use client';

import React, { useState, useMemo, useEffect } from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, Select, SelectItem, Spacer } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Time } from '@internationalized/date';
import DayDeliveryTime from "./DayDeliveryTime";
import {WorkDay, WorkHours} from "@/lib/actions/calendar-actions";
import { Icon } from "@iconify/react";

interface DeliveryCity {
  name: string;
  range: number;
  priceInCents: number;
  minOrderPriceInCents: number;
  coordinates: { lat: number, lng: number };
  deliverySchedule?: WorkHours;
  isStoreDelivery: boolean;
  minOrderTime?: number;
}

interface DeliveryScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  city: DeliveryCity | null;
  deliverySchedule: WorkHours;
  setDeliveryTime: (
    day: string,
    data: { isEnabled: boolean; startTime: Time | null; endTime: Time | null }
  ) => void;
  saving: boolean;
  onMinOrderTimeChange?: (minutes: number) => void;
}

const DeliveryScheduleModal: React.FC<DeliveryScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  city,
  deliverySchedule,
  setDeliveryTime,
  saving,
  onMinOrderTimeChange
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const minTimeT = useTranslations("app/(return_page)/settings/components/calendar/min-time-order");
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const [minOrderTime, setMinOrderTime] = useState<string>(city?.minOrderTime?.toString() || "1440");


  const timeOptions = useMemo(() => {
    const options = [];
    const minutesInDay = 24 * 60;
    const maxMinutes = 2 * minutesInDay; // 2 days

    for (let minutes = 30; minutes <= maxMinutes; minutes += 30) {
      let label;
      if (minutes < 60) {
        label = `${minutes} ${minTimeT("minutes")}`;
      } else if (minutes < minutesInDay) {
        const hours = minutes / 60;
        label = `${hours} ${hours === 1 ? minTimeT("hour") : minTimeT("hours")}`;
      } else {
        const days = Math.floor(minutes / minutesInDay);
        const remainingHours = (minutes % minutesInDay) / 60;
        if (remainingHours === 0) {
          label = `${days} ${days === 1 ? minTimeT("day") : minTimeT("days")}`;
        } else {
          label = `${days} ${days === 1 ? minTimeT("day") : minTimeT("days")} ${remainingHours} ${remainingHours === 1 ? minTimeT("hour") : minTimeT("hours")}`;
        }
      }
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
        <ModalHeader>{t("manageDeliverySchedule")} - {city?.name}</ModalHeader>
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

              {/* Delivery Schedule Section */}
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
            </div>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
          >
            {t("cancel")}
          </Button>
          <Button
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