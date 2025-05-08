'use client';

import React, { useState } from "react";
import { Button, Slider, NumberInput, Card } from "@heroui/react";
import { useTranslations } from "next-intl";
import { DeliveryRange } from "./types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DeliveryRangeSettingsProps {
  cityName: string;
  ranges: DeliveryRange[];
  onRangeChange: (index: number, value: number) => void;
  onPriceChange: (index: number, value: string) => void;
  onMinOrderPriceChange: (index: number, value: string) => void;
  onSave: () => void;
  onAddRange: () => void;
  onRemoveRange: (index: number) => void;
}

const DeliveryRangeSettings: React.FC<DeliveryRangeSettingsProps> = ({
  cityName,
  ranges,
  onRangeChange,
  onPriceChange,
  onMinOrderPriceChange,
  onSave,
  onAddRange,
  onRemoveRange
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

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
        </Card>
      ))}

      <div className={'flex w-full justify-between'}>
        <Button
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