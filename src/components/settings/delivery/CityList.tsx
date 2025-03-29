'use client';

import React from "react";
import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { WorkHours } from "@/lib/actions/calendar-actions";
import {formatTime} from "@/components/settings/delivery/utils";

interface DeliveryCity {
  name: string;
  range: number;
  priceInCents: number;
  minOrderPriceInCents: number;
  coordinates: { lat: number, lng: number };
  deliverySchedule?: WorkHours;
}

interface CityListProps {
  cities: DeliveryCity[];
  onRemoveCity: (cityName: string) => void;
  onManageSchedule: (city: DeliveryCity) => void;
}

const CityList: React.FC<CityListProps> = ({ 
  cities, 
  onRemoveCity, 
  onManageSchedule
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  const whT = useTranslations("Working Hours");

  // Get a summary of the delivery schedule for display
  const getScheduleSummary = (schedule?: WorkHours) => {
    if (!schedule) return <div>{t("noDeliveryDays")}</div>;
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const enabledDays = daysOfWeek.filter(day => schedule[day as keyof WorkHours]?.isEnabled);
    if (enabledDays.length === 0) return <div>{t("noDeliveryDays")}</div>;
    if (enabledDays.length === 7) return <div>{t("deliveryAllWeek")}</div>;

    return (
      <div className="grid gap-1 max-w-xs">
        {enabledDays.map(day => {
          const daySchedule = schedule[day as keyof WorkHours];
          if (!daySchedule) return null;
          return (
            <div key={day} className="flex justify-between text-xs">
              <span className="font-medium">{whT(day)}:</span>
              <span>{formatTime(daySchedule.start)} - {formatTime(daySchedule.end)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (cities.length === 0) {
    return (
        <p className="text-sm text-gray-500">
          {t("noCitiesSelected")}
        </p>
    );
  }

  return (
    <div className="grid gap-2">
      {cities.map(city => (
        <div key={city.name} className="flex flex-col bg-default-100 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-medium">{city.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {city.range} km
              </span>
              <span className="ml-2 text-sm font-medium">
                {formatCurrency(city.priceInCents)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="light"
                onPress={() => onManageSchedule(city)}
                className="text-xs"
              >
                {t("deliverySchedule")}
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="light"
                isIconOnly
                onPress={() => onRemoveCity(city.name)}
              >
                ×
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {t("minOrderPrice")}: {formatCurrency(city.minOrderPriceInCents)}
          </div>
          <div className="mt-1 text-xs">
            <span className="font-medium">{t("deliveryTimes")}:</span>
            <div className="mt-1 text-gray-600">
              {getScheduleSummary(city.deliverySchedule)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CityList; 