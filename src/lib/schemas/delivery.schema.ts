import { z } from 'zod';
import { cityLatLngMap, EU_COUNTRIES_PLUS_SWISS } from '@/lib/local-variables';

// Schema for delivery schedule time
const DeliveryTimeSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59)
});

// Schema for delivery schedule day
const DeliveryScheduleDaySchema = z.object({
  isEnabled: z.boolean(),
  start: DeliveryTimeSchema,
  end: DeliveryTimeSchema
}).refine(
  (data) => {
    if (!data.isEnabled) return true;
    const startMinutes = data.start.hour * 60 + data.start.minute;
    const endMinutes = data.end.hour * 60 + data.end.minute;
    return startMinutes < endMinutes;
  },
  {
    message: "Start time must be before end time",
    path: ["start"]
  }
);

// Schema for delivery schedule - updated to match WorkHours interface
const DeliveryScheduleSchema = z.object({
  monday: DeliveryScheduleDaySchema,
  tuesday: DeliveryScheduleDaySchema,
  wednesday: DeliveryScheduleDaySchema,
  thursday: DeliveryScheduleDaySchema,
  friday: DeliveryScheduleDaySchema,
  saturday: DeliveryScheduleDaySchema,
  sunday: DeliveryScheduleDaySchema
});

// Schema for coordinates
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

// Schema for a delivery range
const DeliveryRangeSchema = z.object({
  range: z.number().min(1).max(100),
  deliveryPriceInCents: z.number().min(0),
  minOrderPriceInCents: z.number().min(1000, { message: "Minimum order price must be at least 10€" }),
});

// Schema for a single delivery region
const DeliveryRegionSchema = z.object({
  name: z.string()
    .refine(
      (val) => Object.keys(EU_COUNTRIES_PLUS_SWISS).includes(val) || Object.keys(cityLatLngMap).includes(val),
      { message: "Name must be a valid 2-letter country code or city name" }
    ),
  coordinates: CoordinatesSchema.optional(),
  deliverySchedule: DeliveryScheduleSchema,
  isStoreDelivery: z.boolean(), 
  isPostDelivery: z.boolean(),  // New field for post delivery
  minOrderTime: z.number().min(0, { message: "Minimum order time must be greater than 0" }),
  ranges: z.array(DeliveryRangeSchema).optional(),
  isCountry: z.boolean(), // Whether this is a country-wide delivery region
  deliveryPriceInCents: z.number().min(0).optional(),
  minOrderPriceInCents: z.number().min(1000, { message: "Minimum order price must be at least 10€" }).optional()
});

// Schema for the array of delivery regions
export const DeliveryRegionsSchema = z.array(DeliveryRegionSchema);