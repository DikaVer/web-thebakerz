/**
 * @fileoverview Country picker with a city/country delivery mode toggle.
 *
 * Exports the CountrySelector client component, which lists EU countries plus
 * Switzerland in an alphabetized Autocomplete and includes a switch to choose
 * between city-based and country-wide delivery, notifying the parent through
 * callbacks.
 */
'use client';

import React, { useMemo } from "react";
import { Autocomplete, AutocompleteItem, Switch } from "@heroui/react";
import { useTranslations } from "next-intl";
import { EU_COUNTRIES_PLUS_SWISS } from "@/lib/local-variables";

interface CountrySelectorProps {
  selectedCountry: string | null;
  isCountryDelivery: boolean;
  onCountrySelect: (country: string) => void;
  onDeliveryTypeChange: (isCountryDelivery: boolean) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  isCountryDelivery,
  onCountrySelect,
  onDeliveryTypeChange
}) => {
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  // Create country options from EU_COUNTRIES_PLUS_SWISS
  const countryOptions = useMemo(() => 
    Object.entries(EU_COUNTRIES_PLUS_SWISS)
      .map(([code, name]) => ({
        code,
        name
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const handleSelectionChange = (countryCode: string) => {
    onCountrySelect(countryCode);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          {t("selectCountry")}
        </label>
        
        <div className="flex items-center justify-between gap-2">
          <Autocomplete
            placeholder={t("selectCountryPlaceholder")}
            selectedKey={selectedCountry || ""}
            onSelectionChange={(key) => handleSelectionChange(key as string)}
            className="max-w-xs"
            defaultItems={countryOptions}
          >
            {(country) => (
              <AutocompleteItem key={country.code} textValue={country.name}>
                {country.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("cityDelivery")}</span>
            <Switch
              isSelected={isCountryDelivery}
              onValueChange={onDeliveryTypeChange}
              size="sm"
            />
            <span className="text-sm">{t("countryDelivery")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector; 