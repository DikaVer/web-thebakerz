/**
 * @fileoverview Editor for a city's distance-based delivery ranges.
 *
 * Exports the DeliveryRangeSettings client component, which renders a card
 * per delivery range with a distance slider (up to 50 km, maximum five
 * ranges), delivery price and minimum order price inputs in euros, and a
 * delivery window select whose options depend on whether postal delivery is
 * enabled. All changes and the add/remove/save actions are delegated to
 * parent callbacks.
 */
'use client';

import React, { useState } from "react";
import { Button, Slider, NumberInput, Card, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { DeliveryRange } from "./types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DeliveryRangeSettingsProps {
  cityName: string;
  ranges: DeliveryRange[];
  isPostDelivery: boolean;
  onRangeChange: (index: number, value: number) => void;
  onPriceChange: (index: number, value: string) => void;
  onMinOrderPriceChange: (index: number, value: string) => void;
  onDeliveryWindowChange: (index: number, value: number) => void;
  onSave: () => void;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
}

const DeliveryRangeSettings: React.FC<DeliveryRangeSettingsProps> = ({
  cityName,
  ranges,
  isPostDelivery,
  onRangeChange,
  onPriceChange,
  onMinOrderPriceChange,
  onDeliveryWindowChange,
  onSave,
  onAddRange,
  onRemoveRange
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  // Generate delivery window options based on isPostDelivery
  const getDeliveryWindowOptions = () => {
    if (isPostDelivery) {
      // For postal delivery: 1-15 days
      return Array.from({ length: 15 }, (_, i) => {
        const days = i + 1;
        return {
          value: days * 24 * 60, // Convert to minutes
          label: `${days} ${days === 1 ? t("day") : t("days")}`
        };
      });
    } else {
      // For regular delivery: 15 minutes to 3 hours in 15-minute increments
      return Array.from({ length: 12 }, (_, i) => {
        const minutes = (i + 1) * 15;
        if (minutes < 60) {
          return {
            value: minutes,
            label: `${minutes} ${t("minutes")}`
          };
        } else {
          const hours = minutes / 60;
          return {
            value: minutes,
            label: `${hours} ${hours === 1 ? t("hour") : t("hours")}`
          };
        }
      });
    }
  };

  const deliveryWindowOptions = getDeliveryWindowOptions();

  return (
    <div className="space-y-4">
      {ranges.map((rangeSettings, index) => (
        <Card shadow="none" key={index} className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                {cityName} {t("deliveryRange")} {index + 1}: {rangeSettings.range} km
              </label>
              {index > 0 && (
                <Button 
                  aria-label="Remove range"
                  isIconOnly
                  color="danger" 
                  variant="flat" 
                  size="sm" 
                  onPress={() => onRemoveRange(index)}
                >
                  x
                </Button>
              )}
            </div>
            <Slider 
              size="sm"
              step={1}
              minValue={index === 0 ? 1 : ranges[index-1].range + 1}
              maxValue={50}
              value={rangeSettings.range}
              onChange={(val) => onRangeChange(index, typeof val === 'number' ? val : val[0])}
              className="w-full"
            />
            {index === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {t("deliveryDescription")}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("deliveryPrice")}
            </label>
            <NumberInput
              min={0}
              step={0.05}
              value={(rangeSettings.deliveryPriceInCents / 100)}
              onChange={(value) => {
                if (typeof value === "number") {
                  onPriceChange(index, value.toString());
                } else {
                  onPriceChange(index, value.target.value);
                }
              }}
              placeholder={t("priceLabel")}
              classNames={{
                input: "text-base font-light",
                inputWrapper: "h-8 w-24",
              }}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400">€</span>
                </div>
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("minOrderPrice")}
            </label>
            <NumberInput
              min={10}
              step={0.05}
              value={(rangeSettings.minOrderPriceInCents / 100)}
              onChange={(value) => {
                if (typeof value === "number") {
                  onMinOrderPriceChange(index, value.toString());
                } else {
                  onMinOrderPriceChange(index, value.target.value);
                }
              }}
              placeholder={t("minPriceLabel")}
              classNames={{
                input: "text-base font-light",
                inputWrapper: "h-8 w-24",
              }}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400">€</span>
                </div>
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("minOrderPriceDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("deliveryWindow") || "Delivery Window"}
            </label>
            <Select
              placeholder={t("selectDeliveryWindow") || "Select Delivery Window"}
              selectedKeys={[rangeSettings.deliveryWindow?.toString()]}
              onChange={(e) => onDeliveryWindowChange(index, parseInt(e.target.value))}
              className="max-w-xs"
              size="sm"
            >
              {deliveryWindowOptions.map((option) => (
                <SelectItem key={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {t("deliveryWindowDescription") || "How long the customer has to receive their delivery"}
            </p>
          </div>
        </Card>
      ))}

      <div className={'flex w-full justify-between'}>
        <Button
          aria-label="Add range"
          color="primary"
          variant="flat"
          onPress={onAddRange}
          size="sm"
          className="mt-2 shadow-small"
          startContent={<Icon icon="solar:add-circle-bold" width={16} />}
          isDisabled={ranges.length === 0 || ranges.length >= 5}
        >
          {t("addRange")}
        </Button>
        
        <Button
          aria-label="Add city"
          color="secondary"
          onPress={onSave}
          size="sm"
          className="mt-2 shadow-small text-white"
        >
          {t("addCity")}
        </Button>
      </div>
    </div>
  );
};

export default DeliveryRangeSettings; 