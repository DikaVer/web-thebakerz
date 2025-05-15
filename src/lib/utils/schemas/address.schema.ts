import * as z from 'zod';

// Regex patterns for validation
const zipCodePattern = /^[0-9A-Za-z\s-]{4,10}$/; // Generic pattern for EU postal codes

// Google Maps related constants
export const GOOGLE_MAPS_LIBRARIES = ['places'] as const;
export const COUNTRY_RESTRICTION = ['nl', 'be', 'de', 'fr', 'lu'] as const; // Allow all countries


// Dutch postal code regex: 4 digits followed by 2 letters (with or without space)
export const DUTCH_POSTAL_CODE_REGEX = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/;

export const AddressZodSchema = z.object({
  street: z.string()
    .min(2, { message: 'Street name is too short' })
    .max(100, { message: 'Street name is too long' })
    .refine(val => /^[a-zA-Z0-9\s\-\'\.]+$/.test(val), {
      message: 'Street name contains invalid characters'
    }).optional(),
  
  houseNumber: z.string()
    .min(1, { message: 'House number is required' })
    .max(20, { message: 'House number is too long' })
    .refine(val => /^[0-9]{1,5}[a-zA-Z]{0,2}$/.test(val), {
      message: 'Please enter a valid house number (digits with optional letters)'
    }).optional(),
  
  zipCode: z.string()
    .min(4, { message: 'Postal code is too short' })
    .max(10, { message: 'Postal code is too long' })
    .refine(val => zipCodePattern.test(val), {
      message: 'Please enter a valid postal code'
    })
    .transform(val => {
      // For Dutch postal codes, standardize format: 4 digits, space, 2 uppercase letters
      if (DUTCH_POSTAL_CODE_REGEX.test(val.replace(/\s+/g, ''))) {
        const cleaned = val.replace(/\s+/g, '');
        return `${cleaned.substring(0, 4)} ${cleaned.substring(4).toUpperCase()}`;
      }
      // For other countries, just trim whitespace and uppercase
      return val.trim().toUpperCase();
    }),
  
  city: z.string()
    .min(2, { message: 'City name is too short' })
    .max(100, { message: 'City name is too long' })
    .refine(val => /^[a-zA-Z\s\-\'\.]+$/.test(val), {
      message: 'City name contains invalid characters'
    }),
  
  additionalInfo: z.string()
    .max(100, { message: 'Additional information is too long' })
    .optional(),
    
  // Required fields
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  
  country: z.string().min(1, { message: 'Country is required' }),
  
  // Optional fields
  formattedAddress: z.string().optional(),
  placeId: z.string().optional(),
  administrativeAreas: z.array(z.string()).optional(),
  neighborhood: z.string().optional(),
  premise: z.string().optional(),
  subpremise: z.string().optional(),
  addressComponents: z.array(z.any()).optional()
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