'use client';

import React from "react";
import { Button, Image, Chip, Divider } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { WorkHours } from "@/lib/actions/calendar-actions";
import {formatTime} from "@/components/settings/delivery/utils";
import { useSession } from "@/components/providers/session-provider";
import { DeliveryCity } from "./types";


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

  const whT = useTranslations("Working Hours");
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");
  const { session } = useSession();


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

  // Format minOrderTime for display
  const formatMinOrderTime = (minutes: number) => {
    const minutesInDay = 24 * 60;
    if (minutes < 60) {
      return `${minutes} ${t("minutes")}`;
    } else if (minutes < minutesInDay) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? t("hour") : t("hours")}`;
    } else {
      const days = Math.floor(minutes / minutesInDay);
      const remainingHours = (minutes % minutesInDay) / 60;
      if (remainingHours === 0) {
        return `${days} ${days === 1 ? t("day") : t("days")}`;
      } else {
        return `${days} ${days === 1 ? t("day") :t("days")} ${remainingHours} ${remainingHours === 1 ? t("hour") :t("hours")}`;
      }
    }
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
          <Divider/>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-medium">{city.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {city.ranges.length > 1 
                  ? `${city.ranges[0].range} - ${city.ranges[city.ranges.length - 1].range} km`
                  : `${city.ranges[0].range} km`
                }
              </span>
            </div>
            <div className="flex gap-2">
              {city.isStoreDelivery ? (
                <>
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    onPress={() => onManageSchedule(city)}
                    className="text-xs dark:text-white"
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
                    x
                  </Button>
                </>
             ) : (
              <>
               {session?.user?.role === "admin" && (
                  <>
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
                      x
                    </Button>
                  </>
                )}
                  <Image
                    src="/images/TheBakerzLogo.svg"
                    width={32}
                    height={32}
                    alt={t("brandName") + " Logo"}
                  />
                </>   
              )}
            </div>
          </div>

          {/* Display ranges */}
          <div className="mb-2 flex flex-wrap gap-1">
            {city.ranges.map((range, idx) => (
              <Chip 
                key={idx} 
                size="sm" 
                variant="flat" 
                color={"primary"}
                className="text-xs dark:text-secondary"
              >
                {range.range} km: {formatCurrency(range.deliveryPriceInCents)} / min: {formatCurrency(range.minOrderPriceInCents)}
              </Chip>
            ))}
          </div>
          
          <div className="mt-1 text-xs">
            <div className="flex flex-col">
              <span className="font-medium">{t("deliveryTimes")}:</span>
              <span className="text-xs font-light">{t("minOrderTime")} {formatMinOrderTime(city.minOrderTime)}</span>
            </div>
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