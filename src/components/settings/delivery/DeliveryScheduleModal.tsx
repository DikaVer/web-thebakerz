'use client';

import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Time } from '@internationalized/date';
import DayDeliveryTime from "./DayDeliveryTime";
import {WorkDay, WorkHours} from "@/lib/actions/calendar-actions";

interface DeliveryCity {
  name: string;
  deliverySchedule?: WorkHours;
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
}

const DeliveryScheduleModal: React.FC<DeliveryScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  city,
  deliverySchedule,
  setDeliveryTime,
  saving
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{t("deliveryScheduleDescription")}</p>
            
            <div className="mt-4">
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