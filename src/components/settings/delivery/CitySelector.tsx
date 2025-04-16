'use client';

import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { useTranslations } from "next-intl";

interface CitySelectorProps {
  cityOptions: string[];
  onCitySelect: (cityName: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ cityOptions, onCitySelect }) => {
  const [cityInput, setCityInput] = useState("");
  const t = useTranslations("app/(return_page)/settings/components/delivery-settings");

  const handleCitySelectionChange = (key: React.Key | null) => {
    if (!key) return;
    
    const selectedCityName = String(key);
    onCitySelect(selectedCityName);
    
    // Clear input after selection
    setCityInput("");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {t("selectDeliveryCity")}
      </label>
      <Autocomplete
        defaultItems={cityOptions.map(city => ({
          key: city,
          label: city,
        }))}
        inputValue={cityInput}
        onInputChange={setCityInput}
        onSelectionChange={handleCitySelectionChange}
        placeholder={t("selectCity")}
        className="w-full"
      >
        {(item) => (
          <AutocompleteItem key={item.key}>
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>
    </div>
  );
};

export default CitySelector; 