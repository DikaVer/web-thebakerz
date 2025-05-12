'use client';

import React from "react";
import { Button, Chip, Divider, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { WorkHours } from "@/lib/actions/calendar-actions";
import { formatTime } from "@/components/settings/delivery/utils";
import { useSession } from "@/components/providers/session-provider";
import { convertMinutesToTimeComponents } from "@/lib/utils";
import { CountryDelivery } from "./types";
import { EU_COUNTRIES_PLUS_SWISS } from "@/lib/local-variables";
import { Icon } from "@iconify/react";

interface CountryListProps {
  countries: CountryDelivery[];
  onRemoveCountry: (countryCode: string) => void;
  onManageSchedule: (country: CountryDelivery, isCountry: boolean) => void;
  onTogglePostDelivery: (country: CountryDelivery, isPostDelivery: boolean) => void;
  onEditCountry?: (country: CountryDelivery) => void;
}

const CountryList: React.FC<CountryListProps> = ({
  countries,
  onRemoveCountry,
  onManageSchedule,
  onTogglePostDelivery,
  onEditCountry
}) => {
  const whT = useTranslations("Working Hours");
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

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

  if (countries.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {t("noCountriesSelected")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {countries.map(country => {
        const countryName = EU_COUNTRIES_PLUS_SWISS[country.countryCode] || country.countryCode;
        
        return (
          <div key={country.countryCode} className="flex flex-col bg-default-100 p-3 rounded-md">
            <Divider/>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{countryName}</span>
                <span className="ml-2 text-sm text-gray-500">({country.countryCode})</span>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2 items-center">
                  {onEditCountry && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      isIconOnly
                      onPress={() => onEditCountry(country)}
                      className="text-xs dark:text-white"
                    >
                      <Icon icon="solar:pen-linear" width={18} />
                    </Button>
                  )}    
                  {country.isStoreDelivery && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="light"
                      onPress={() => onManageSchedule(country, true)}
                      className="text-xs dark:text-white"
                    >
                      {t("deliverySchedule")}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isIconOnly
                    onPress={() => onRemoveCountry(country.countryCode)}
                  >
                    x
                  </Button>
                </div>
                {country.isStoreDelivery && (
                    <div className="flex items-center gap-2 mr-2">
                      <span className="text-xs">{t("ownDelivery")}</span>
                      <Switch
                        size="sm"
                        isSelected={country.isPostDelivery}
                        onValueChange={(checked) => onTogglePostDelivery(country, checked)}
                        aria-label={t("togglePostDelivery")}
                      />
                      <span className="text-xs">{t("postDelivery")}</span>
                    </div>
                  )}
              </div>
            </div>

            {/* Display delivery info */}
            <div className="mb-2 flex gap-2">
              <Chip
                size="sm"
                variant="flat"
                color={"primary"}
                className="text-xs dark:text-secondary"
              >
                {t("deliveryPrice")}: {formatCurrency(country.deliveryPriceInCents)}
              </Chip>
              <Chip
                size="sm"
                variant="flat"
                color={"primary"}
                className="text-xs dark:text-secondary"
              >
                {t("minOrderPrice")}: {formatCurrency(country.minOrderPriceInCents)}
              </Chip>
              {country.isPostDelivery && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={"warning"}
                  className="text-xs dark:text-secondary"
                >
                  {t("postalDelivery")}
                </Chip>
              )}
              {country.deliveryWindow && (
                <Chip
                  size="sm"
                  variant="flat"
                  color={"primary"}
                  className="text-xs dark:text-secondary"
                >
                  {t("deliveryWindow")}: {convertMinutesToTimeComponents(country.deliveryWindow).formatted}
                </Chip>
              )}
            </div>
            
            {country.isStoreDelivery && !country.isPostDelivery && (
              <div className="mt-1 text-xs">
                <div className="flex flex-col">
                  <span className="font-medium">{t("deliveryTimes")}:</span>
                  <span className="text-xs font-light">{t("minOrderTime")} {formatMinOrderTime(country.minOrderTime)}</span>
                </div>
                <div className="mt-1 text-gray-600">
                  {getScheduleSummary(country.deliverySchedule)}
                </div>
              </div>
            )}

            {country.isPostDelivery && (
              <div className="mt-1 text-xs">
                <div className="flex flex-col">
                  <span className="font-medium">{t("deliveryTimes")}:</span>
                  <span className="text-xs font-light">{t("minOrderTime")} {formatMinOrderTime(country.minOrderTime)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CountryList; 