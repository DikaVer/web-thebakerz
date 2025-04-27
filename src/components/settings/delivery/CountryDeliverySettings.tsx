'use client';

import React from "react";
import { Button, Card, CardBody, NumberInput } from "@heroui/react";
import { useTranslations } from "next-intl";

interface CountryDeliverySettingsProps {
  countryCode: string;
  countryName: string;
  deliveryPrice: number;
  minOrderPrice: number;
  onDeliveryPriceChange: (value: string) => void;
  onMinOrderPriceChange: (value: string) => void;
  onSave: () => void;
}

const CountryDeliverySettings: React.FC<CountryDeliverySettingsProps> = ({
  countryCode,
  countryName,
  deliveryPrice,
  minOrderPrice,
  onDeliveryPriceChange,
  onMinOrderPriceChange,
  onSave
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  return (
    <Card>
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
        
        <Button
            color="secondary"
            onPress={onSave}
            size="sm"
            className="mt-2 shadow-small text-text"
        >
            {t("addCountry")}
        </Button>
      </CardBody>
    </Card>
  );
};

export default CountryDeliverySettings; 