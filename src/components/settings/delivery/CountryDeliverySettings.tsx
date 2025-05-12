'use client';

import React from "react";
import { Button, Card, CardBody, NumberInput, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";

interface CountryDeliverySettingsProps {
  countryCode: string;
  countryName: string;
  deliveryPrice: number;
  minOrderPrice: number;
  deliveryWindow?: number;
  onDeliveryPriceChange: (value: string) => void;
  onMinOrderPriceChange: (value: string) => void;
  onDeliveryWindowChange: (value: number) => void;
  onSave: () => void;
}

const CountryDeliverySettings: React.FC<CountryDeliverySettingsProps> = ({
  countryCode,
  countryName,
  deliveryPrice,
  minOrderPrice,
  deliveryWindow , // Default to 1 day for postal, 15 min for regular
  onDeliveryPriceChange,
  onMinOrderPriceChange,
  onDeliveryWindowChange,
  onSave
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");


  // Generate delivery window options based on isPostDelivery
  const getDeliveryWindowOptions = () => {
      // For postal delivery: 1-15 days
      return Array.from({ length: 15 }, (_, i) => {
        const days = i + 1;
        return {
          value: days * 24 * 60, // Convert to minutes
          label: `${days} ${days === 1 ? t("day") : t("days")}`
        };
      });
  };

  const deliveryWindowOptions = getDeliveryWindowOptions();

  return (
    <Card shadow="none">
      <CardBody>
        <div className="text-md font-medium mb-4">
            {t("countryDeliveryFor")} {countryName} ({countryCode})
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium">
            {t("deliveryPrice")}
            </label>
            <NumberInput
            min={0}
            step={0.05}
            value={deliveryPrice / 100}
            onChange={(value) => {
                if (typeof value === "number") {
                    onDeliveryPriceChange(value.toString());
                } else {
                    onDeliveryPriceChange(value.target.value);
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
            value={minOrderPrice / 100}
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

        <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">
                {t("deliveryWindow") || "Delivery Window"}
            </label>
            <Select
                placeholder={t("selectDeliveryWindow") || "Select Delivery Window"}
                selectedKeys={[deliveryWindow?.toString() || "all"]}
                onChange={(e) => onDeliveryWindowChange(parseInt(e.target.value))}
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
        
        <Button
            color="secondary"
            onPress={onSave}
            size="sm"
            className="mt-2 shadow-small text-white"
        >
            {t("addCountry")}
        </Button>
      </CardBody>
    </Card>
  );
};

export default CountryDeliverySettings; 