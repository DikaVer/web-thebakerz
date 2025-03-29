"use client";

import React, { useState, useEffect } from "react";
import {
  Input,
  Textarea,
  Button,
  Progress,
} from "@heroui/react";
import { AddressForm as AddressFormType } from "@/hooks/use-address-validation";
import { useTranslations } from "next-intl";
import { AddressZodSchema } from "@/lib/schemas/address.schema";
import { ZodError } from "zod";

// Maximum character limits for each field
const MAX_CHARS = {
  street: 100,
  houseNumber: 20,
  city: 100,
  zipCode: 20,
  additionalInfo: 100
};

interface AddressFormProps {
  initialAddress?: AddressFormType;
  onSubmit: (address: AddressFormType) => Promise<void> | void;
  isValidating: boolean;
  validationError?: string;
}

export function AddressForm({
  initialAddress,
  onSubmit,
  isValidating,
  validationError,
}: AddressFormProps) {
  const t = useTranslations("app/(store)/components/store-subheader");
  const [address, setAddress] = useState<AddressFormType>({
    street: "",
    houseNumber: "",
    city: "",
    zipCode: "",
    additionalInfo: "",
    ...initialAddress,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormType, string>>>({});

  // Update local state if initialAddress changes
  useEffect(() => {
    if (initialAddress) {
      setAddress(prev => ({
        ...prev,
        ...initialAddress
      }));
    }
  }, [initialAddress]);

  const validateField = (field: keyof AddressFormType, value: string) => {
    try {
      // Create an object with just this field for partial validation
      const partialData = { [field]: value } as any;
      
      // Use pick to create a schema for just this field
      const fieldSchema = AddressZodSchema.pick({ 
        [field]: true 
      } as Record<keyof typeof AddressZodSchema.shape, true>);
      
      // Validate just this field
      fieldSchema.parse(partialData);
      return ""; // Valid
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract the error message for this field
        const fieldError = error.errors.find(e => e.path[0] === field);
        if (fieldError) {
          return fieldError.message;
        }
      }
      // Fallback to simple length validation
      const maxLength = MAX_CHARS[field as keyof typeof MAX_CHARS];
      if (value.length > maxLength) {
        return t("maxCharsExceeded", { field: t(field), max: maxLength });
      }
      return "";
    }
  };

  const handleInputChange = (field: keyof AddressFormType, value: string) => {
    // Update the address state first
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Then validate and update errors
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    try {
      // Validate the entire form with Zod
      AddressZodSchema.parse(address);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert Zod errors to our error format
        const newErrors: Partial<Record<keyof AddressFormType, string>> = {};
        
        error.errors.forEach(err => {
          const field = err.path[0] as keyof AddressFormType;
          newErrors[field] = err.message;
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            isDisabled={isValidating}
            label={t("street")}
            placeholder={t("enterStreet")}
            value={address.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
            isRequired
            variant="bordered"
            maxLength={MAX_CHARS.street}
            isInvalid={!!errors.street || !!validationError}
            errorMessage={errors.street}
          />
        </div>
        <div className="w-1/3">
          <Input
            isDisabled={isValidating}
            label={t("houseNumber")}
            placeholder={t("enterHouseNumber")}
            value={address.houseNumber}
            onChange={(e) => handleInputChange("houseNumber", e.target.value)}
            isRequired
            variant="bordered"
            maxLength={MAX_CHARS.houseNumber}
            isInvalid={!!errors.houseNumber || !!validationError}
            errorMessage={errors.houseNumber}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="w-1/3">
          <Input
            isDisabled={isValidating}
            label={t("zipCode")}
            placeholder={t("enterZipCode")}
            value={address.zipCode}
            onChange={(e) => handleInputChange("zipCode", e.target.value)}
            isRequired
            variant="bordered"
            maxLength={MAX_CHARS.zipCode}
            isInvalid={!!errors.zipCode || !!validationError}
            errorMessage={errors.zipCode}
          />
        </div>
        <div className="flex-1">
          <Input
            isDisabled={isValidating}
            label={t("city")}
            placeholder={t("enterCity")}
            value={address.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            isRequired
            variant="bordered"
            maxLength={MAX_CHARS.city}
            isInvalid={!!errors.city || !!validationError}
            errorMessage={errors.city}
          />
        </div>
      </div>

      <Textarea
        isDisabled={isValidating}
        label={t("additionalInfo")}
        placeholder={t("enterAdditionalInfo")}
        value={address.additionalInfo}
        onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
        variant="bordered"
        maxLength={MAX_CHARS.additionalInfo}
        isInvalid={!!errors.additionalInfo}
        errorMessage={errors.additionalInfo}
        description={`${address.additionalInfo?.length || 0}/${MAX_CHARS.additionalInfo}`}
      />

      {validationError && (
        <div className="text-danger text-sm mt-1">
          {validationError}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button 
          type="submit" 
          color="primary" 
          isLoading={isValidating}
          isDisabled={isValidating || Object.values(errors).some(error => !!error)}
        >
          {t("confirm")}
        </Button>
      </div>
    </form>
  );
}