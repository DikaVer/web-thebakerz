import * as z from 'zod';

// Regex patterns for validation
const zipCodePattern = /^[0-9]{4}\s?[A-Za-z]{2}$/; // Dutch postal code format: 4 digits followed by 2 letters

// Google Maps related constants
export const GOOGLE_MAPS_LIBRARIES = ['places'] as const;
export const COUNTRY_RESTRICTION = ['nl']; // Netherlands

// Dutch postal code regex: 4 digits followed by 2 letters (with or without space)
export const DUTCH_POSTAL_CODE_REGEX = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/;

export const AddressZodSchema = z.object({
  street: z.string()
    .min(2, { message: 'Street name is too short' })
    .max(100, { message: 'Street name is too long' })
    .refine(val => /^[a-zA-Z0-9\s\-\'\.]+$/.test(val), {
      message: 'Street name contains invalid characters'
    }),
  
  houseNumber: z.string()
    .min(1, { message: 'House number is required' })
    .max(20, { message: 'House number is too long' })
    .refine(val => /^[0-9]{1,5}[a-zA-Z]{0,2}$/.test(val), {
      message: 'Please enter a valid house number (digits with optional letters)'
    }),
  
  zipCode: z.string()
    .min(6, { message: 'Postal code is too short' })
    .max(7, { message: 'Postal code is too long' })
    .refine(val => zipCodePattern.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid postal code (e.g., 1234 AB)'
    })
    .transform(val => {
      // Standardize format: 4 digits, space, 2 uppercase letters
      const cleaned = val.replace(/\s+/g, '');
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4).toUpperCase()}`;
    }),
  
  city: z.string()
    .min(2, { message: 'City name is too short' })
    .max(100, { message: 'City name is too long' })
    .refine(val => /^[a-zA-Z\s\-\'\.]+$/.test(val), {
      message: 'City name contains invalid characters'
    }),
  
  additionalInfo: z.string()
    .max(100, { message: 'Additional information is too long' })
    .optional()
});

// --- Constants ---
export const MAX_CHARS_ADDRESS = {
  street: 100,
  houseNumber: 20,
  city: 100,
  zipCode: 20,
  additionalInfo: 1000,
  formattedAddress: 200,
};

export type ValidatedAddress = z.infer<typeof AddressZodSchema>; 