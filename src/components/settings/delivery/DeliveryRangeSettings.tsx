'use client';

import React from "react";
import { Button, Slider, NumberInput } from "@heroui/react";
import { useTranslations } from "next-intl";

interface DeliveryRangeSettingsProps {
  cityName: string;
  deliveryRange: number;
  deliveryPriceInCents: number;
  minOrderPriceInCents: number;
  onRangeChange: (value: number) => void;
  onPriceChange: (value: string) => void;
  onMinOrderPriceChange: (value: string) => void;
  onSave: () => void;
}

const DeliveryRangeSettings: React.FC<DeliveryRangeSettingsProps> = ({
  cityName,
  deliveryRange,
  deliveryPriceInCents,
  minOrderPriceInCents,
  onRangeChange,
  onPriceChange,
  onMinOrderPriceChange,
  onSave
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {cityName} {t("deliveryRange")}: {deliveryRange} km
          </label>
        </div>
        <Slider 
          size="sm"
          step={1}
          minValue={1}
          maxValue={50}
          value={deliveryRange}
          onChange={(val) => onRangeChange(typeof val === 'number' ? val : val[0])}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t("deliveryDescription")}
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("deliveryPrice")}
        </label>
        <NumberInput
          min={0}
          step={0.5}
          value={(deliveryPriceInCents / 100)}
          onChange={(value) => {
            if (typeof value === "number") {
              onPriceChange(value.toString());
            } else {
              onPriceChange(value.target.value);
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
          step={0.5}
          value={(minOrderPriceInCents / 100)}
          onChange={(value) => {
            if (typeof value === "number") {
              onMinOrderPriceChange(value.toString());
            } else {
              onMinOrderPriceChange(value.target.value);
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

      <div className={'flex w-full justify-end'}>
        <Button
          color="secondary"
          onPress={onSave}
          size="sm"
          className="mt-2 shadow-small text-text"
        >
          {t("addCity")}
        </Button>
      </div>
    </div>
  );
};

export default DeliveryRangeSettings; 